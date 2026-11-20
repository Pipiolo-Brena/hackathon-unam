"""Agente analista para Coaches y Scouts NFL con Strands + Amazon Nova (Bedrock) y respaldo local sin IA.

Todas las herramientas filtran los JSON ya cargados en memoria (backend.data_store); no leen CSV.
Credenciales: boto3 las toma solas del entorno (en local, del .env que carga main.py;
en AWS, del rol de la tarea). Este módulo no lee ni valida llaves.
"""
import json
import os
import re

from strands import Agent, tool
from strands.models import BedrockModel

from backend import data_store as ds

# ------------------------------------------------------------------ parámetros de validación
SEP_MIN_YD, SEP_MAX_YD = 1.0, 12.0   # fuera de este rango: artefacto o jugada no representativa
SEP_TRAP_YD = 3.5
TRAP_BAND = (4.5, 6.5)               # yd: separación típica de una trampa completa (mediana 5.7)
OBSERVED_ARRIVALS = {"pass_arrived", "pass_outcome_caught", "cruce_observado", "ball_min_speed"}
HIP_HIGH_DEG = 150.0                 # giro de cadera alto en Man
SEP_WEAK_YD = 3.0                    # separación permitida que convierte un giro alto en debilidad
PLAY_TOOL = "search_featured_plays"
PRESSURE_WORDS = ("presi", "blitz", "sack", "trampa", "checkdown", "bolsa", "rush", "hurry")
PRESSURE_DIMS = ("presion_vs_no", "por_tiempo_bolsa")
RANKING_KEYS = ("receptores_soe_wr_te", "receptores_soe_rb_fb", "defensores_hip_flip_man",
                "receptores_hip_flip_inducido_man")


# ------------------------------------------------------------------ prompt (cifras desde el JSON)
def _reality() -> str:
    """Párrafo con la realidad de las 8,557 jugadas, leído de insights para no desalinearse del pipeline."""
    ins = ds.insights()
    pv, tb, t = ins["reglas"]["presion_vs_no"], ins["reglas"]["por_tiempo_bolsa"], ins["trampa_presion"]
    con, sin = pv["1"], pv["0"]
    return (f"REALIDAD DE LAS {ins['kpis']['jugadas']:,} JUGADAS (úsala como marco, cítala con estas cifras):\n"
            f"- Bajo presión la separación promedio del objetivo se comprime ligeramente: {con['sep_objetivo']:.2f} yd "
            f"vs. {sin['sep_objetivo']:.2f} yd sin presión. El receptor sigue pareciendo abierto.\n"
            f"- Pero el quarterback cae en la Trampa de Presión: en el {t['pct_de_jugadas_con_presion']}% de las jugadas "
            f"presionadas lanza a un receptor con más de {SEP_TRAP_YD} yd de separación y aun así no alcanza el primer "
            f"down (faltan {t['yardas_faltantes_promedio']:.2f} yd en promedio). Las yardas caen de {sin['yds']:.2f} yd "
            f"sin presión a {con['yds']:.2f} yd con presión.\n"
            f"- Reloj de bolsa: después de 4.0 s la presión se dispara al {tb['>4']['presion'] * 100:.1f}% "
            f"(vs. {tb['<=2.0']['presion'] * 100:.1f}% lanzando en 2.0 s o menos).")


_BASE_PROMPT = """Eres un analista de élite para Coaches y Scouts de la NFL. Tu público son coordinadores \
ofensivos/defensivos y evaluadores de talento: responde en español, directo y técnico, sin lenguaje de televisión.

DATOS: 8,557 jugadas de pase (122 juegos, semanas 1-8, temporada 2021) con tracking normalizado y scouting PFF.
Métricas propias:
- SOE (Separación Sobre lo Esperado, yd): separación del receptor objetivo frente al defensor más cercano en la \
llegada del balón, menos la media de su (cobertura, zona del campo). get_player_rankings la separa por grupo: \
receptores_soe_wr_te (líderes reales) y receptores_soe_rb_fb (checkdowns, no comparables con WR/TE).
- hip_flip_deg (0-180): máxima diferencia |o - dir| del defensor en cobertura más cercano al objetivo, entre el \
snap y la llegada. Es el giro de cadera que SUFRE el defensor. Los rankings están calculados SOLO en cobertura Man \
(sin backpedal de zona): defensores_hip_flip_man = defensores obligados a girar en duelos 1 contra 1; \
receptores_hip_flip_inducido_man = WR/TE que obligan a su defensor a girar.
- Trampa de Presión: presión PFF, separación del objetivo > 3.5 yd y aun así playResult < yardsToGo.

PROTOCOLO OBLIGATORIO (el servidor lo verifica y rechaza la respuesta si falta algo):
1. get_rules con dimension="presion_vs_no" Y otra llamada con dimension="por_tiempo_bolsa" (en temas de presión o \
bolsa ambas son obligatorias; puedes añadir por_cobertura, por_tipo_cobertura o por_down).
2. get_pressure_trap (temas de presión, separación bajo presión, bolsa, checkdowns) o get_clusters (tendencias).
3. get_player_rankings con metric="todos".
4. CIERRA con search_featured_plays: debe ser tu última herramienta. Elige una jugada de su lista "jugadas".
No inventes cifras: usa solo las que devolvieron las herramientas.

FORMATO DEL CAMPO "reply" (tres secciones separadas por \\n):
1. Diagnóstico Táctico (Coach): contrasta "Ilusión Tradicional vs. Realidad de Tracking" con TRES comparaciones: \
(a) sep_objetivo con vs. sin presión frente a yds con vs. sin presión; (b) % de jugadas presionadas en la Trampa \
y yardas faltantes; (c) presion del tramo ">4" vs. "<=2.0" de por_tiempo_bolsa. Cierra con el ajuste concreto que \
debe ordenar el coordinador.
2. Evaluación de Talento (Scout): cita AL MENOS 2 jugadores de get_player_rankings con nombre, posición, equipo, n \
y sus cifras exactas de SOE (yd) y hip_flip_deg (°) (cada fila trae ambas: "soe" y "hip_flip"). Usa \
receptores_soe_wr_te y defensores_hip_flip_man. Explica la ventaja de separación o biomecánica (transición de \
cadera, orientación vs. dirección) que generan o sufren.
   REGLA PARA DEFENSORES: un hip_flip alto en un CB en Man NO es automáticamente debilidad; girar la cadera es la \
transición normal en un duelo. Evalúa SIEMPRE el giro junto a sep_allowed_yd frente a sep_allowed_base_man_yd y \
respeta el campo evaluacion_hip_flip: "recuperacion_elite" (giro > 150° y permite menos separación que la base Man: \
gira y aun así se queda pegado, velocidad de recuperación élite), "debilidad" (giro > 150° y permite más de 3.0 yd: \
el receptor se le escapa en la transición), "neutral" (resto). Cita la cifra de sep_allowed_yd y la base.
3. Evidencia en Cancha (Tracking 2D): qué observar al reproducir la jugada recomendada: receptor objetivo \
(target_name), defensor en cobertura (cov_def_name), momento (snap, lanzamiento, llegada), separación en yd.

SALIDA: responde SOLO con un JSON válido, sin texto adicional ni bloques de código:
{"reply": "1. Diagnóstico Táctico (Coach): ...\\n2. Evaluación de Talento (Scout): ...\\n3. Evidencia en Cancha (Tracking 2D): ...", \
"recommended_play": {"gameId": <gameId real>, "playId": <playId real>, "reason": "<motivo concreto con cifras de esa jugada>"}}"""

_MODE_PROMPT = {
    "coach": """ÉNFASIS (modo coach): profundiza en el bloque 1: coberturas (Man vs. Zone, Cover-1 vs. Cover-3), \
reloj de la bolsa por tramos y presión por down. El bloque 2 puede ser más breve, con el mínimo de 2 jugadores.""",
    "scout": """ÉNFASIS (modo scout): profundiza en el bloque 2: SOE en yd y ángulos |o - dir| en grados de 3 o más \
jugadores, comparados con la base Man (base_hip_flip), y la mecánica de cada duelo.""",
}


def system_prompt(mode: str) -> str:
    return "\n\n".join([_BASE_PROMPT, _reality(), _MODE_PROMPT.get(mode, _MODE_PROMPT["coach"])])


def _j(o) -> str:
    return json.dumps(o, ensure_ascii=False)


def _r(v, nd=2):
    return None if v is None else round(float(v), nd)


# ------------------------------------------------------------------ filtros sobre el JSON en memoria
def _sep_ok(p: dict) -> bool:
    s = p.get("sep_target_arrival_yd")
    return s is not None and SEP_MIN_YD <= s <= SEP_MAX_YD


def _pattern(tag: str, p: dict) -> bool:
    if tag == "trampa_presion":
        return p.get("presion") == 1 and (p.get("playResult") or 0) < (p.get("yardsToGo") or 0)
    if tag == "soe":
        return (p.get("SOE") or 0) > 0
    if tag == "hip_flip":
        return p.get("hip_flip_deg") is not None
    if tag == "explosiva":
        return (p.get("prePenaltyPlayResult") or 0) >= 15
    return True


def _priority(tag: str):
    def trampa(p):
        """Igual que el pipeline: completo corto > llegada observada > banda típica > cercanía al centro."""
        short = (p.get("playResult") or 0) < (p.get("yardsToGo") or 0)
        tier = 0 if short and p.get("passResult") == "C" else 1 if short else 2
        sep = p.get("sep_target_arrival_yd") or 0
        return (tier, p.get("arrival_source") not in OBSERVED_ARRIVALS,
                not (TRAP_BAND[0] <= sep <= TRAP_BAND[1]), abs(sep - sum(TRAP_BAND) / 2))

    keys = {
        "trampa_presion": trampa,
        "soe": lambda p: (p.get("passResult") != "C", -(p.get("SOE") or -99)),
        "hip_flip": lambda p: (p.get("pff_passCoverageType") != "Man", -(p.get("hip_flip_deg") or 0)),
        "explosiva": lambda p: (-(p.get("prePenaltyPlayResult") or 0),),
    }
    return keys.get(tag, lambda p: (p.get("passResult") != "C", -(p.get("SOE") or 0)))


def select_plays(tag: str = "", coverage: str = "", team: str = "", cluster_id: int = -1) -> dict:
    base = ds.filter_plays(cluster_id if cluster_id >= 0 else None, coverage or None, team or None, None)
    valid = [p for p in base if _sep_ok(p)]
    tag = (tag or "").strip().lower()
    chosen = [p for p in valid if tag in p.get("tags", [])] if tag else valid
    relajado = False
    if tag and not chosen:
        chosen = [p for p in valid if _pattern(tag, p)]
        relajado = True
    return {"jugadas": sorted(chosen, key=_priority(tag)),
            "descartadas_por_artefacto": len(base) - len(valid), "patron_relajado": relajado}


def man_sep_base() -> float:
    """Separación media permitida en cobertura Man (todas las jugadas Man con pase lanzado)."""
    return float(ds.insights()["reglas"]["por_tipo_cobertura"]["Man"]["sep_objetivo"])


def hip_flip_eval(hip: float | None, sep_allowed: float | None, base: float) -> str:
    """Lectura táctica del giro de cadera de un defensor en Man según la separación que permite."""
    if hip is None or sep_allowed is None:
        return "sin_datos"
    if hip > HIP_HIGH_DEG and sep_allowed < base:
        return "recuperacion_elite"     # gira mucho y aun así se queda pegado al receptor
    if hip > HIP_HIGH_DEG and sep_allowed > SEP_WEAK_YD:
        return "debilidad"              # gira mucho y el receptor se le escapa
    return "neutral"


def _rank_rows(rows: list[dict], defensive: bool = False, base: float = 0.0) -> list[dict]:
    out = []
    for x in rows:
        d = {"jugador": x.get("displayName"), "pos": x.get("officialPosition"), "equipo": x.get("team"),
             "n": x.get("n"), "valor": _r(x.get("valor")), "soe": _r(x.get("soe")),
             "hip_flip": _r(x.get("hip_flip"), 1), "yds_prom": _r(x.get("yds"))}
        if defensive:
            sep = x.get("sep_objetivo")
            d["sep_allowed_yd"] = _r(sep)
            d["sep_allowed_vs_man_yd"] = _r(None if sep is None else sep - base)
            d["evaluacion_hip_flip"] = hip_flip_eval(x.get("hip_flip"), sep, base)
        else:
            d["sep_objetivo_yd"] = _r(x.get("sep_objetivo"))
        out.append(d)
    return out


def player_rankings(metric: str = "todos") -> dict:
    rk = ds.insights()["rankings"]
    keys = RANKING_KEYS if metric == "todos" else (metric,) if metric in RANKING_KEYS else ()
    if not keys:
        return {"error": f"metric: todos, {', '.join(RANKING_KEYS)}"}
    base = man_sep_base()
    out = {k: _rank_rows(rk.get(k, []), defensive=(k == "defensores_hip_flip_man"), base=base) for k in keys}
    out["base_hip_flip_deg"] = {k: _r(v, 1) for k, v in rk.get("base_hip_flip", {}).items()}
    out["sep_allowed_base_man_yd"] = _r(base)
    out["min_targets"] = rk.get("min_jugadas")
    out["nota"] = ("valor = métrica del ranking (SOE en yd para receptores_soe_*, hip_flip en ° para *_hip_flip_*). "
                   "hip_flip solo en cobertura Man. RB/FB se reportan aparte: no compararlos con WR/TE. "
                   f"Defensores: sep_allowed_yd = separación media que permiten (base Man {base:.2f} yd); "
                   f"evaluacion_hip_flip: recuperacion_elite (hip > {HIP_HIGH_DEG:.0f}° y sep < base), "
                   f"debilidad (hip > {HIP_HIGH_DEG:.0f}° y sep > {SEP_WEAK_YD} yd), neutral (resto).")
    return out


# ------------------------------------------------------------------ herramientas
@tool
def get_kpis() -> str:
    """Línea base de las 8,557 jugadas: yardas promedio, tasa de presión, explosivas, completos, sacks,
    tiempo medio para lanzar, separación del objetivo, quiebre de cadera promedio y tasa de Trampa de Presión."""
    return _j(ds.insights()["kpis"])


@tool
def get_rules(dimension: str = "presion_vs_no") -> str:
    """OBLIGATORIA. En temas de presión o bolsa llámala DOS veces: dimension="presion_vs_no" y
    dimension="por_tiempo_bolsa". Por grupo devuelve: n, yds, explosiva, presion, t_throw, sep_objetivo,
    soe, hip_flip y trampa. Otras dimensiones: por_cobertura, por_tipo_cobertura, por_down, por_formacion,
    por_play_action, por_zona_campo, por_resultado, correlaciones_playResult."""
    reglas = ds.insights()["reglas"]
    return _j(reglas.get(dimension, {"error": f"usa una de {list(reglas)}"}))


@tool
def get_clusters() -> str:
    """Ejecutar SIEMPRE ante consultas de tendencias, tipos de jugada o esquemas (si el tema no es presión).
    Devuelve los 4 arquetipos K-Means con tamaño, centroides reales, tasa explosiva, sacks, SOE y trampa."""
    k4 = ds.insights()["clusters"]["k4"]
    return _j([{k: c[k] for k in ("cluster", "etiqueta", "n", "pct", "centroide_real", "tasa_explosiva",
                                  "tasa_sack", "soe_promedio", "tasa_trampa")} for c in k4["clusters"]])


@tool
def get_player_rankings(metric: str = "todos") -> str:
    """OBLIGATORIA en toda respuesta. Usa metric="todos". Top 15 (mínimo 15 targets) con nombre, posición,
    equipo, n, valor del ranking y, en cada fila, soe (yd) y hip_flip (°):
    receptores_soe_wr_te (líderes de separación reales), receptores_soe_rb_fb (checkdowns, aparte),
    defensores_hip_flip_man (defensores obligados a girar la cadera en cobertura Man),
    receptores_hip_flip_inducido_man (WR/TE que obligan a girar a su defensor en Man)."""
    return _j(player_rankings(metric))


@tool
def get_pressure_trap() -> str:
    """OBLIGATORIA ante consultas sobre presión, blitz, separación bajo presión, checkdowns o bolsa.
    Trampa de Presión = presión PFF + separación del objetivo > 3.5 yd + no se logra el primer down.
    Devuelve n, % sobre jugadas con presión, yardas, yardas faltantes, completos y desglose por resultado,
    down, cobertura y equipo ofensivo."""
    return _j(ds.insights()["trampa_presion"])


@tool
def search_featured_plays(tag: str = "", coverage: str = "", team: str = "", cluster_id: int = -1,
                          limit: int = 5) -> str:
    """ÚLTIMA herramienta: usar ÚNICAMENTE AL FINAL para elegir UNA jugada real con tracking 2D que respalde el
    análisis. Solo devuelve jugadas con separación entre 1 y 12 yd, ordenadas por representatividad (en
    trampa_presion: pases completos que quedaron cortos del primer down).
    tag: trampa_presion, explosiva, soe, hip_flip. coverage: p. ej. Cover-1. team: abreviatura (KC, BUF).
    cluster_id: 0-3 o -1 para todos."""
    res = select_plays(tag, coverage, team, cluster_id)
    keys = ("gameId", "playId", "possessionTeam", "defensiveTeam", "down", "yardsToGo", "playResult",
            "passResult", "pff_passCoverage", "pff_passCoverageType", "time_to_throw_s", "presion",
            "sep_target_arrival_yd", "SOE", "hip_flip_deg", "cluster_label", "target_name", "cov_def_name",
            "arrival_source", "tags", "playDescription")
    res["jugadas"] = [{k: p.get(k) for k in keys} for p in res["jugadas"][: max(1, min(limit, 10))]]
    res["filtro"] = f"{SEP_MIN_YD} <= sep_target_arrival_yd <= {SEP_MAX_YD}"
    return _j(res)


TOOLS = [get_kpis, get_rules, get_clusters, get_player_rankings, get_pressure_trap, search_featured_plays]


# ------------------------------------------------------------------ verificación del protocolo
def _tool_calls(agent: Agent) -> list[tuple[str, dict]]:
    calls = []
    for m in getattr(agent, "messages", []) or []:
        for c in m.get("content", []) if isinstance(m, dict) else []:
            if isinstance(c, dict) and "toolUse" in c:
                tu = c["toolUse"]
                calls.append((tu.get("name"), tu.get("input") or {}))
    return calls


def _is_pressure(message: str) -> bool:
    msg = message.lower()
    return any(w in msg for w in PRESSURE_WORDS)


def protocol_gaps(calls: list[tuple[str, dict]], message: str) -> list[str]:
    names = [n for n, _ in calls]
    used = set(names)
    dims = {(inp.get("dimension") or "presion_vs_no") for n, inp in calls if n == "get_rules"}
    gaps = []
    if "get_rules" not in used:
        gaps.append("get_rules (obligatoria)")
    if "get_player_rankings" not in used:
        gaps.append('get_player_rankings(metric="todos") (obligatoria)')
    if _is_pressure(message):
        gaps += [f'get_rules(dimension="{d}") (obligatoria en temas de presión/bolsa)' for d in PRESSURE_DIMS
                 if d not in dims and "get_rules" in used]
        if "get_pressure_trap" not in used:
            gaps.append("get_pressure_trap (obligatoria en temas de presión/bolsa)")
    elif not used & {"get_pressure_trap", "get_clusters"}:
        gaps.append("get_pressure_trap o get_clusters (según el tema)")
    if PLAY_TOOL not in used:
        gaps.append(f"{PLAY_TOOL} (cierre obligatorio)")
    elif names[-1] != PLAY_TOOL:
        gaps.append(f"{PLAY_TOOL} debe ser la ÚLTIMA herramienta (después la llamaste a {names[-1]})")
    return gaps


def _extract_json(text: str) -> dict | None:
    for m in reversed(list(re.finditer(r"\{.*\}", text, re.DOTALL))):
        try:
            return json.loads(m.group(0))
        except json.JSONDecodeError:
            continue
    return None


def _valid_play(rp) -> dict | None:
    """Acepta la jugada solo si existe entre las destacadas y su separación es realista."""
    if not isinstance(rp, dict):
        return None
    try:
        p = ds.find_play(int(rp.get("gameId")), int(rp.get("playId")))
    except (TypeError, ValueError):
        return None
    if p is None or not _sep_ok(p):
        return None
    reason = str(rp.get("reason") or "").strip()
    if len(reason) < 15 or reason.startswith("<") or "respalda el análisis" in reason:  # plantilla copiada
        reason = (f"{p.get('cluster_label')}: {p.get('target_name') or 'objetivo'} a "
                  f"{p.get('sep_target_arrival_yd') or 0:.2f} yd de {p.get('cov_def_name') or 'su defensor'}, "
                  f"{p.get('playResult')} yd con {p.get('yardsToGo')} por avanzar ({p.get('pff_passCoverage')}).")
    return {"gameId": p["gameId"], "playId": p["playId"], "reason": reason}


def _play_check(rp: dict) -> dict:
    p = ds.find_play(rp["gameId"], rp["playId"]) or {}
    return {"sep_target_arrival_yd": _r(p.get("sep_target_arrival_yd")), "realista": _sep_ok(p),
            "passResult": p.get("passResult"), "playResult": p.get("playResult"), "yardsToGo": p.get("yardsToGo"),
            "target_name": p.get("target_name"), "arrival_source": p.get("arrival_source"),
            "playDescription": (p.get("playDescription") or "")[:120]}


def _topic_tag(message: str) -> str:
    msg = message.lower()
    if _is_pressure(msg):
        return "trampa_presion"
    if any(w in msg for w in ("cadera", "hip", "flip", "defensor")):
        return "hip_flip"
    if any(w in msg for w in ("separa", "soe", "receptor", "abierto")):
        return "soe"
    return "explosiva"


# ------------------------------------------------------------------ respaldo local
def local_answer(message: str, mode: str = "coach") -> dict:
    """Respuesta sin IA con el mismo formato, filtros y cifras."""
    ins = ds.insights()
    tag = _topic_tag(message)
    coverage = next((c for c in ins["reglas"]["por_cobertura"] if c.lower() in message.lower()), "")
    plays = select_plays(tag, coverage)["jugadas"] or select_plays(tag)["jugadas"] or select_plays()["jugadas"]
    play = plays[0]
    diag = (_reality().split("\n", 1)[1].replace("\n- ", " ").lstrip("- ")
            + " Ajuste: checkdowns que corten en el marcador de primer down y lectura caliente antes de 4 s.")
    rk = player_rankings("todos")
    rec = rk["receptores_soe_wr_te"][:2]
    dbs = rk["defensores_hip_flip_man"][:2]
    lectura = {"recuperacion_elite": "velocidad de recuperación élite", "debilidad": "se le escapa en la transición",
               "neutral": "transición normal", "sin_datos": "sin datos suficientes"}
    fmt = lambda x: (f"{x['jugador']} ({x['pos']}, {x['equipo']}, n={x['n']}): SOE {x['soe']:+.2f} yd, "  # noqa: E731
                     f"hip flip {x['hip_flip']:.1f}°")
    scout = ("Receptores WR/TE: " + "; ".join(fmt(x) for x in rec)
             + f". Defensores en Man (separación media permitida en Man {rk['sep_allowed_base_man_yd']:.2f} yd): "
             + "; ".join(f"{x['jugador']} ({x['pos']}, {x['equipo']}, n={x['n']}): hip flip {x['hip_flip']:.1f}° "
                         f"permitiendo {x['sep_allowed_yd']:.2f} yd, {lectura[x['evaluacion_hip_flip']]}" for x in dbs)
             + ".")
    ev = (f"En {play['gameId']}/{play['playId']}, sigue a {play.get('target_name') or 'el receptor objetivo'} desde el snap "
          f"hasta la llegada y mide su distancia a {play.get('cov_def_name') or 'el defensor más cercano'} "
          f"(separación {play.get('sep_target_arrival_yd') or 0:.2f} yd, {play.get('playResult')} yd con "
          f"{play.get('yardsToGo')} por avanzar).")
    reply = (f"1. Diagnóstico Táctico (Coach): {diag}\n2. Evaluación de Talento (Scout): {scout}\n"
             f"3. Evidencia en Cancha (Tracking 2D): {ev}")
    rp = {"gameId": play["gameId"], "playId": play["playId"],
          "reason": f"{play.get('cluster_label')} | {play.get('playDescription', '')[:140]}"}
    return {"reply": reply, "recommended_play": rp, "source": "local", "recommended_play_check": _play_check(rp)}


def chat(message: str, mode: str = "coach") -> dict:
    # Se lee en cada llamada: main.py ya cargó el .env en os.environ antes de llegar aquí.
    model_id = os.environ.get("BEDROCK_MODEL_ID", "us.amazon.nova-pro-v1:0")
    region = os.environ.get("AWS_REGION", "us-east-1")
    audiencia = "Scout (evaluación de talento)" if mode == "scout" else "Coach (coordinador)"
    reintento = False
    try:
        agent = Agent(model=BedrockModel(model_id=model_id, region_name=region), tools=TOOLS,
                      system_prompt=system_prompt(mode), callback_handler=None)
        text = str(agent(f"[Audiencia principal: {audiencia}] {message}"))
        gaps = protocol_gaps(_tool_calls(agent), message)
        if gaps:  # reintento único indicando exactamente qué faltó
            reintento = True
            text = str(agent("Respuesta rechazada por el servidor. Te faltó: " + "; ".join(gaps)
                             + ". Ejecuta exactamente esas herramientas (search_featured_plays al final) y vuelve "
                               "a responder SOLO con el JSON en el formato de tres secciones."))
    except Exception as e:  # sin credenciales, sin red o Bedrock caído -> respaldo local
        out = local_answer(message, mode)
        out["fallback_reason"] = f"{type(e).__name__}: {str(e)[:300]}"
        return out
    calls = _tool_calls(agent)
    gaps = protocol_gaps(calls, message)
    parsed = _extract_json(text) or {}
    reply = parsed.get("reply") or text.strip()
    rp = _valid_play(parsed.get("recommended_play"))
    play_reemplazada = rp is None
    if rp is None:  # jugada inexistente o artefacto -> la más representativa del tema
        rp = local_answer(message, mode)["recommended_play"]
    seq = [n if n != "get_rules" else f"get_rules({i.get('dimension') or 'presion_vs_no'})" for n, i in calls]
    return {"reply": reply, "recommended_play": rp, "source": "bedrock", "model": model_id, "mode": mode,
            "tools_used": sorted({n for n, _ in calls}), "tool_sequence": seq, "protocolo_ok": not gaps,
            "protocolo_faltas": gaps, "reintento": reintento, "recommended_play_reemplazada": play_reemplazada,
            "recommended_play_check": _play_check(rp)}
