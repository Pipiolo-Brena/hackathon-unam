"""Pipeline de datos NFL BDB: llaves, normalizacion, metricas, metricas ineditas y K-Means (numpy).

Solo pandas y numpy. Procesa un archivo de tracking a la vez para limitar memoria.
Salidas:
  docs/reporte_arquitectura_datos.md
  data/insights_partido.json          (agregados para la web)
  data/featured_plays_tracking.json   (60 jugadas destacadas frame a frame, compacto)
Ejecutar: .venv/Scripts/python scripts/01_analisis_y_clustering.py
"""
import json
import math
import os
from collections import defaultdict
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
DOCS = ROOT / "docs"
FIELD_X, FIELD_Y = 120.0, 53.3
SNAP_EVENTS = ["ball_snap", "autoevent_ballsnap"]
THROW_EVENTS = {"pass_forward", "pass_shovel", "autoevent_passforward"}
ARRIVE_EVENTS = ["pass_arrived", "pass_outcome_caught", "pass_outcome_incomplete",
                 "pass_outcome_interception", "pass_outcome_touchdown"]
END_EVENTS = {"tackle", "out_of_bounds", "touchdown", "qb_sack", "qb_slide", "fumble", "safety",
              "pass_outcome_touchdown", "pass_outcome_incomplete", "pass_outcome_interception",
              "touchback", "qb_strip_sack"}
MIN_SPEED_HIP = 1.0      # yd/s: por debajo, 'dir' es ruido (jugador casi quieto)
SEP_TRAP = 3.5           # yd
MIN_N_RANK = 30          # jugadas minimas para entrar al ranking
N_FEATURED_PER_TAG = 15
LABEL_RED_ZONE = "Zona Roja / Compresión de Campo"


def log(*a):
    print(*a, flush=True)


def pct(x, n):
    return round(100.0 * x / n, 2) if n else None


def clean(o):
    """Convierte numpy/NaN a tipos JSON."""
    if isinstance(o, dict):
        return {str(k): clean(v) for k, v in o.items()}
    if isinstance(o, (list, tuple)):
        return [clean(v) for v in o]
    if isinstance(o, (np.integer,)):
        return int(o)
    if isinstance(o, (np.floating, float)):
        f = float(o)
        return None if math.isnan(f) or math.isinf(f) else round(f, 4)
    if isinstance(o, np.bool_):
        return bool(o)
    if o is pd.NA or o is pd.NaT:
        return None
    return o


def ang_diff(a, b):
    d = np.abs(a - b) % 360.0
    return np.minimum(d, 360.0 - d)


def normalize(d):
    left = d.playDirection.eq("left")
    d.loc[left, "x"] = FIELD_X - d.loc[left, "x"]
    d.loc[left, "y"] = FIELD_Y - d.loc[left, "y"]
    d.loc[left, "o"] = (d.loc[left, "o"] + 180.0) % 360.0
    d.loc[left, "dir"] = (d.loc[left, "dir"] + 180.0) % 360.0
    return d


# ================================================================ tablas base
games = pd.read_csv(DATA / "games.csv")
plays = pd.read_csv(DATA / "plays.csv")
players = pd.read_csv(DATA / "players.csv")
pff = pd.read_csv(DATA / "pffScoutingData.csv")
# El README escribe 'Pass route'; el CSV trae 'Pass Route'. Se normaliza a minusculas.
ROLE_VALUES_RAW = pff.pff_role.value_counts().to_dict()
pff["pff_role"] = pff.pff_role.str.strip().str.lower()
tfiles = sorted((DATA / "tracking").glob("tracking_*.csv"))
if os.environ.get("PIPELINE_MAX_FILES"):  # solo para pruebas rapidas
    tfiles = tfiles[: int(os.environ["PIPELINE_MAX_FILES"])]
log("tablas cargadas", len(games), len(plays), len(players), len(pff), len(tfiles))

# ================================================================ integridad de llaves
diag = {"tablas": {"games": len(games), "plays": len(plays), "players": len(players),
                   "pff": len(pff), "tracking_archivos": len(tfiles)}}
diag["unicidad"] = {
    "games.gameId": bool(games.gameId.is_unique),
    "plays.(gameId,playId)": bool(~plays.duplicated(["gameId", "playId"]).any()),
    "players.nflId": bool(players.nflId.is_unique),
    "pff.(gameId,playId,nflId)": bool(~pff.duplicated(["gameId", "playId", "nflId"]).any()),
}
pk = plays[["gameId", "playId"]].drop_duplicates()
orph = {"plays_sin_game": int((~plays.gameId.isin(games.gameId)).sum()),
        "games_sin_plays": int((~games.gameId.isin(plays.gameId)).sum()),
        "pff_sin_player": int((~pff.nflId.isin(players.nflId)).sum())}
m = pff.merge(pk, on=["gameId", "playId"], how="left", indicator=True)
orph["pff_sin_play"] = int((m._merge == "left_only").sum())
m2 = pk.merge(pff[["gameId", "playId"]].drop_duplicates(), on=["gameId", "playId"], how="left", indicator=True)
orph["plays_sin_pff"] = int((m2._merge == "left_only").sum())
diag["pff_filas_por_jugada"] = {k: float(v) for k, v in pff.groupby(["gameId", "playId"]).size().describe().round(2).items()}

# ================================================================ tracking (pasada 1: metricas por jugada)
pff_role = dict(zip(zip(pff.gameId, pff.playId, pff.nflId), pff.pff_role))
poss_by_key = dict(zip(zip(plays.gameId, plays.playId), plays.possessionTeam))
track_keys, track_nfl = set(), set()
tr = {"filas": 0, "filas_balon": 0, "filas_jugador": 0, "duplicados_llave": 0,
      "nulos_jugador": {}, "nulos_balon": {}, "dir_left": 0, "dir_right": 0,
      "jugadas_frames_irregulares": 0, "check_ofensiva_izq": 0, "check_total": 0,
      "fuente_llegada": defaultdict(int)}
frames_por_jugada = []
cols_check = ["x", "y", "s", "a", "dis", "o", "dir", "event", "jerseyNumber", "nflId"]
usecols = ["gameId", "playId", "nflId", "frameId", "team", "playDirection",
           "x", "y", "s", "a", "dis", "o", "dir", "event", "jerseyNumber"]
rows = []

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
    track_keys.update(map(tuple, t[["gameId", "playId"]].drop_duplicates().to_numpy()))
    normalize(ply)
    normalize(ball)
    firsts = ply.drop_duplicates(["gameId", "playId"]).playDirection
    tr["dir_left"] += int(firsts.eq("left").sum())
    tr["dir_right"] += int(firsts.eq("right").sum())

    ply = ply.sort_values(["playId", "nflId", "frameId"])
    ball_xy = {pid: dict(zip(b.frameId, zip(b.x, b.y))) for pid, b in ball.groupby("playId")}
    gid = int(ply.gameId.iloc[0])
    for pid, g in ply.groupby("playId", sort=False):
        key = (gid, int(pid))
        poss = poss_by_key.get(key)
        if poss is None:
            continue
        uid, cnt = np.unique(g.nflId.to_numpy(), return_counts=True)
        F = int(cnt.max())
        frames_por_jugada.append(F)
        if not (cnt == F).all():
            tr["jugadas_frames_irregulares"] += 1
            continue
        n = len(uid)
        X = g.x.to_numpy().reshape(n, F)
        Y = g.y.to_numpy().reshape(n, F)
        S = g.s.to_numpy().reshape(n, F)
        A = g.a.to_numpy().reshape(n, F)
        O = g.o.to_numpy().reshape(n, F)
        DIR = g.dir.to_numpy().reshape(n, F)
        EV = g.event.to_numpy().reshape(n, F)
        FR = g.frameId.to_numpy().reshape(n, F)[0]
        TM = g.team.to_numpy().reshape(n, F)[:, 0]
        ev = [next((e for e in EV[:, j] if isinstance(e, str)), "") for j in range(F)]
        off = TM == poss
        dd = ~off
        if off.sum() == 0 or dd.sum() == 0:
            continue
        s0 = next((ev.index(e) for e in SNAP_EVENTS if e in ev), 0)
        e0 = next((j for j in range(s0, F) if ev[j] in END_EVENTS), F - 1)
        t0 = next((j for j in range(s0, F) if ev[j] in THROW_EVENTS), None)
        a0 = next((j for j in range(s0, F) if ev[j] in ARRIVE_EVENTS), None)
        if a0 is None:
            a0 = max(s0, F - 2)  # penultimo frame
            src = "penultimate_frame"
        else:
            src = ev[a0]
        tr["fuente_llegada"][src] += 1
        tr["check_total"] += 1
        tr["check_ofensiva_izq"] += int(np.nanmean(X[off, s0]) < np.nanmean(X[dd, s0]))
        sl = slice(s0, e0 + 1)
        r = {"gameId": gid, "playId": int(pid), "frames": F, "snap_frame": int(FR[s0]),
             "arrival_frame": int(FR[a0]), "arrival_source": src,
             "dev_time_s": (e0 - s0) / 10.0,
             "time_to_throw_s": ((t0 - s0) / 10.0) if t0 is not None else np.nan,
             "max_speed_off": float(np.nanmax(S[off][:, sl])),
             "max_speed_def": float(np.nanmax(S[dd][:, sl])),
             "max_acc_off": float(np.nanmax(A[off][:, sl])),
             "max_acc_def": float(np.nanmax(A[dd][:, sl]))}
        roles = np.array([pff_role.get((gid, int(pid), int(u)), "") for u in uid])
        rr = off & (roles == "pass route")
        r["n_route"] = int(rr.sum())
        if rr.any():
            PO = np.stack([X[rr][:, sl], Y[rr][:, sl]], -1)
            PD = np.stack([X[dd][:, sl], Y[dd][:, sl]], -1)
            near = np.nanmin(np.sqrt(((PO[:, None] - PD[None]) ** 2).sum(-1)), axis=1)
            r["sep_min_route_yd"] = float(np.nanmin(near))
            r["sep_mean_route_yd"] = float(np.nanmean(near))
            # receptor objetivo = route runner mas cercano al balon en el frame de llegada
            route_idx = np.where(rr)[0]
            bxy = ball_xy.get(pid, {}).get(FR[a0])
            if bxy is not None:
                dr = np.hypot(X[route_idx, a0] - bxy[0], Y[route_idx, a0] - bxy[1])
                ti = int(route_idx[int(np.nanargmin(dr))])
                r["dist_ball_target_yd"] = float(np.nanmin(dr))
            else:  # sin balon: receptor con mayor separacion media
                ti = int(route_idx[int(np.nanargmax(near.mean(1)))])
            rx, ry = X[ti, a0], Y[ti, a0]
            def_idx = np.where(dd)[0]
            dd_dist = np.hypot(X[def_idx, a0] - rx, Y[def_idx, a0] - ry)
            r["target_nflId"] = int(uid[ti])
            r["sep_target_arrival_yd"] = float(np.nanmin(dd_dist))
            r["nearest_def_nflId"] = int(uid[def_idx[int(np.nanargmin(dd_dist))]])
            # Quiebre de cadera: defensor en Coverage mas cercano al objetivo, snap -> llegada
            cov_idx = np.where(dd & (roles == "coverage"))[0]
            if len(cov_idx):
                cd = np.hypot(X[cov_idx, a0] - rx, Y[cov_idx, a0] - ry)
                ci = int(cov_idx[int(np.nanargmin(cd))])
                seg = slice(s0, a0 + 1)
                diff = ang_diff(O[ci, seg], DIR[ci, seg])
                diff = np.where(S[ci, seg] >= MIN_SPEED_HIP, diff, np.nan)
                r["cov_def_nflId"] = int(uid[ci])
                r["hip_flip_deg"] = float(np.nanmax(diff)) if np.isfinite(diff).any() else np.nan
        rows.append(r)
    if (fi + 1) % 10 == 0:
        log("tracking", fi + 1, "/", len(tfiles), "jugadas", len(rows))

trk = pd.DataFrame(rows)
fr = np.array(frames_por_jugada)
tr["frames_por_jugada"] = {"min": int(fr.min()), "mediana": float(np.median(fr)), "max": int(fr.max())}
tr["fuente_llegada"] = dict(tr["fuente_llegada"])
diag["tracking"] = tr
pk_set = set(map(tuple, pk.to_numpy()))
orph["tracking_jugadas_sin_play"] = len(track_keys - pk_set)
orph["plays_sin_tracking"] = len(pk_set - track_keys)
orph["tracking_nflId_sin_player"] = len(track_nfl - set(players.nflId.astype(int)))
diag["huerfanos"] = orph
diag["nulos_plays"] = {c: {"n": int(v), "pct": pct(v, len(plays))} for c, v in plays.isna().sum().items() if v}
diag["pff_role_valores_crudos"] = {str(k): int(v) for k, v in ROLE_VALUES_RAW.items()}
diag["pct_jugadas_con_castigo"] = pct(plays.foulName1.notna().sum(), len(plays))
diag["pct_ofensiva_izq_al_snap_tras_normalizar"] = pct(tr["check_ofensiva_izq"], tr["check_total"])
log("huerfanos", orph)

# ================================================================ tabla de jugadas
P = plays.merge(games[["gameId", "week", "homeTeamAbbr", "visitorTeamAbbr"]], on="gameId", how="left")
P = P.merge(trk, on=["gameId", "playId"], how="left")
pf = pff.copy()
for c in ["pff_hit", "pff_hurry", "pff_sack"]:
    pf[c] = pf[c].fillna(0)
pres = pf.groupby(["gameId", "playId"]).agg(
    n_pass_rush=("pff_role", lambda s: int((s == "pass rush").sum())),
    hurries=("pff_hurry", "sum"), hits=("pff_hit", "sum"), sacks=("pff_sack", "sum")).reset_index()
pres["presion"] = ((pres.hurries + pres.hits + pres.sacks) > 0).astype(int)
P = P.merge(pres, on=["gameId", "playId"], how="left")
P["score_diff_off"] = np.where(P.possessionTeam == P.homeTeamAbbr, P.preSnapHomeScore - P.preSnapVisitorScore,
                               P.preSnapVisitorScore - P.preSnapHomeScore)
P["yds_to_endzone"] = np.where(P.yardlineSide == P.possessionTeam, 100 - P.yardlineNumber, P.yardlineNumber)
P.loc[P.yardlineNumber == 50, "yds_to_endzone"] = 50
P["zona_campo"] = pd.cut(P.yds_to_endzone, [-1, 20, 40, 60, 101],
                         labels=["Zona Roja (<=20)", "Ataque (21-40)", "Medio Campo (41-60)", "Campo Propio (61+)"]).astype(str)
P["time_event_s"] = P.time_to_throw_s.fillna(P.dev_time_s)
P["explosiva"] = (P.playResult >= 15).astype(int)
P["coverage"] = P.pff_passCoverage.fillna("Sin dato")

# ---------------- Metrica inedita 1: Separacion Sobre lo Esperado (SOE)
P["sep_esperada_yd"] = P.groupby(["coverage", "zona_campo"]).sep_target_arrival_yd.transform("mean")
P["SOE"] = P.sep_target_arrival_yd - P.sep_esperada_yd
# ---------------- Metrica inedita 3: Trampa de Presion
P["checkdown_trap"] = ((P.presion == 1) & (P.sep_target_arrival_yd > SEP_TRAP)
                       & (P.playResult < P.yardsToGo)).astype(int)
log("cobertura sep_target", int(P.sep_target_arrival_yd.notna().sum()), "hip", int(P.hip_flip_deg.notna().sum()))

# ================================================================ KPIs y reglas
def vc(s):
    return {str(k): int(v) for k, v in s.value_counts(dropna=False).items()}


def grp(col, minn=100):
    g = P.groupby(col, observed=True).agg(
        n=("playId", "size"), yds=("playResult", "mean"), explosiva=("explosiva", "mean"),
        presion=("presion", "mean"), t_throw=("time_to_throw_s", "mean"),
        sep_objetivo=("sep_target_arrival_yd", "mean"), soe=("SOE", "mean"),
        hip_flip=("hip_flip_deg", "mean"), trampa=("checkdown_trap", "mean"))
    g = g[g.n >= minn].round(3)
    return {str(k): r.to_dict() for k, r in g.iterrows()}


kpis = {"juegos": int(P.gameId.nunique()), "jugadas": int(len(P)),
        "semanas": [int(P.week.min()), int(P.week.max())],
        "yardas_promedio": float(P.playResult.mean()), "yardas_mediana": float(P.playResult.median()),
        "tasa_explosiva": float(P.explosiva.mean()), "tasa_presion": float(P.presion.mean()),
        "tasa_completo": float((P.passResult == "C").mean()), "tasa_sack": float((P.passResult == "S").mean()),
        "tasa_intercepcion": float((P.passResult == "IN").mean()),
        "tiempo_lanzar_promedio_s": float(P.time_to_throw_s.mean()),
        "sep_objetivo_promedio_yd": float(P.sep_target_arrival_yd.mean()),
        "hip_flip_promedio_deg": float(P.hip_flip_deg.mean()),
        "tasa_trampa_presion": float(P.checkdown_trap.mean()),
        "cobertura_sep_objetivo": int(P.sep_target_arrival_yd.notna().sum()),
        "cobertura_hip_flip": int(P.hip_flip_deg.notna().sum())}
distrib = {"cobertura": vc(P.pff_passCoverage), "tipo_cobertura": vc(P.pff_passCoverageType),
           "formacion": vc(P.offenseFormation), "passResult": vc(P.passResult), "down": vc(P.down),
           "dropBackType": vc(P.dropBackType), "play_action": vc(P.pff_playAction)}
P["ttt_cat"] = pd.cut(P.time_to_throw_s, [0, 2.0, 2.5, 3.0, 4.0, 20], labels=["<=2.0", "2-2.5", "2.5-3", "3-4", ">4"])
P["ttt_bin"] = (np.floor(P.time_to_throw_s.clip(upper=6.0) * 2) / 2)
curva = P.dropna(subset=["ttt_bin"]).groupby("ttt_bin").agg(
    n=("playId", "size"), yds=("playResult", "mean"), explosiva=("explosiva", "mean"),
    presion=("presion", "mean"), completo=("passResult", lambda s: float((s == "C").mean())),
    sep_objetivo=("sep_target_arrival_yd", "mean")).round(3).reset_index()
curva = curva[curva.n >= 30]
curva_tiempo = [{"t_desde_s": float(r.ttt_bin), "t_hasta_s": float(r.ttt_bin + 0.5), **{c: r[c] for c in curva.columns if c != "ttt_bin"}}
                for _, r in curva.iterrows()]
reglas = {"por_cobertura": grp("pff_passCoverage"), "por_tipo_cobertura": grp("pff_passCoverageType"),
          "por_formacion": grp("offenseFormation"), "por_play_action": grp("pff_playAction"),
          "por_tiempo_bolsa": grp("ttt_cat"), "por_down": grp("down"), "por_zona_campo": grp("zona_campo"),
          "presion_vs_no": grp("presion"), "por_resultado": grp("passResult", 20)}
cor = P[["playResult", "time_to_throw_s", "presion", "sep_target_arrival_yd", "SOE", "hip_flip_deg",
         "max_speed_off", "yardsToGo", "yds_to_endzone"]].corr()
reglas["correlaciones_playResult"] = {k: float(v) for k, v in cor.playResult.round(3).items() if k != "playResult"}
team = P.groupby("possessionTeam").agg(jugadas=("playId", "size"), yds=("playResult", "mean"),
                                       explosiva=("explosiva", "mean"), presion_sufrida=("presion", "mean"),
                                       soe=("SOE", "mean"), trampa=("checkdown_trap", "mean")).round(3)
equipos = {k: r.to_dict() for k, r in team.iterrows()}

# ================================================================ K-Means numpy
FEATS = ["down", "yardsToGo", "yds_to_endzone", "score_diff_off", "defendersInBox", "time_event_s",
         "n_pass_rush", "presion", "sep_target_arrival_yd", "max_speed_off", "playResult"]
D = P[FEATS].copy()
D = D.fillna(D.median())
Xz = ((D - D.mean()) / D.std(ddof=0).replace(0, 1)).to_numpy()


def kmeans(X, k, seed, iters=200):
    rng = np.random.default_rng(seed)
    c = [X[rng.integers(len(X))]]
    for _ in range(1, k):
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
    return lab, c, float(((X - c[lab]) ** 2).sum())


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


def etiquetar(prof):
    """Regla 1: centroide real yds_to_endzone <= 40 -> Zona Roja / Compresion de Campo.
    Resto: asignacion voraz por rasgo z dominante, sin repetir etiqueta."""
    out = {p["cluster"]: LABEL_RED_ZONE for p in prof if p["centroide_real"]["yds_to_endzone"] <= 40}
    cand = {
        "Bolsa Limpia / Jugadas Explosivas": lambda z: z["playResult"] - 0.5 * z["presion"],
        "Bolsa Colapsada (Bajo Presión)": lambda z: z["presion"] + 0.5 * z["time_event_s"],
        "Blitz / Caja Cargada": lambda z: z["n_pass_rush"] + 0.5 * z["defendersInBox"],
        "Pase Rápido Seguro": lambda z: -z["time_event_s"] - 0.5 * z["presion"],
    }
    rest = [p for p in prof if p["cluster"] not in out]
    scores = sorted(((f(p["centroide_z"]), n, p["cluster"]) for p in rest for n, f in cand.items()), reverse=True)
    used = set()
    for _, n, c in scores:
        if c not in out and n not in used:
            out[c] = n
            used.add(n)
    for p in prof:
        out.setdefault(p["cluster"], "Jugada Base")
    return out


tot_ss = float(((Xz - Xz.mean(0)) ** 2).sum())
clusters = {}
for k in (3, 4):
    lab, cen, ine = min((kmeans(Xz, k, sd) for sd in range(10)), key=lambda r: r[2])
    lab2 = kmeans(Xz, k, 99)[0]
    estab = float(pd.crosstab(lab, lab2).to_numpy().max(1).sum() / len(lab))
    P[f"cluster_k{k}"] = lab
    prof = []
    for j in range(k):
        mk = lab == j
        sub = P.loc[mk]
        prof.append({"cluster": j, "n": int(mk.sum()), "pct": pct(mk.sum(), len(lab)),
                     "centroide_real": {c: round(float(sub[c].mean()), 3) for c in FEATS},
                     "centroide_z": {c: round(float(cen[j][i]), 3) for i, c in enumerate(FEATS)},
                     "tasa_explosiva": float(sub.explosiva.mean()),
                     "tasa_sack": float((sub.passResult == "S").mean()),
                     "tasa_incompleto": float((sub.passResult == "I").mean()),
                     "soe_promedio": float(sub.SOE.mean()), "hip_flip_promedio": float(sub.hip_flip_deg.mean()),
                     "tasa_trampa": float(sub.checkdown_trap.mean()),
                     "cobertura_top": dict(list(vc(sub.pff_passCoverage.dropna()).items())[:3])})
    lb = etiquetar(prof)
    for p in prof:
        p["etiqueta"] = lb[p["cluster"]]
    clusters[f"k{k}"] = {"varianza_explicada_pct": round(100 * (1 - ine / tot_ss), 2),
                         "silhouette_muestra": round(silhouette(Xz, lab), 3),
                         "estabilidad_semillas": round(estab, 3), "clusters": prof}
    log("k", k, clusters[f"k{k}"]["silhouette_muestra"], [p["etiqueta"] for p in prof])
P["cluster_id"] = P.cluster_k4
lab4 = {p["cluster"]: p["etiqueta"] for p in clusters["k4"]["clusters"]}
P["cluster_label"] = P.cluster_id.map(lab4)

# ================================================================ rankings de jugadores
pinfo = players.set_index("nflId")[["displayName", "officialPosition"]]


def ranking(id_col, metric, team_col, top=15, minn=MIN_N_RANK, asc=False):
    d = P.dropna(subset=[id_col, metric]).copy()
    d[id_col] = d[id_col].astype(int)
    g = d.groupby(id_col).agg(n=(metric, "size"), valor=(metric, "mean"),
                              team=(team_col, lambda s: s.mode().iat[0]),
                              sep_objetivo=("sep_target_arrival_yd", "mean"), yds=("playResult", "mean"))
    g = g[g.n >= minn].sort_values("valor", ascending=asc).head(top)
    g = g.join(pinfo, how="left").reset_index().rename(columns={id_col: "nflId"})
    g["nflId"] = g.nflId.astype(int)
    return [clean(r) for r in g.round(3).to_dict("records")]


rankings = {
    "receptores_soe": ranking("target_nflId", "SOE", "possessionTeam"),
    "receptores_hip_flip_inducido": ranking("target_nflId", "hip_flip_deg", "possessionTeam"),
    "defensores_hip_flip": ranking("cov_def_nflId", "hip_flip_deg", "defensiveTeam"),
    "min_jugadas": MIN_N_RANK,
}

# ================================================================ Trampa de presion
pz = P[P.presion == 1]
tz = P[P.checkdown_trap == 1]
trampa = {
    "definicion": f"presion PFF == 1 y sep_target_arrival_yd > {SEP_TRAP} y playResult < yardsToGo",
    "n": int(len(tz)), "pct_de_jugadas": pct(len(tz), len(P)), "pct_de_jugadas_con_presion": pct(len(tz), len(pz)),
    "yardas_promedio": float(tz.playResult.mean()),
    "yardas_faltantes_promedio": float((tz.yardsToGo - tz.playResult).mean()),
    "sep_objetivo_promedio": float(tz.sep_target_arrival_yd.mean()),
    "tiempo_lanzar_promedio": float(tz.time_to_throw_s.mean()),
    "por_resultado": vc(tz.passResult),
    "por_down": vc(tz.down),
    "por_cobertura": {k: {"n": int(v), "tasa_sobre_presion": round(float(v / max((pz.coverage == k).sum(), 1)), 3)}
                      for k, v in tz.coverage.value_counts().items()},
    "por_equipo_ofensivo": {k: {"n": int(v), "tasa_sobre_presion": round(float(v / max((pz.possessionTeam == k).sum(), 1)), 3)}
                            for k, v in tz.possessionTeam.value_counts().head(10).items()},
    "comparacion_presion_sep_alta": {
        "trampa_yds": float(tz.playResult.mean()),
        "presion_sep_alta_convierte_yds": float(pz[(pz.sep_target_arrival_yd > SEP_TRAP) & (pz.playResult >= pz.yardsToGo)].playResult.mean()),
    },
}

# ================================================================ jugadas destacadas (60)
METRIC_COLS = ["gameId", "playId", "week", "quarter", "down", "yardsToGo", "possessionTeam", "defensiveTeam",
               "playDescription", "passResult", "playResult", "prePenaltyPlayResult", "offenseFormation", "pff_passCoverage",
               "pff_passCoverageType", "pff_playAction", "zona_campo", "yds_to_endzone", "time_to_throw_s",
               "presion", "sep_target_arrival_yd", "sep_esperada_yd", "SOE", "hip_flip_deg", "checkdown_trap",
               "max_speed_off", "cluster_id", "cluster_label", "target_nflId", "cov_def_nflId",
               "snap_frame", "arrival_frame", "arrival_source"]
PT = P.dropna(subset=["snap_frame"])  # solo jugadas con tracking
pools = {
    "explosiva": PT.sort_values(["prePenaltyPlayResult", "SOE"], ascending=False),  # sin yardas de castigo
    "soe": P.dropna(subset=["SOE"]).sort_values("SOE", ascending=False),
    "hip_flip": P.dropna(subset=["hip_flip_deg"]).sort_values(["hip_flip_deg", "playResult"], ascending=False),
    "trampa_presion": P[P.checkdown_trap == 1].sort_values("sep_target_arrival_yd", ascending=False),
}
chosen, tag_of = [], {}
for tag, pool in pools.items():
    c = 0
    for key in zip(pool.gameId, pool.playId):
        if key in tag_of:
            continue
        tag_of[key] = tag
        chosen.append(key)
        c += 1
        if c >= N_FEATURED_PER_TAG:
            break
FP = P.set_index(["gameId", "playId"]).loc[chosen].reset_index()
featured_meta = []
for _, r in FP[METRIC_COLS].iterrows():
    d = clean(r.to_dict())
    key = (int(r.gameId), int(r.playId))
    tags = [tag_of[key]]
    if r.checkdown_trap == 1 and "trampa_presion" not in tags:
        tags.append("trampa_presion")
    if r.prePenaltyPlayResult >= 15 and "explosiva" not in tags:
        tags.append("explosiva")
    d["tags"] = tags
    d["primary_tag"] = tag_of[key]
    for col, nm in (("target_nflId", "target_name"), ("cov_def_nflId", "cov_def_name")):
        v = d.get(col)
        d[nm] = str(pinfo.displayName.get(int(v))) if v is not None and int(v) in pinfo.index else None
    featured_meta.append(d)
log("destacadas", len(featured_meta))

# pasada 2: tracking frame a frame solo de las jugadas destacadas
need = defaultdict(set)
for g_, p_ in chosen:
    need[g_].add(p_)
names = pinfo.displayName.to_dict()
featured_tracking = {}
for gid, pids in need.items():
    t = pd.read_csv(DATA / "tracking" / f"tracking_{gid}.csv",
                    usecols=["gameId", "playId", "nflId", "frameId", "team", "playDirection", "x", "y", "s",
                             "o", "dir", "event", "jerseyNumber"])
    t = normalize(t[t.playId.isin(pids)].copy())
    for pid, g in t.groupby("playId"):
        g = g.sort_values(["frameId", "nflId"], na_position="last")
        ent = g.drop_duplicates("nflId")[["nflId", "team", "jerseyNumber"]]
        roster, idx = [], {}
        for e in ent.itertuples(index=False):
            isball = pd.isna(e.nflId)
            nid = None if isball else int(e.nflId)
            idx["ball" if isball else nid] = len(roster)
            roster.append({"nflId": nid, "team": e.team,
                           "displayName": "football" if isball else names.get(nid),
                           "jerseyNumber": None if pd.isna(e.jerseyNumber) else int(e.jerseyNumber),
                           "pff_role": None if isball else pff_role.get((gid, int(pid), nid))})
        frames = []
        for fid, fg in g.groupby("frameId"):
            evs = fg.event.dropna()
            pts = []
            for e in fg.itertuples(index=False):
                ri = idx["ball" if pd.isna(e.nflId) else int(e.nflId)]
                pts.append([ri, round(e.x, 2), round(e.y, 2),
                            None if pd.isna(e.o) else round(e.o, 1),
                            None if pd.isna(e.dir) else round(e.dir, 1), round(e.s, 2)])
            frames.append({"frameId": int(fid), "event": evs.iat[0] if len(evs) else None, "p": pts})
        featured_tracking[f"{gid}_{int(pid)}"] = {"gameId": int(gid), "playId": int(pid), "roster": roster,
                                                  "frames": frames}

# ================================================================ salidas
insights = clean({
    "meta": {"fuente": "NFL Big Data Bowl 2023 (semanas 1-8, jugadas de pase)",
             "normalizacion": "ataque siempre a la derecha; x=120-x, y=53.3-y, o/dir +180 cuando playDirection=left",
             "llegada": "primer evento de " + ", ".join(ARRIVE_EVENTS) + " tras el snap; si no hay, penultimo frame",
             "hip_flip_nota": f"max |o-dir| (0-180) del Coverage mas cercano al objetivo, snap->llegada, solo frames con s >= {MIN_SPEED_HIP} yd/s",
             "soe_nota": "sep_target_arrival_yd - media de (pff_passCoverage, zona_campo)"},
    "kpis": kpis, "distribuciones": distrib, "curva_tiempo_bolsa": curva_tiempo, "reglas": reglas,
    "equipos_ofensiva": equipos, "clusters": clusters, "rankings": rankings, "trampa_presion": trampa,
    "featured_plays": featured_meta, "diagnostico": diag,
})
(DATA / "insights_partido.json").write_text(json.dumps(insights, ensure_ascii=False, indent=1), encoding="utf-8")
(DATA / "featured_plays_tracking.json").write_text(
    json.dumps(clean({"formato": "p = [indice_roster, x, y, o, dir, s]", "plays": featured_tracking}),
               ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

# ================================================================ reporte markdown
L = []
w = L.append
w("# Reporte de arquitectura de datos\n")
w(f"Generado por `scripts/01_analisis_y_clustering.py`. {kpis['juegos']} juegos, semanas {kpis['semanas'][0]}-{kpis['semanas'][1]}, "
  f"{kpis['jugadas']} jugadas de pase. Solo pandas y numpy.\n")
w("## 1. Relaciones de llaves\n")
w("| Chequeo | Resultado |\n|---|---|")
for k, v in diag["unicidad"].items():
    w(f"| unico {k} | {v} |")
w(f"| duplicados tracking (gameId, playId, nflId, frameId) | {tr['duplicados_llave']} |")
for k, v in orph.items():
    w(f"| {k} | {v} |")
w(f"\nplays->pff 1:N ({diag['pff_filas_por_jugada']['mean']} filas/jugada); plays->tracking 1:N por frame "
  f"(min {tr['frames_por_jugada']['min']}, mediana {tr['frames_por_jugada']['mediana']}, max {tr['frames_por_jugada']['max']} frames). "
  f"Frames irregulares: {tr['jugadas_frames_irregulares']}.\n")
w("Discrepancia README vs CSV en `pff_role`: " + ", ".join(f"`{k}`={v}" for k, v in diag["pff_role_valores_crudos"].items())
  + ". Se normaliza a minusculas.\n")
w("## 2. Valores faltantes\n")
w(f"Estructurales: filas del balon sin nflId/o/dir/jerseyNumber ({tr['filas_balon']} filas); castigos nulos cuando no hubo castigo "
  f"(con castigo: {diag['pct_jugadas_con_castigo']}%); PFF hit/hurry/sack nulo = sin credito; `event` solo en frames marcados.\n")
w("| Columna plays | n nulos | % |\n|---|---|---|")
for c, v in diag["nulos_plays"].items():
    w(f"| {c} | {v['n']} | {v['pct']} |")
w("\n## 3. Normalizacion\n")
w(f"left={tr['dir_left']}, right={tr['dir_right']}. Ofensiva a la izquierda de la defensa al snap tras normalizar: "
  f"{diag['pct_ofensiva_izq_al_snap_tras_normalizar']}%.\n")
w("Fuente del frame de llegada: " + ", ".join(f"{k}={v}" for k, v in tr["fuente_llegada"].items())
  + ". El tracking de este dataset termina poco despues del pase, por eso la mayoria usa el penultimo frame.\n")
w("## 4. KPIs\n")
for k, v in kpis.items():
    w(f"- {k}: {clean(v)}")
w("\n## 5. Metricas ineditas\n")
for c in ["sep_target_arrival_yd", "SOE", "hip_flip_deg"]:
    s = P[c].describe()
    w(f"- **{c}**: n={int(s['count'])}, media={s['mean']:.3f}, p25={s['25%']:.3f}, mediana={s['50%']:.3f}, p75={s['75%']:.3f}, max={s['max']:.3f}")
w(f"- hip_flip_deg >= 170: {pct((P.hip_flip_deg >= 170).sum(), P.hip_flip_deg.notna().sum())}% de las jugadas medidas.")
w(f"\n**Trampa de Presion**: {trampa['n']} jugadas ({trampa['pct_de_jugadas']}% del total, "
  f"{trampa['pct_de_jugadas_con_presion']}% de las jugadas con presion). Yardas promedio {trampa['yardas_promedio']:.2f}, "
  f"faltaron {trampa['yardas_faltantes_promedio']:.2f} yd para el primer down. Resultado: {trampa['por_resultado']}.\n")
w("**Top 5 receptores por SOE**\n")
w("| Jugador | Pos | Equipo | n | SOE | sep obj |\n|---|---|---|---|---|---|")
for r in rankings["receptores_soe"][:5]:
    w(f"| {r['displayName']} | {r['officialPosition']} | {r['team']} | {r['n']} | {r['valor']} | {r['sep_objetivo']} |")
w("\n**Top 5 defensores por hip_flip_deg**\n")
w("| Jugador | Pos | Equipo | n | hip flip | sep permitida |\n|---|---|---|---|---|---|")
for r in rankings["defensores_hip_flip"][:5]:
    w(f"| {r['displayName']} | {r['officialPosition']} | {r['team']} | {r['n']} | {r['valor']} | {r['sep_objetivo']} |")
w("\n## 6. Reglas\n")
for nm in ["por_cobertura", "por_formacion", "por_play_action", "por_tiempo_bolsa", "por_zona_campo", "presion_vs_no"]:
    w(f"**{nm}**\n")
    w("| Grupo | n | yds | explosiva | presion | t lanzar | sep obj | SOE | hip flip | trampa |\n|---|---|---|---|---|---|---|---|---|---|")
    for g_, r in reglas[nm].items():
        w(f"| {g_} | {int(r['n'])} | " + " | ".join(str(clean(r[c])) for c in
          ["yds", "explosiva", "presion", "t_throw", "sep_objetivo", "soe", "hip_flip", "trampa"]) + " |")
    w("")
w("Correlaciones con playResult: " + ", ".join(f"{k}={v}" for k, v in reglas["correlaciones_playResult"].items()) + "\n")
w("## 7. Clustering K-Means (numpy, Z-score)\n")
w(f"Variables: {', '.join(FEATS)}. Etiqueta: si centroide yds_to_endzone <= 40 -> '{LABEL_RED_ZONE}'; resto por rasgo z dominante.\n")
for kk, c in clusters.items():
    w(f"### {kk}: varianza explicada {c['varianza_explicada_pct']}%, silhouette {c['silhouette_muestra']}, estabilidad {c['estabilidad_semillas']}\n")
    w("| Cluster | Etiqueta | n | % | " + " | ".join(FEATS) + " | explosiva | sack | SOE | trampa |")
    w("|" + "---|" * (8 + len(FEATS)))
    for p in c["clusters"]:
        w(f"| {p['cluster']} | {p['etiqueta']} | {p['n']} | {p['pct']} | "
          + " | ".join(str(p["centroide_real"][f_]) for f_ in FEATS)
          + f" | {p['tasa_explosiva']:.3f} | {p['tasa_sack']:.3f} | {p['soe_promedio']:.3f} | {p['tasa_trampa']:.3f} |")
    w("")
w("## 8. Exportacion web\n")
w(f"- `data/insights_partido.json`: {(DATA / 'insights_partido.json').stat().st_size / 1e6:.2f} MB")
w(f"- `data/featured_plays_tracking.json`: {(DATA / 'featured_plays_tracking.json').stat().st_size / 1e6:.2f} MB, "
  f"{len(featured_tracking)} jugadas ({', '.join(f'{t}={sum(1 for v in tag_of.values() if v == t)}' for t in pools)})")
DOCS.mkdir(exist_ok=True)
(DOCS / "reporte_arquitectura_datos.md").write_text("\n".join(L), encoding="utf-8")
log("LISTO", kpis)
