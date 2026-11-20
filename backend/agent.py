"""Agente táctico con Strands + Amazon Nova (Bedrock) y respaldo local sin IA.

Credenciales: boto3 las toma solas del entorno (en local, del .env que carga main.py;
en AWS, del rol de la tarea). Este módulo no lee ni valida llaves.
"""
import json
import os
import re

from strands import Agent, tool
from strands.models import BedrockModel

from backend import data_store as ds

SYSTEM_PROMPT = """Eres analista táctico NFL para un Coach y un Broadcaster. Responde en español, claro y breve.
Usa SIEMPRE las herramientas para obtener números; no inventes datos. Métricas propias:
- SOE (Separación Sobre lo Esperado): separación del receptor objetivo al llegar el balón menos la media de su cobertura y zona del campo.
- hip_flip_deg: máxima diferencia |orientación - dirección| (0-180) del defensor en cobertura más cercano al objetivo.
- Trampa de Presión: presión PFF, separación > 3.5 yd y aun así no se logra el primer down.
Tu respuesta final debe ser SOLO un JSON válido con esta forma:
{"reply": "explicación táctica", "recommended_play": {"gameId": 0, "playId": 0, "reason": "por qué ver esta jugada"}}
recommended_play debe ser una jugada devuelta por search_featured_plays."""


def _j(o) -> str:
    return json.dumps(o, ensure_ascii=False)


@tool
def get_kpis() -> str:
    """KPIs globales de la temporada (yardas, presión, explosivas, tiempo para lanzar, SOE, trampa)."""
    return _j(ds.insights()["kpis"])


@tool
def get_rules(dimension: str = "por_cobertura") -> str:
    """Reglas agregadas. dimension: por_cobertura, por_formacion, por_play_action, por_tiempo_bolsa,
    por_zona_campo, por_down, presion_vs_no, por_resultado, correlaciones_playResult."""
    reglas = ds.insights()["reglas"]
    return _j(reglas.get(dimension, {"error": f"usa una de {list(reglas)}"}))


@tool
def get_clusters() -> str:
    """Resumen de los 4 arquetipos K-Means con etiqueta, tamaño y centroides reales."""
    k4 = ds.insights()["clusters"]["k4"]
    return _j([{k: c[k] for k in ("cluster", "etiqueta", "n", "pct", "centroide_real", "tasa_explosiva",
                                  "tasa_sack", "soe_promedio", "tasa_trampa")} for c in k4["clusters"]])


@tool
def get_player_rankings(metric: str = "receptores_soe") -> str:
    """Top 15 jugadores. metric: receptores_soe, receptores_hip_flip_inducido, defensores_hip_flip."""
    return _j(ds.insights()["rankings"].get(metric, []))


@tool
def get_pressure_trap() -> str:
    """Estadísticas de la Trampa de Presión por resultado, down, cobertura y equipo."""
    return _j(ds.insights()["trampa_presion"])


@tool
def search_featured_plays(tag: str = "", coverage: str = "", team: str = "", cluster_id: int = -1,
                          limit: int = 5) -> str:
    """Busca jugadas destacadas con tracking disponible. tag: explosiva, soe, hip_flip, trampa_presion.
    coverage: p.ej. Cover-1. team: abreviatura (KC, BUF). cluster_id: 0-3 o -1 para todos."""
    plays = ds.filter_plays(cluster_id if cluster_id >= 0 else None, coverage or None, team or None, tag or None)
    keys = ("gameId", "playId", "possessionTeam", "defensiveTeam", "down", "yardsToGo", "playResult",
            "passResult", "pff_passCoverage", "SOE", "hip_flip_deg", "cluster_label", "tags", "playDescription")
    return _j([{k: p.get(k) for k in keys} for p in plays[: max(1, min(limit, 15))]])


TOOLS = [get_kpis, get_rules, get_clusters, get_player_rankings, get_pressure_trap, search_featured_plays]


def _extract_json(text: str) -> dict | None:
    for m in reversed(list(re.finditer(r"\{.*\}", text, re.DOTALL))):
        try:
            return json.loads(m.group(0))
        except json.JSONDecodeError:
            continue
    return None


def _valid_play(rp) -> dict | None:
    if not isinstance(rp, dict):
        return None
    try:
        p = ds.find_play(int(rp.get("gameId")), int(rp.get("playId")))
    except (TypeError, ValueError):
        return None
    if p is None:
        return None
    return {"gameId": p["gameId"], "playId": p["playId"], "reason": str(rp.get("reason") or "Jugada destacada")}


# ------------------------------------------------------------------ respaldo local
_TOPICS = [
    (("presi", "blitz", "sack", "trampa", "checkdown"), "trampa_presion"),
    (("cadera", "hip", "flip", "defensor"), "hip_flip"),
    (("separa", "soe", "receptor", "abierto"), "soe"),
    (("explos", "big play", "larga", "profund"), "explosiva"),
]


def local_answer(message: str, mode: str = "coach") -> dict:
    ins = ds.insights()
    k = ins["kpis"]
    msg = message.lower()
    tag = next((t for words, t in _TOPICS if any(w in msg for w in words)), "explosiva")
    coverage = next((c for c in ins["reglas"]["por_cobertura"] if c.lower() in msg), None)
    plays = ds.filter_plays(coverage=coverage, tag=tag) or ds.filter_plays(tag=tag) or ds.featured_plays()
    play = plays[0]
    if tag == "trampa_presion":
        t = ins["trampa_presion"]
        txt = (f"La Trampa de Presión aparece en {t['n']} jugadas ({t['pct_de_jugadas_con_presion']}% de las jugadas con presión): "
               f"el receptor tenía más de 3.5 yd de separación, pero la jugada se quedó a {t['yardas_faltantes_promedio']:.1f} yd del primer down.")
    elif tag == "hip_flip":
        top = ins["rankings"]["defensores_hip_flip"][:3]
        txt = (f"El quiebre de cadera promedio es {k['hip_flip_promedio_deg']:.0f}°. Defensores con más giro forzado: "
               + ", ".join(f"{r['displayName']} ({r['team']}, {r['valor']:.0f}°)" for r in top) + ".")
    elif tag == "soe":
        top = ins["rankings"]["receptores_soe"][:3]
        txt = ("Receptores que más se separan sobre lo esperado: "
               + ", ".join(f"{r['displayName']} ({r['team']}, {r['valor']:+.2f} yd)" for r in top) + ".")
    else:
        txt = (f"El {k['tasa_explosiva'] * 100:.1f}% de los pases gana 15+ yardas; la presión aparece en "
               f"{k['tasa_presion'] * 100:.1f}% de los dropbacks y el tiempo medio para lanzar es {k['tiempo_lanzar_promedio_s']:.2f} s.")
    if coverage:
        r = ins["reglas"]["por_cobertura"][coverage]
        txt += f" Contra {coverage}: {r['yds']:.1f} yd por jugada, presión {r['presion'] * 100:.0f}%, separación del objetivo {r['sep_objetivo']:.1f} yd."
    prefix = "Para el coach: " if mode == "coach" else "Para la transmisión: "
    return {"reply": prefix + txt,
            "recommended_play": {"gameId": play["gameId"], "playId": play["playId"],
                                 "reason": f"{play.get('cluster_label')} | {play.get('playDescription', '')[:140]}"},
            "source": "local"}


def chat(message: str, mode: str = "coach") -> dict:
    # Se lee en cada llamada: main.py ya cargó el .env en os.environ antes de llegar aquí.
    model_id = os.environ.get("BEDROCK_MODEL_ID", "us.amazon.nova-pro-v1:0")
    region = os.environ.get("AWS_REGION", "us-east-1")
    try:
        agent = Agent(model=BedrockModel(model_id=model_id, region_name=region), tools=TOOLS,
                      system_prompt=SYSTEM_PROMPT, callback_handler=None)
        result = agent(f"[Audiencia: {mode}] {message}")
        text = str(result)
    except Exception as e:  # sin credenciales, sin red o Bedrock caído -> respaldo local
        out = local_answer(message, mode)
        out["fallback_reason"] = f"{type(e).__name__}: {str(e)[:300]}"
        return out
    try:
        tools_used = sorted(result.metrics.tool_metrics)
    except AttributeError:
        tools_used = []
    parsed = _extract_json(text) or {}
    reply = parsed.get("reply") or text.strip()
    rp = _valid_play(parsed.get("recommended_play"))
    if rp is None:
        rp = local_answer(message, mode)["recommended_play"]
    return {"reply": reply, "recommended_play": rp, "source": "bedrock", "model": model_id,
            "tools_used": tools_used}
