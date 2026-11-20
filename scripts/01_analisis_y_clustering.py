"""Diagnostico de llaves, normalizacion tactica, metricas y K-Means (numpy) del NFL BDB.

Solo usa pandas y numpy. Procesa un archivo de tracking a la vez para limitar memoria.
Salidas: docs/reporte_arquitectura_datos.md y data/insights_partido.json
"""
import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
DOCS = ROOT / "docs"
FIELD_X, FIELD_Y = 120.0, 53.3
END_EVENTS = {"tackle", "out_of_bounds", "touchdown", "qb_sack", "qb_slide", "fumble",
              "safety", "pass_outcome_touchdown", "pass_outcome_incomplete",
              "pass_outcome_interception", "touchback", "qb_strip_sack"}
THROW_EVENTS = {"pass_forward", "pass_shovel"}
ARRIVE_EVENTS = {"pass_arrived", "pass_outcome_caught", "pass_outcome_incomplete",
                 "pass_outcome_interception", "pass_outcome_touchdown"}


def log(*a):
    print(*a, flush=True)


def pct(x, n):
    return round(100.0 * x / n, 2) if n else None


# ---------------------------------------------------------------- tablas base
games = pd.read_csv(DATA / "games.csv")
plays = pd.read_csv(DATA / "plays.csv")
players = pd.read_csv(DATA / "players.csv")
pff = pd.read_csv(DATA / "pffScoutingData.csv")
# El README escribe 'Pass route'; el CSV trae 'Pass Route'. Se normaliza a minusculas.
ROLE_VALUES_RAW = pff.pff_role.value_counts().to_dict()
pff["pff_role"] = pff.pff_role.str.strip().str.lower()
tfiles = sorted((DATA / "tracking").glob("tracking_*.csv"))
log("tablas cargadas", len(games), len(plays), len(players), len(pff), len(tfiles))

# ---------------------------------------------------------------- integridad de llaves
ins = {}
ins["tablas"] = {"games": len(games), "plays": len(plays), "players": len(players),
                 "pff": len(pff), "tracking_archivos": len(tfiles)}
ins["unicidad"] = {
    "games.gameId": bool(games.gameId.is_unique),
    "plays.(gameId,playId)": bool(~plays.duplicated(["gameId", "playId"]).any()),
    "players.nflId": bool(players.nflId.is_unique),
    "pff.(gameId,playId,nflId)": bool(~pff.duplicated(["gameId", "playId", "nflId"]).any()),
}
pk = plays[["gameId", "playId"]].drop_duplicates()
orph = {}
orph["plays_sin_game"] = int((~plays.gameId.isin(games.gameId)).sum())
orph["games_sin_plays"] = int((~games.gameId.isin(plays.gameId)).sum())
m = pff.merge(pk, on=["gameId", "playId"], how="left", indicator=True)
orph["pff_sin_play"] = int((m._merge == "left_only").sum())
orph["pff_sin_player"] = int((~pff.nflId.isin(players.nflId)).sum())
pk_pff = pff[["gameId", "playId"]].drop_duplicates()
m2 = pk.merge(pk_pff, on=["gameId", "playId"], how="left", indicator=True)
orph["plays_sin_pff"] = int((m2._merge == "left_only").sum())
ppp = pff.groupby(["gameId", "playId"]).size()
ins["pff_filas_por_jugada"] = {k: float(v) for k, v in ppp.describe().round(2).items()}

# ---------------------------------------------------------------- tracking (por juego)
pff_role = dict(zip(zip(pff.gameId, pff.playId, pff.nflId), pff.pff_role))
pl = plays.set_index(["gameId", "playId"])
track_keys = set()
track_nfl = set()
tr = {"filas": 0, "filas_balon": 0, "filas_jugador": 0, "duplicados_llave": 0,
      "nulos_jugador": {}, "nulos_balon": {}, "dir_left": 0, "dir_right": 0,
      "jugadas_frames_irregulares": 0, "jugadas_balon_incompleto": 0,
      "check_ofensiva_izq": 0, "check_total": 0,
      "frames_por_jugada": []}
cols_check = ["x", "y", "s", "a", "dis", "o", "dir", "event", "jerseyNumber", "nflId"]
rows = []

usecols = ["gameId", "playId", "nflId", "frameId", "team", "playDirection",
           "x", "y", "s", "a", "dis", "o", "dir", "event", "jerseyNumber"]
for fi, f in enumerate(tfiles):
    t = pd.read_csv(f, usecols=usecols)
    tr["filas"] += len(t)
    ball = t[t.team == "football"].copy()
    ply = t[t.team != "football"].copy()
    tr["filas_balon"] += len(ball)
    tr["filas_jugador"] += len(ply)
    tr["duplicados_llave"] += int(t.duplicated(["gameId", "playId", "nflId", "frameId"]).sum())
    for c in cols_check:
        tr["nulos_jugador"][c] = tr["nulos_jugador"].get(c, 0) + int(ply[c].isna().sum())
        tr["nulos_balon"][c] = tr["nulos_balon"].get(c, 0) + int(ball[c].isna().sum())
    track_nfl.update(ply.nflId.dropna().astype(int).unique())
    kk = t[["gameId", "playId"]].drop_duplicates()
    track_keys.update(map(tuple, kk.to_numpy()))
    # normalizacion: ataque siempre a la derecha
    for d in (ply, ball):
        left = d.playDirection.eq("left")
        d.loc[left, "x"] = FIELD_X - d.loc[left, "x"]
        d.loc[left, "y"] = FIELD_Y - d.loc[left, "y"]
        d.loc[left, "o"] = (d.loc[left, "o"] + 180.0) % 360.0
        d.loc[left, "dir"] = (d.loc[left, "dir"] + 180.0) % 360.0
    tr["dir_left"] += int(ply.drop_duplicates(["gameId", "playId"]).playDirection.eq("left").sum())
    tr["dir_right"] += int(ply.drop_duplicates(["gameId", "playId"]).playDirection.eq("right").sum())

    ply = ply.sort_values(["playId", "nflId", "frameId"])
    ball = ball.sort_values(["playId", "frameId"])
    bgrp = {k: g for k, g in ball.groupby("playId")}
    gid = int(ply.gameId.iloc[0])
    for pid, g in ply.groupby("playId", sort=False):
        key = (gid, int(pid))
        if key not in pl.index:
            continue
        prow = pl.loc[key]
        poss = prow.possessionTeam
        ids = g.nflId.to_numpy()
        uid, cnt = np.unique(ids, return_counts=True)
        F = int(cnt.max())
        tr["frames_por_jugada"].append(F)
        if not (cnt == F).all():
            tr["jugadas_frames_irregulares"] += 1
            continue
        n = len(uid)
        X = g.x.to_numpy().reshape(n, F)
        Y = g.y.to_numpy().reshape(n, F)
        S = g.s.to_numpy().reshape(n, F)
        A = g.a.to_numpy().reshape(n, F)
        EV = g.event.to_numpy().reshape(n, F)
        TM = g.team.to_numpy().reshape(n, F)[:, 0]
        # evento por frame (primer valor no nulo entre jugadores)
        ev = np.array([next((e for e in EV[:, j] if isinstance(e, str)), "") for j in range(F)])
        off = TM == poss
        if off.sum() == 0 or (~off).sum() == 0:
            continue
        snap = np.where(ev == "ball_snap")[0]
        s0 = int(snap[0]) if len(snap) else 0
        endi = [j for j in range(s0, F) if ev[j] in END_EVENTS]
        e0 = endi[0] if endi else F - 1
        thr = [j for j in range(s0, F) if ev[j] in THROW_EVENTS]
        t0 = thr[0] if thr else None
        arr = [j for j in range(s0, F) if ev[j] in ARRIVE_EVENTS]
        a0 = arr[0] if arr else None
        tr["check_total"] += 1
        tr["check_ofensiva_izq"] += int(np.nanmean(X[off, s0]) < np.nanmean(X[~off, s0]))
        sl = slice(s0, e0 + 1)
        r = {"gameId": gid, "playId": int(pid), "frames": F,
             "snap_frame": s0, "end_frame": int(e0),
             "dev_time_s": (e0 - s0) / 10.0,
             "time_to_throw_s": ((t0 - s0) / 10.0) if t0 is not None else np.nan,
             "ev_fin": ev[e0],
             "max_speed_off": float(np.nanmax(S[off][:, sl])),
             "max_speed_def": float(np.nanmax(S[~off][:, sl])),
             "max_acc_off": float(np.nanmax(A[off][:, sl])),
             "max_acc_def": float(np.nanmax(A[~off][:, sl]))}
        # separacion: receptores (Pass route) vs defensores
        roles = np.array([pff_role.get((gid, int(pid), int(u)), "") for u in uid])
        rr = off & (roles == "pass route")
        dd = ~off
        r["n_route"] = int(rr.sum())
        if rr.any():
            PO = np.stack([X[rr][:, sl], Y[rr][:, sl]], -1)  # [R,T,2]
            PD = np.stack([X[dd][:, sl], Y[dd][:, sl]], -1)  # [D,T,2]
            dist = np.sqrt(((PO[:, None] - PD[None]) ** 2).sum(-1))  # [R,D,T]
            near = np.nanmin(dist, axis=1)  # [R,T]
            r["sep_min_route_yd"] = float(np.nanmin(near))
            r["sep_mean_route_yd"] = float(np.nanmean(near))
            if a0 is not None and pid in bgrp and len(bgrp[pid]) == F:
                bx = bgrp[pid].x.to_numpy()[a0]
                by = bgrp[pid].y.to_numpy()[a0]
                dr = np.hypot(X[rr][:, a0] - bx, Y[rr][:, a0] - by)
                k = int(np.nanargmin(dr))
                rx, ry = X[rr][k, a0], Y[rr][k, a0]
                r["sep_target_arrival_yd"] = float(np.nanmin(np.hypot(X[dd][:, a0] - rx, Y[dd][:, a0] - ry)))
                r["dist_ball_target_yd"] = float(dr[k])
        rows.append(r)
    if (fi + 1) % 10 == 0:
        log("tracking", fi + 1, "/", len(tfiles), "jugadas acumuladas", len(rows))

trk = pd.DataFrame(rows)
fr = np.array(tr.pop("frames_por_jugada"))
tr["frames_por_jugada"] = {"min": int(fr.min()), "mediana": float(np.median(fr)), "max": int(fr.max())}
ins["tracking"] = tr

# huerfanos tracking <-> plays / players
pk_set = set(map(tuple, pk.to_numpy()))
orph["tracking_jugadas_sin_play"] = len(track_keys - pk_set)
orph["plays_sin_tracking"] = len(pk_set - track_keys)
orph["tracking_nflId_sin_player"] = len(track_nfl - set(players.nflId.astype(int)))
ins["huerfanos"] = {k: int(v) for k, v in orph.items()}
log("huerfanos", ins["huerfanos"])

# ---------------------------------------------------------------- nulos en plays (estructurales)
nulls = plays.isna().sum()
ins["nulos_plays"] = {c: {"n": int(v), "pct": pct(v, len(plays))} for c, v in nulls.items() if v}
ins["nulos_estructurales"] = {
    "balon_nflId_nulo_en_tracking": "estructural: filas con team=football (1 por frame)",
    "foulName*/foulNFLId*/penaltyYards": "estructural: nulo cuando no hubo castigo",
    "pff_hit/hurry/sack (pff)": "nulo = sin credito, no dato perdido",
    "pff_nflIdBlockedPlayer/blockType": "nulo en jugadores que no bloquean",
    "event (tracking)": "nulo en la mayoria de frames; solo se marca en eventos",
}
ins["nulos_pff"] = {c: int(v) for c, v in pff.isna().sum().items() if v}
ins["pff_role_valores_crudos"] = {str(k): int(v) for k, v in ROLE_VALUES_RAW.items()}
ins["pct_jugadas_con_castigo"] = pct(plays.foulName1.notna().sum(), len(plays))

# ---------------------------------------------------------------- tabla de jugadas
P = plays.merge(games[["gameId", "week", "homeTeamAbbr", "visitorTeamAbbr"]], on="gameId", how="left")
P = P.merge(trk, on=["gameId", "playId"], how="left")
pf = pff.copy()
for c in ["pff_hit", "pff_hurry", "pff_sack"]:
    pf[c] = pf[c].fillna(0)
pres = pf.groupby(["gameId", "playId"]).agg(
    n_pass_rush=("pff_role", lambda s: int((s == "pass rush").sum())),
    n_coverage=("pff_role", lambda s: int((s == "coverage").sum())),
    n_pass_block=("pff_role", lambda s: int((s == "pass block").sum())),
    presiones=("pff_hurry", "sum"), hits=("pff_hit", "sum"), sacks=("pff_sack", "sum")).reset_index()
pres["presion"] = ((pres.presiones + pres.hits + pres.sacks) > 0).astype(int)
P = P.merge(pres, on=["gameId", "playId"], how="left")
P["is_home_off"] = P.possessionTeam == P.homeTeamAbbr
P["score_diff_off"] = np.where(P.is_home_off, P.preSnapHomeScore - P.preSnapVisitorScore,
                               P.preSnapVisitorScore - P.preSnapHomeScore)
P["yds_to_endzone"] = np.where(P.yardlineSide == P.possessionTeam, 100 - P.yardlineNumber, P.yardlineNumber)
P.loc[P.yardlineNumber == 50, "yds_to_endzone"] = 50
P["time_event_s"] = P.time_to_throw_s.fillna(P.dev_time_s)
P["explosiva"] = (P.playResult >= 15).astype(int)
P["tipo_resultado"] = P.passResult.fillna("NA")
ins["jugadas_con_metricas_tracking"] = int(P.dev_time_s.notna().sum())

# ---------------------------------------------------------------- estadisticas generales
def vc(s):
    return {str(k): int(v) for k, v in s.value_counts(dropna=False).items()}

gen = {"jugadas": len(P), "juegos": int(P.gameId.nunique()),
       "semanas": sorted(int(w) for w in P.week.unique()),
       "passResult": vc(P.passResult), "down": vc(P.down), "quarter": vc(P.quarter),
       "offenseFormation": vc(P.offenseFormation), "dropBackType": vc(P.dropBackType),
       "pff_passCoverage": vc(P.pff_passCoverage), "pff_passCoverageType": vc(P.pff_passCoverageType),
       "pff_playAction": vc(P.pff_playAction), "defendersInBox": vc(P.defendersInBox)}
gen["playResult"] = {k: round(float(v), 3) for k, v in P.playResult.describe().items()}
gen["yardsToGo_por_down"] = {str(k): round(float(v), 2) for k, v in P.groupby("down").yardsToGo.mean().items()}
gen["playResult_media_por_down"] = {str(k): round(float(v), 2) for k, v in P.groupby("down").playResult.mean().items()}
gen["tasa_explosiva_15mas"] = round(float(P.explosiva.mean()), 4)
gen["tasa_presion_pff"] = round(float(P.presion.mean()), 4)
# marcador: ultimo estado conocido por juego (pre-snap de la ultima jugada)
last = P.sort_values(["gameId", "playId"]).groupby("gameId").tail(1)
gen["marcador_aprox_final_promedio"] = {
    "local": round(float(last.preSnapHomeScore.mean()), 2),
    "visitante": round(float(last.preSnapVisitorScore.mean()), 2)}
team = P.groupby("possessionTeam").agg(jugadas=("playId", "size"), yds_prom=("playResult", "mean"),
                                       explosivas=("explosiva", "mean"),
                                       presion_sufrida=("presion", "mean")).round(3)
gen["equipos_ofensiva"] = {k: {c: float(v) for c, v in r.items()} for k, r in team.iterrows()}
ins["generales"] = gen

dm = {}
for c in ["dev_time_s", "time_to_throw_s", "max_speed_off", "max_speed_def", "max_acc_off",
          "max_acc_def", "sep_min_route_yd", "sep_mean_route_yd", "sep_target_arrival_yd"]:
    s = P[c].dropna()
    dm[c] = {k: round(float(v), 3) for k, v in s.describe().items()}
ins["metricas_derivadas"] = dm
ins["balon_normalizacion_check_pct_ofensiva_a_la_izq_del_snap"] = pct(tr["check_ofensiva_izq"], tr["check_total"])

# ---------------------------------------------------------------- patrones / reglas
def grp(col, minn=100):
    g = P.groupby(col, observed=True).agg(n=("playId", "size"), yds=("playResult", "mean"),
                           explosiva=("explosiva", "mean"), presion=("presion", "mean"),
                           t_throw=("time_to_throw_s", "mean"), sep=("sep_target_arrival_yd", "mean"))
    g = g[g.n >= minn].round(3)
    return {str(k): {c: (None if pd.isna(v) else float(v)) for c, v in r.items()} for k, r in g.iterrows()}

rules = {"por_cobertura": grp("pff_passCoverage"), "por_tipo_cobertura": grp("pff_passCoverageType"),
         "por_formacion": grp("offenseFormation"), "por_dropback": grp("dropBackType"),
         "por_play_action": grp("pff_playAction"), "por_down": grp("down"),
         "por_defenders_in_box": grp("defendersInBox", 200), "por_resultado": grp("passResult", 20)}
P["rushers_cat"] = pd.cut(P.n_pass_rush, [-1, 3, 4, 5, 20], labels=["<=3", "4", "5", "6+"])
rules["por_pass_rushers"] = grp("rushers_cat")
P["ttt_cat"] = pd.cut(P.time_to_throw_s, [0, 2.0, 2.5, 3.0, 4.0, 20], labels=["<=2.0", "2-2.5", "2.5-3", "3-4", ">4"])
rules["por_tiempo_hasta_lanzar"] = grp("ttt_cat")
rules["presion_vs_no"] = grp("presion")
cor = P[["playResult", "time_to_throw_s", "presion", "n_pass_rush", "sep_target_arrival_yd",
         "max_speed_off", "dev_time_s", "defendersInBox", "yardsToGo", "yds_to_endzone"]].corr().round(3)
rules["correlaciones_playResult"] = {k: (None if pd.isna(v) else float(v)) for k, v in cor.playResult.items()}
ins["reglas_patrones"] = rules

# ---------------------------------------------------------------- K-Means numpy
FEATS = ["down", "yardsToGo", "yds_to_endzone", "score_diff_off", "defendersInBox", "time_event_s",
         "n_pass_rush", "presion", "sep_target_arrival_yd", "max_speed_off", "playResult"]
D = P[FEATS].copy()
D["sep_target_arrival_yd"] = D.sep_target_arrival_yd.fillna(P.sep_mean_route_yd)
med = D.median()
D = D.fillna(med)
Xz = ((D - D.mean()) / D.std(ddof=0).replace(0, 1)).to_numpy()
ins["clustering_features"] = FEATS
ins["clustering_n"] = int(len(D))


def kmeans(X, k, seed, iters=200):
    rng = np.random.default_rng(seed)
    c = [X[rng.integers(len(X))]]
    for _ in range(1, k):  # init k-means++
        d2 = np.min(((X[:, None] - np.array(c)[None]) ** 2).sum(-1), axis=1)
        c.append(X[rng.choice(len(X), p=d2 / d2.sum())])
    c = np.array(c)
    for _ in range(iters):
        lab = ((X[:, None] - c[None]) ** 2).sum(-1).argmin(1)
        new = np.array([X[lab == j].mean(0) if (lab == j).any() else c[j] for j in range(k)])
        if np.allclose(new, c):
            break
        c = new
    lab = ((X[:, None] - c[None]) ** 2).sum(-1).argmin(1)
    inertia = float(((X - c[lab]) ** 2).sum())
    return lab, c, inertia


def silhouette(X, lab, n=2500, seed=0):
    rng = np.random.default_rng(seed)
    idx = rng.choice(len(X), min(n, len(X)), replace=False)
    Xs, ls = X[idx], lab[idx]
    sq = (Xs ** 2).sum(1)
    d = np.sqrt(np.maximum(sq[:, None] + sq[None] - 2 * Xs @ Xs.T, 0))
    ks = np.unique(ls)
    s = np.zeros(len(Xs))
    for i in range(len(Xs)):
        same = ls == ls[i]
        a = d[i, same].sum() / max(same.sum() - 1, 1)
        b = min(d[i, ls == k].mean() for k in ks if k != ls[i])
        s[i] = (b - a) / max(a, b)
    return float(s.mean())


clus = {}
tot_ss = float(((Xz - Xz.mean(0)) ** 2).sum())
inertia0 = {}
for k in (3, 4):
    best = min((kmeans(Xz, k, sd) for sd in range(10)), key=lambda r: r[2])
    lab, cen, ine = best
    # estabilidad: ARI-lite = coincidencia de particiones entre dos semillas via pares
    lab2 = kmeans(Xz, k, 99)[0]
    ct = pd.crosstab(lab, lab2).to_numpy()
    estab = float(ct.max(1).sum() / len(lab))
    sil = silhouette(Xz, lab)
    P[f"cluster_k{k}"] = lab
    prof = []
    for j in range(k):
        mk = lab == j
        real = P.loc[mk, FEATS].copy()
        row = {"cluster": j, "n": int(mk.sum()), "pct": pct(mk.sum(), len(lab)),
               "centroide_real": {c: round(float(real[c].mean()), 3) for c in FEATS},
               "centroide_z": {c: round(float(cen[j][i]), 3) for i, c in enumerate(FEATS)},
               "tasa_explosiva": round(float(P.loc[mk, "explosiva"].mean()), 3),
               "tasa_sack": round(float((P.loc[mk, "passResult"] == "S").mean()), 3),
               "tasa_incompleto": round(float((P.loc[mk, "passResult"] == "I").mean()), 3),
               "cobertura_top": vc(P.loc[mk, "pff_passCoverage"].dropna())}
        row["cobertura_top"] = dict(list(row["cobertura_top"].items())[:3])
        prof.append(row)
    clus[f"k{k}"] = {"inercia": round(ine, 1), "varianza_explicada_pct": round(100 * (1 - ine / tot_ss), 2),
                     "silhouette_muestra": round(sil, 3), "estabilidad_semillas": round(estab, 3),
                     "clusters": prof}
    log("k", k, clus[f"k{k}"]["silhouette_muestra"], clus[f"k{k}"]["varianza_explicada_pct"])


def etiqueta(prof):
    """Etiqueta tactica por el rasgo z mas distintivo de cada cluster (sin repetir)."""
    cand = {
        "Jugadas explosivas / exito grande": lambda z: z["playResult"] + 0.5 * z["sep_target_arrival_yd"],
        "Jugadas bajo presion": lambda z: z["presion"] + 0.5 * z["n_pass_rush"],
        "Pases rapidos / alta frecuencia": lambda z: -z["time_event_s"] - 0.5 * z["presion"],
        "Situacion larga (3ra y largo / campo propio)": lambda z: z["yardsToGo"] + 0.5 * z["down"],
    }
    used, out = set(), {}
    scores = [(n, p["cluster"], f(p["centroide_z"])) for p in prof for n, f in cand.items()]
    for n, c, s in sorted(scores, key=lambda t: -t[2]):
        if c in out or n in used:
            continue
        out[c] = n
        used.add(n)
    for p in prof:
        out.setdefault(p["cluster"], "Jugada base / sin rasgo dominante")
    return out


for kk in clus:
    lb = etiqueta(clus[kk]["clusters"])
    for p in clus[kk]["clusters"]:
        p["etiqueta_sugerida"] = lb[p["cluster"]]
ins["clustering"] = clus

# ---------------------------------------------------------------- salidas
DOCS.mkdir(exist_ok=True)
(DATA / "insights_partido.json").write_text(
    json.dumps(ins, ensure_ascii=False, indent=1, default=lambda o: None if pd.isna(o) else o), encoding="utf-8")

L = []
w = L.append
w("# Reporte de arquitectura de datos\n")
w(f"Generado por `scripts/01_analisis_y_clustering.py`. Datos: {gen['juegos']} juegos, semanas {gen['semanas'][0]}-{gen['semanas'][-1]}, "
  f"{gen['jugadas']} jugadas de dropback (pase). Solo pandas y numpy.\n")
w("## 1. Relaciones de llaves\n")
w("| Union | Resultado |\n|---|---|")
w("| games.gameId unica | %s |" % ins["unicidad"]["games.gameId"])
w("| plays (gameId, playId) unica | %s |" % ins["unicidad"]["plays.(gameId,playId)"])
w("| players.nflId unica | %s |" % ins["unicidad"]["players.nflId"])
w("| pff (gameId, playId, nflId) unica | %s |" % ins["unicidad"]["pff.(gameId,playId,nflId)"])
w("| tracking (gameId, playId, nflId, frameId) duplicados | %d |" % tr["duplicados_llave"])
w("\n**Registros huerfanos**\n")
w("| Chequeo | Cantidad |\n|---|---|")
for k, v in ins["huerfanos"].items():
    w(f"| {k} | {v} |")
w(f"\nCardinalidad: plays->pff = 1:N ({ins['pff_filas_por_jugada']['mean']} filas por jugada en promedio, "
  f"min {ins['pff_filas_por_jugada']['min']}, max {ins['pff_filas_por_jugada']['max']}); "
  f"plays->tracking = 1:N por frame (frames por jugada: min {tr['frames_por_jugada']['min']}, "
  f"mediana {tr['frames_por_jugada']['mediana']}, max {tr['frames_por_jugada']['max']}). "
  f"Jugadas con frames irregulares entre jugadores: {tr['jugadas_frames_irregulares']}.\n")
w("Discrepancia README vs CSV en `pff_role`: valores reales " + ", ".join(f"`{k}`={v}" for k, v in ins["pff_role_valores_crudos"].items())
  + " (el README usa minuscula en la segunda palabra). Se normaliza a minusculas antes de unir.\n")
w("## 2. Valores faltantes\n")
w("**Estructurales (esperados)**\n")
for k, v in ins["nulos_estructurales"].items():
    w(f"- `{k}`: {v}")
w(f"\nJugadas con castigo: {ins['pct_jugadas_con_castigo']}% (el resto tiene foulName nulo).\n")
w(f"Tracking: {tr['filas']} filas = {tr['filas_jugador']} de jugadores + {tr['filas_balon']} del balon. "
  "Nulos en filas de jugador vs balon:\n")
w("| Columna | Nulos jugador | Nulos balon |\n|---|---|---|")
for c in cols_check:
    w(f"| {c} | {tr['nulos_jugador'][c]} | {tr['nulos_balon'][c]} |")
w("\n**Nulos no estructurales en plays (>0)**\n")
w("| Columna | n | % |\n|---|---|---|")
for c, v in ins["nulos_plays"].items():
    w(f"| {c} | {v['n']} | {v['pct']} |")
w("\n## 3. Normalizacion tactica\n")
w(f"Jugadas con playDirection=left: {tr['dir_left']}, right: {tr['dir_right']}. Para `left` se aplico x=120-x, y=53.3-y, "
  f"o=(o+180)%360, dir=(dir+180)%360. Verificacion: en {ins['balon_normalizacion_check_pct_ofensiva_a_la_izq_del_snap']}% de las jugadas "
  "la ofensiva queda a la izquierda de la defensa al snap (debe ser cercano a 100%). "
  "Las filas del balon se separaron de las de jugadores antes del calculo.\n")
w("## 4. Estadisticas generales\n")
w(f"- Jugadas: {gen['jugadas']}. playResult medio {gen['playResult']['mean']} yardas, mediana {gen['playResult']['50%']}.")
w(f"- Tasa de jugadas explosivas (>=15 yd): {gen['tasa_explosiva_15mas']*100:.1f}%. Tasa de presion PFF: {gen['tasa_presion_pff']*100:.1f}%.")
w(f"- Marcador pre-snap de la ultima jugada (aprox. final), promedio: local {gen['marcador_aprox_final_promedio']['local']}, "
  f"visitante {gen['marcador_aprox_final_promedio']['visitante']}.")
for nm in ["passResult", "down", "offenseFormation", "dropBackType", "pff_passCoverage", "pff_passCoverageType", "pff_playAction"]:
    w(f"- {nm}: " + ", ".join(f"{k}={v}" for k, v in gen[nm].items()))
w("\n**Metricas derivadas (post-snap hasta fin de jugada)**\n")
w("| Metrica | media | mediana | min | max | n |\n|---|---|---|---|---|---|")
for c, s in dm.items():
    w(f"| {c} | {s['mean']} | {s['50%']} | {s['min']} | {s['max']} | {int(s['count'])} |")
w("\nSeparacion: distancia euclidiana entre cada receptor (pff_role = Pass route) y el defensor mas cercano; "
  "`sep_target_arrival_yd` usa el receptor mas cercano al balon en `pass_arrived` (proxy del objetivo).\n")
w("## 5. Reglas y patrones\n")
for nm, d in rules.items():
    if nm == "correlaciones_playResult":
        continue
    w(f"**{nm}**\n")
    w("| Grupo | n | yds prom | explosiva | presion | t lanzar | sep objetivo |\n|---|---|---|---|---|---|---|")
    for g, r in d.items():
        f = lambda v: "-" if v is None else round(v, 3)
        w(f"| {g} | {int(r['n'])} | {f(r['yds'])} | {f(r['explosiva'])} | {f(r['presion'])} | {f(r['t_throw'])} | {f(r['sep'])} |")
    w("")
w("**Correlaciones con playResult**: " + ", ".join(f"{k}={v}" for k, v in rules["correlaciones_playResult"].items() if k != "playResult") + "\n")
w("## 6. Clustering K-Means (numpy, Z-score)\n")
w(f"Variables: {', '.join(FEATS)}. N={ins['clustering_n']}. Nulos imputados con mediana. Init k-means++, 10 semillas, se elige la menor inercia. "
  "Silhouette sobre muestra de 2500. Estabilidad = coincidencia entre dos semillas distintas.\n")
for kk, c in clus.items():
    w(f"### {kk}: varianza explicada {c['varianza_explicada_pct']}%, silhouette {c['silhouette_muestra']}, estabilidad {c['estabilidad_semillas']}\n")
    w("| Cluster | Etiqueta sugerida | n | % | " + " | ".join(FEATS) + " | explosiva | sack | incompleto |")
    w("|" + "---|" * (7 + len(FEATS)))
    for p in c["clusters"]:
        w(f"| {p['cluster']} | {p['etiqueta_sugerida']} | {p['n']} | {p['pct']} | "
          + " | ".join(str(p['centroide_real'][f_]) for f_ in FEATS)
          + f" | {p['tasa_explosiva']} | {p['tasa_sack']} | {p['tasa_incompleto']} |")
    w("")
(DOCS / "reporte_arquitectura_datos.md").write_text("\n".join(L), encoding="utf-8")
log("LISTO")

