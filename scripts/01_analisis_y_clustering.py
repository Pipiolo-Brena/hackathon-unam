"""Pipeline de datos NFL BDB: llaves, normalizacion, metricas, metricas ineditas y K-Means (numpy).

Solo pandas y numpy. Procesa un archivo de tracking a la vez para limitar memoria.
Salidas:
  docs/reporte_arquitectura_datos.md
  data/insights_partido.json          (agregados para la web)
  data/featured_plays_tracking.json   (60 jugadas destacadas frame a frame, compacto)
Ejecutar: .venv/Scripts/python scripts/01_analisis_y_clustering.py

Frame de llegada del pase (prioridad):
  1. evento observado pass_arrived / pass_outcome_caught
  2. el balon se frena (< 5 yd/s tras el lanzamiento: desvio o pase bateado) -> frame de velocidad minima
  3. cruce balon-receptor: punto de maximo acercamiento entre la trayectoria del balon y la del receptor;
     si ocurre dentro de los frames grabados se usa ese frame; si no, se extrapola linealmente desde el
     ultimo frame (balon y jugadores con su velocidad) hasta MAX_EXTRAP_S. Nunca el penultimo frame.
Receptor objetivo: nombre en playDescription ("pass ... to C.Godwin"); si no se encuentra, el route
runner con maximo acercamiento a la trayectoria del balon.
"""
import json
import math
import os
import re
import time
import unicodedata
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
ARRIVE_EVENTS = {"pass_arrived", "pass_outcome_caught"}
END_EVENTS = {"tackle", "out_of_bounds", "touchdown", "qb_sack", "qb_slide", "fumble", "safety",
              "pass_outcome_touchdown", "pass_outcome_incomplete", "pass_outcome_interception",
              "touchback", "qb_strip_sack"}
BALL_STOP_SPEED = 5.0    # yd/s
MAX_EXTRAP_S = 2.5       # s de extrapolacion maxima tras el ultimo frame
MIN_SPEED_HIP = 1.0      # yd/s: por debajo, 'dir' es ruido
SEP_TRAP = 3.5           # yd
FEAT_SEP_MIN, FEAT_SEP_MAX = 1.0, 12.0
MIN_N_RANK = 15          # targets / jugadas minimas para rankings
N_FEATURED_PER_TAG = 15
MIN_TRAP_COMPLETIONS = 10
TRAP_BAND = (4.5, 6.5)   # yd: separacion tipica de una trampa completa
OBSERVED_ARRIVALS = {"pass_arrived", "pass_outcome_caught", "cruce_observado", "ball_min_speed"}
POS_WR_TE, POS_RB_FB = {"WR", "TE"}, {"RB", "FB"}
LABEL_RED_ZONE = "Zona Roja / Compresión de Campo"
T_START = time.time()


def log(*a):
    print(f"[{time.time() - T_START:6.1f}s]", *a, flush=True)


def pct(x, n):
    return round(100.0 * x / n, 2) if n else None


def clean(o):
    """Convierte numpy/NaN a tipos JSON."""
    if isinstance(o, dict):
        return {str(k): clean(v) for k, v in o.items()}
    if isinstance(o, (list, tuple)):
        return [clean(v) for v in o]
    if isinstance(o, np.integer):
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


def _key(s):
    s = unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z]", "", s.lower())


_SUFFIX = re.compile(r"\s+(Jr\.?|Sr\.?|II|III|IV|V)$")
_DESC_TARGET = re.compile(r"\bpass\b[^.\[\(]*?\bto\s+([A-Z][A-Za-z]{0,2})\.\s?(.{0,40})")


def parse_target(desc, cands, names):
    """nflId del receptor nombrado en la descripcion, entre los ofensivos del campo (o None)."""
    m = _DESC_TARGET.search(desc or "")
    if not m:
        return None
    ini, rest = m.group(1).lower(), _key(m.group(2))
    best, best_len = None, 0
    for nid in cands:
        nm = names.get(nid)
        if not nm or " " not in nm:
            continue
        first, last = nm.split(" ", 1)
        lk = _key(_SUFFIX.sub("", last))
        if lk and rest.startswith(lk) and first.lower().startswith(ini) and len(lk) > best_len:
            best, best_len = nid, len(lk)
    return best


def closest_approach(p, v, tmax):
    """p, v: [k,2] posicion y velocidad relativas (balon - jugador). t* en [0, tmax] y distancia."""
    vv = (v ** 2).sum(1)
    t = np.where(vv > 1e-9, -(p * v).sum(1) / np.where(vv > 1e-9, vv, 1.0), 0.0)
    t = np.clip(t, 0.0, tmax)
    d = np.hypot(p[:, 0] + v[:, 0] * t, p[:, 1] + v[:, 1] * t)
    return t, d


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
desc_by_key = dict(zip(zip(plays.gameId, plays.playId), plays.playDescription))
names = dict(zip(players.nflId.astype(int), players.displayName))
track_keys, track_nfl = set(), set()
tr = {"filas": 0, "filas_balon": 0, "filas_jugador": 0, "duplicados_llave": 0,
      "nulos_jugador": {}, "nulos_balon": {}, "dir_left": 0, "dir_right": 0,
      "jugadas_frames_irregulares": 0, "check_ofensiva_izq": 0, "check_total": 0,
      "fuente_llegada": defaultdict(int), "fuente_objetivo": defaultdict(int),
      "objetivo_desc_vs_trayectoria": {"comparadas": 0, "coinciden": 0}, "frames_tras_lanzamiento": []}
frames_por_jugada = []
cols_check = ["x", "y", "s", "a", "dis", "o", "dir", "event", "jerseyNumber", "nflId"]
usecols = ["gameId", "playId", "nflId", "frameId", "team", "playDirection",
           "x", "y", "s", "a", "dis", "o", "dir", "event", "jerseyNumber"]
rows = []
t_read = t_play = 0.0

for fi, f in enumerate(tfiles):
    t_a = time.time()
    t = pd.read_csv(f, usecols=usecols)
    t_read += time.time() - t_a
    t_b = time.time()
    tr["filas"] += len(t)
    isball = t.team.eq("football").to_numpy()
    tr["filas_balon"] += int(isball.sum())
    tr["filas_jugador"] += int((~isball).sum())
    tr["duplicados_llave"] += int(t.duplicated(["gameId", "playId", "nflId", "frameId"]).sum())
    na = t[cols_check].isna()
    for c in cols_check:
        tr["nulos_jugador"][c] = tr["nulos_jugador"].get(c, 0) + int(na[c].to_numpy()[~isball].sum())
        tr["nulos_balon"][c] = tr["nulos_balon"].get(c, 0) + int(na[c].to_numpy()[isball].sum())
    track_keys.update(map(tuple, t[["gameId", "playId"]].drop_duplicates().to_numpy()))
    normalize(t)
    firsts = t.drop_duplicates(["gameId", "playId"]).playDirection
    tr["dir_left"] += int(firsts.eq("left").sum())
    tr["dir_right"] += int(firsts.eq("right").sum())

    ball = t[isball].sort_values(["playId", "frameId"])
    ply = t[~isball].sort_values(["playId", "nflId", "frameId"])
    track_nfl.update(ply.nflId.astype(int).unique())
    gid = int(t.gameId.iloc[0])
    # cortes por jugada sobre arrays numpy (evita groupby de DataFrames)
    P_pid = ply.playId.to_numpy()
    cut = np.flatnonzero(np.diff(P_pid)) + 1
    starts, ends = np.r_[0, cut], np.r_[cut, len(P_pid)]
    A_x, A_y, A_s, A_a = (ply[c].to_numpy(float) for c in ("x", "y", "s", "a"))
    A_o, A_dir = ply.o.to_numpy(float), ply.dir.to_numpy(float)
    A_ev, A_id, A_fr, A_tm = ply.event.to_numpy(object), ply.nflId.to_numpy(), ply.frameId.to_numpy(), ply.team.to_numpy()
    B_pid = ball.playId.to_numpy()
    bcut = np.flatnonzero(np.diff(B_pid)) + 1
    bslices = {int(B_pid[s]): (s, e) for s, e in zip(np.r_[0, bcut], np.r_[bcut, len(B_pid)])} if len(B_pid) else {}
    B_x, B_y, B_s, B_fr = (ball[c].to_numpy(float) for c in ("x", "y", "s", "frameId"))

    for s_, e_ in zip(starts, ends):
        pid = int(P_pid[s_])
        key = (gid, pid)
        poss = poss_by_key.get(key)
        if poss is None:
            continue
        ids = A_id[s_:e_]
        uid, cnt = np.unique(ids, return_counts=True)
        F = int(cnt.max())
        frames_por_jugada.append(F)
        if not (cnt == F).all():
            tr["jugadas_frames_irregulares"] += 1
            continue
        n = len(uid)
        sh = (n, F)
        X, Y, S, A = (arr[s_:e_].reshape(sh) for arr in (A_x, A_y, A_s, A_a))
        O, DIR = A_o[s_:e_].reshape(sh), A_dir[s_:e_].reshape(sh)
        FR = A_fr[s_:e_].reshape(sh)[0]
        TM = A_tm[s_:e_].reshape(sh)[:, 0]
        EV = A_ev[s_:e_].reshape(sh)
        has = ~pd.isna(EV)
        ev = np.where(has.any(0), EV[has.argmax(0), np.arange(F)], "").tolist()  # primer evento no nulo por frame
        off = TM == poss
        dd = ~off
        if off.sum() == 0 or dd.sum() == 0:
            continue
        s0 = next((ev.index(e) for e in SNAP_EVENTS if e in ev), 0)
        e0 = next((j for j in range(s0, F) if ev[j] in END_EVENTS), F - 1)
        t0 = next((j for j in range(s0, F) if ev[j] in THROW_EVENTS), None)
        L = F - 1
        tr["check_total"] += 1
        tr["check_ofensiva_izq"] += int(np.nanmean(X[off, s0]) < np.nanmean(X[dd, s0]))
        sl = slice(s0, e0 + 1)
        r = {"gameId": gid, "playId": pid, "frames": F, "snap_frame": int(FR[s0]),
             "dev_time_s": (e0 - s0) / 10.0,
             "time_to_throw_s": ((t0 - s0) / 10.0) if t0 is not None else np.nan,
             "max_speed_off": float(np.nanmax(S[off][:, sl])),
             "max_speed_def": float(np.nanmax(S[dd][:, sl])),
             "max_acc_off": float(np.nanmax(A[off][:, sl])),
             "max_acc_def": float(np.nanmax(A[dd][:, sl]))}
        roles = np.array([pff_role.get((gid, pid, int(u)), "") for u in uid])
        rr = off & (roles == "pass route")
        r["n_route"] = int(rr.sum())
        if rr.any():
            PO = np.stack([X[rr][:, sl], Y[rr][:, sl]], -1)
            PD = np.stack([X[dd][:, sl], Y[dd][:, sl]], -1)
            near = np.nanmin(np.sqrt(((PO[:, None] - PD[None]) ** 2).sum(-1)), axis=1)
            r["sep_min_route_yd"] = float(np.nanmin(near))
            r["sep_mean_route_yd"] = float(np.nanmean(near))
        if t0 is None:  # sack / scramble / sin lanzamiento: no hay objetivo
            tr["fuente_llegada"]["sin_lanzamiento"] += 1
            rows.append(r)
            continue
        tr["frames_tras_lanzamiento"].append(L - t0)
        # balon alineado a los frames de la jugada
        bs_, be_ = bslices.get(pid, (0, 0))
        bmap_x = dict(zip(B_fr[bs_:be_].astype(int), B_x[bs_:be_]))
        bmap_y = dict(zip(B_fr[bs_:be_].astype(int), B_y[bs_:be_]))
        bmap_s = dict(zip(B_fr[bs_:be_].astype(int), B_s[bs_:be_]))
        bx = np.array([bmap_x.get(int(fr_), np.nan) for fr_ in FR])
        by = np.array([bmap_y.get(int(fr_), np.nan) for fr_ in FR])
        bsp = np.array([bmap_s.get(int(fr_), np.nan) for fr_ in FR])
        # candidatos: ofensivos del campo; route runners para la trayectoria
        off_idx = np.flatnonzero(off)
        cand_ids = [int(uid[i]) for i in off_idx]
        tgt_desc = parse_target(desc_by_key.get(key), cand_ids, names)
        rad = np.deg2rad(DIR[:, L])
        VX, VY = S[:, L] * np.sin(rad), S[:, L] * np.cos(rad)  # dir: 0 = +y, horario
        k = max(t0, L - 2)
        bvx = (bx[L] - bx[k]) / max((L - k) / 10.0, 0.1)
        bvy = (by[L] - by[k]) / max((L - k) / 10.0, 0.1)
        win = np.arange(t0, L + 1)

        def approach(idx):
            """(t_extrap, frame_obs, dist) de maximo acercamiento balon-jugador para indices idx."""
            dobs = np.hypot(X[idx][:, win] - bx[win], Y[idx][:, win] - by[win])  # [k, W]
            jmin = np.nanargmin(np.where(np.isnan(dobs), np.inf, dobs), axis=1)
            dmin = dobs[np.arange(len(idx)), jmin]
            obs = jmin < len(win) - 1  # ya paso el punto de maximo acercamiento
            p = np.stack([bx[L] - X[idx, L], by[L] - Y[idx, L]], 1)
            v = np.stack([bvx - VX[idx], bvy - VY[idx]], 1)
            te, de = closest_approach(p, v, MAX_EXTRAP_S)
            return np.where(obs, 0.0, te), np.where(obs, win[jmin], -1), np.where(obs, dmin, de)

        a_ev = next((j for j in range(t0, F) if ev[j] in ARRIVE_EVENTS), None)
        # balon frenado: cae bajo BALL_STOP_SPEED despues de su velocidad pico en vuelo
        fl = bsp[t0:]
        pk_i = int(np.nanargmax(fl)) if np.isfinite(fl).any() else len(fl)
        stop = (np.flatnonzero(fl[pk_i + 1:] < BALL_STOP_SPEED)
                if pk_i < len(fl) - 1 and fl[pk_i] >= 2 * BALL_STOP_SPEED else np.array([]))
        rt_idx = np.flatnonzero(rr) if rr.any() else off_idx
        te_all, fo_all, d_all = approach(rt_idx)
        traj_tgt = int(uid[rt_idx[int(np.argmin(np.where(np.isnan(d_all), np.inf, d_all)))]])
        if tgt_desc is not None:
            ti = int(np.flatnonzero(uid == tgt_desc)[0])
            tr["fuente_objetivo"]["descripcion"] += 1
            tr["objetivo_desc_vs_trayectoria"]["comparadas"] += 1
            tr["objetivo_desc_vs_trayectoria"]["coinciden"] += int(tgt_desc == traj_tgt)
        else:
            ti = int(np.flatnonzero(uid == traj_tgt)[0])
            tr["fuente_objetivo"]["trayectoria"] += 1
        if a_ev is not None:
            src, a_fr, t_ex = ev[a_ev], a_ev, 0.0
            dball = float(np.hypot(X[ti, a_fr] - bx[a_fr], Y[ti, a_fr] - by[a_fr]))
        elif len(stop):
            a_fr = int(t0 + pk_i + 1 + np.nanargmin(fl[pk_i + 1:]))
            src, t_ex = "ball_min_speed", 0.0
            dball = float(np.hypot(X[ti, a_fr] - bx[a_fr], Y[ti, a_fr] - by[a_fr]))
        else:
            te, fo, dist_ = approach(np.array([ti]))
            if fo[0] >= 0:
                src, a_fr, t_ex = "cruce_observado", int(fo[0]), 0.0
            else:
                src, a_fr, t_ex = "cruce_extrapolado", None, float(te[0])
            dball = float(dist_[0])
        tr["fuente_llegada"][src] += 1
        # posiciones en la llegada (observadas o extrapoladas desde el ultimo frame)
        if a_fr is not None:
            PX, PY = X[:, a_fr], Y[:, a_fr]
        else:
            PX, PY = X[:, L] + VX * t_ex, Y[:, L] + VY * t_ex
        def_idx = np.flatnonzero(dd)
        dd_dist = np.hypot(PX[def_idx] - PX[ti], PY[def_idx] - PY[ti])
        r.update({"arrival_source": src, "arrival_frame": None if a_fr is None else int(FR[a_fr]),
                  "arrival_extrap_s": round(t_ex, 2), "dist_ball_target_yd": dball,
                  "target_nflId": int(uid[ti]), "target_from_desc": int(tgt_desc is not None),
                  "sep_target_arrival_yd": float(np.nanmin(dd_dist)),
                  "nearest_def_nflId": int(uid[def_idx[int(np.nanargmin(dd_dist))]])})
        cov_idx = np.flatnonzero(dd & (roles == "coverage"))
        if len(cov_idx):
            cd = np.hypot(PX[cov_idx] - PX[ti], PY[cov_idx] - PY[ti])
            ci = int(cov_idx[int(np.nanargmin(cd))])
            seg = slice(s0, (a_fr if a_fr is not None else L) + 1)
            diff = ang_diff(O[ci, seg], DIR[ci, seg])
            diff = np.where(S[ci, seg] >= MIN_SPEED_HIP, diff, np.nan)
            r["cov_def_nflId"] = int(uid[ci])
            r["hip_flip_deg"] = float(np.nanmax(diff)) if np.isfinite(diff).any() else np.nan
        rows.append(r)
    t_play += time.time() - t_b
    if (fi + 1) % 20 == 0 or fi + 1 == len(tfiles):
        log("tracking", fi + 1, "/", len(tfiles), "jugadas", len(rows),
            f"| lectura {t_read:.1f}s, calculo {t_play:.1f}s")

trk = pd.DataFrame(rows)
fr = np.array(frames_por_jugada)
ftl = np.array(tr.pop("frames_tras_lanzamiento"))
tr["frames_por_jugada"] = {"min": int(fr.min()), "mediana": float(np.median(fr)), "max": int(fr.max())}
tr["frames_tras_lanzamiento"] = {"mediana": float(np.median(ftl)), "pct_5_o_menos": pct((ftl <= 5).sum(), len(ftl))}
tr["fuente_llegada"] = dict(tr["fuente_llegada"])
tr["fuente_objetivo"] = dict(tr["fuente_objetivo"])
cv = tr["objetivo_desc_vs_trayectoria"]
cv["pct_coinciden"] = pct(cv["coinciden"], cv["comparadas"])
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
log("llegada", tr["fuente_llegada"], "| objetivo", tr["fuente_objetivo"], "| desc vs trayectoria", cv)

# ================================================================ tabla de jugadas
P = plays.merge(games[["gameId", "week", "homeTeamAbbr", "visitorTeamAbbr"]], on="gameId", how="left")
P = P.merge(trk, on=["gameId", "playId"], how="left")
pf = pff[["gameId", "playId", "pff_role", "pff_hit", "pff_hurry", "pff_sack"]].copy()
for c in ["pff_hit", "pff_hurry", "pff_sack"]:
    pf[c] = pf[c].fillna(0)
pf["is_rush"] = (pf.pff_role == "pass rush").astype(int)
pres = pf.groupby(["gameId", "playId"]).agg(n_pass_rush=("is_rush", "sum"), hurries=("pff_hurry", "sum"),
                                             hits=("pff_hit", "sum"), sacks=("pff_sack", "sum")).reset_index()
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
pos = players.set_index("nflId").officialPosition
P["target_pos"] = P.target_nflId.map(pos)
P["cov_def_pos"] = P.cov_def_nflId.map(pos)

# ---------------- Metrica inedita 1: Separacion Sobre lo Esperado (SOE)
P["sep_esperada_yd"] = P.groupby(["coverage", "zona_campo"]).sep_target_arrival_yd.transform("mean")
P["SOE"] = P.sep_target_arrival_yd - P.sep_esperada_yd
# ---------------- Metrica inedita 3: Trampa de Presion (solo pases lanzados: sep definida)
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
        "pases_con_objetivo": int(P.sep_target_arrival_yd.notna().sum()),
        "cobertura_hip_flip": int(P.hip_flip_deg.notna().sum()),
        "pct_objetivo_por_descripcion": pct(int(P.target_from_desc.sum()), int(P.target_from_desc.notna().sum()))}
distrib = {"cobertura": vc(P.pff_passCoverage), "tipo_cobertura": vc(P.pff_passCoverageType),
           "formacion": vc(P.offenseFormation), "passResult": vc(P.passResult), "down": vc(P.down),
           "dropBackType": vc(P.dropBackType), "play_action": vc(P.pff_playAction)}
P["ttt_cat"] = pd.cut(P.time_to_throw_s, [0, 2.0, 2.5, 3.0, 4.0, 20], labels=["<=2.0", "2-2.5", "2.5-3", "3-4", ">4"])
P["ttt_bin"] = (np.floor(P.time_to_throw_s.clip(upper=6.0) * 2) / 2)
P["is_c"] = (P.passResult == "C").astype(float)
curva = P.dropna(subset=["ttt_bin"]).groupby("ttt_bin").agg(
    n=("playId", "size"), yds=("playResult", "mean"), explosiva=("explosiva", "mean"),
    presion=("presion", "mean"), completo=("is_c", "mean"),
    sep_objetivo=("sep_target_arrival_yd", "mean")).round(3).reset_index()
curva = curva[curva.n >= 30]
curva_tiempo = [{"t_desde_s": float(r.ttt_bin), "t_hasta_s": float(r.ttt_bin + 0.5),
                 **{c: r[c] for c in curva.columns if c != "ttt_bin"}} for _, r in curva.iterrows()]
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
log("reglas listas")

# ================================================================ K-Means numpy
FEATS = ["down", "yardsToGo", "yds_to_endzone", "score_diff_off", "defendersInBox", "time_event_s",
         "n_pass_rush", "presion", "sep_target_arrival_yd", "max_speed_off", "playResult"]
D = P[FEATS].copy()
D = D.fillna(D.median())
Xz = ((D - D.mean()) / D.std(ddof=0).replace(0, 1)).to_numpy()


def _assign(X, c):
    d2 = (X ** 2).sum(1)[:, None] - 2 * X @ c.T + (c ** 2).sum(1)[None]
    return d2.argmin(1), d2


def kmeans(X, k, seed, iters=200):
    rng = np.random.default_rng(seed)
    c = [X[rng.integers(len(X))]]
    for _ in range(1, k):
        d2 = _assign(X, np.array(c))[1].min(1).clip(min=0)
        c.append(X[rng.choice(len(X), p=d2 / d2.sum())])
    c = np.array(c)
    for _ in range(iters):
        lab = _assign(X, c)[0]
        new = np.array([X[lab == j].mean(0) if (lab == j).any() else c[j] for j in range(k)])
        if np.allclose(new, c):
            break
        c = new
    lab = _assign(X, c)[0]
    return lab, c, float(((X - c[lab]) ** 2).sum())


def silhouette(X, lab, n=2500, seed=0):
    rng = np.random.default_rng(seed)
    idx = rng.choice(len(X), min(n, len(X)), replace=False)
    Xs, ls = X[idx], lab[idx]
    sq = (Xs ** 2).sum(1)
    d = np.sqrt(np.maximum(sq[:, None] + sq[None] - 2 * Xs @ Xs.T, 0))
    ks = np.unique(ls)
    M = np.stack([d[:, ls == k].mean(1) for k in ks], 1)          # distancia media a cada cluster
    cnt = np.array([(ls == k).sum() for k in ks])
    own = np.searchsorted(ks, ls)
    a = (d * (ls[:, None] == ls[None])).sum(1) / np.maximum(cnt[own] - 1, 1)
    M[np.arange(len(ls)), own] = np.inf
    b = M.min(1)
    return float(((b - a) / np.maximum(a, b)).mean())


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


def ranking(df, id_col, metric, team_col, top=15, minn=MIN_N_RANK):
    d = df.dropna(subset=[id_col, metric]).copy()
    d[id_col] = d[id_col].astype(int)
    g = d.groupby(id_col).agg(n=(metric, "size"), valor=(metric, "mean"),
                              team=(team_col, lambda s: s.mode().iat[0]),
                              sep_objetivo=("sep_target_arrival_yd", "mean"), yds=("playResult", "mean"),
                              hip_flip=("hip_flip_deg", "mean"), soe=("SOE", "mean"))
    g = g[g.n >= minn].sort_values("valor", ascending=False).head(top)
    g = g.join(pinfo, how="left").reset_index().rename(columns={id_col: "nflId"})
    g["nflId"] = g.nflId.astype(int)
    return [clean(r) for r in g.round(3).to_dict("records")]


man = P[P.pff_passCoverageType == "Man"]
rankings = {
    "receptores_soe_wr_te": ranking(P[P.target_pos.isin(POS_WR_TE)], "target_nflId", "SOE", "possessionTeam"),
    "receptores_soe_rb_fb": ranking(P[P.target_pos.isin(POS_RB_FB)], "target_nflId", "SOE", "possessionTeam"),
    "defensores_hip_flip_man": ranking(man, "cov_def_nflId", "hip_flip_deg", "defensiveTeam"),
    "receptores_hip_flip_inducido_man": ranking(man[man.target_pos.isin(POS_WR_TE)], "target_nflId",
                                                "hip_flip_deg", "possessionTeam"),
    "base_hip_flip": {"man": float(man.hip_flip_deg.mean()),
                      "zone": float(P[P.pff_passCoverageType == "Zone"].hip_flip_deg.mean())},
    "min_jugadas": MIN_N_RANK,
    "nota": "SOE por grupo de posicion del objetivo; hip_flip solo en cobertura Man (sin backpedal de zona).",
}

# ================================================================ Trampa de presion
pz = P[(P.presion == 1) & P.sep_target_arrival_yd.notna()]   # presionadas con pase lanzado
tz = P[P.checkdown_trap == 1]
trampa = {
    "definicion": f"presion PFF == 1 y sep_target_arrival_yd > {SEP_TRAP} y playResult < yardsToGo (solo pases lanzados)",
    "n": int(len(tz)), "pct_de_jugadas": pct(len(tz), len(P)),
    "pct_de_jugadas_con_presion": pct(len(tz), int((P.presion == 1).sum())),
    "pct_de_pases_con_presion": pct(len(tz), len(pz)),
    "yardas_promedio": float(tz.playResult.mean()),
    "yardas_faltantes_promedio": float((tz.yardsToGo - tz.playResult).mean()),
    "sep_objetivo_promedio": float(tz.sep_target_arrival_yd.mean()),
    "tiempo_lanzar_promedio": float(tz.time_to_throw_s.mean()),
    "completos": int((tz.passResult == "C").sum()),
    "completos_yardas_promedio": float(tz[tz.passResult == "C"].playResult.mean()),
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
               "playDescription", "passResult", "playResult", "prePenaltyPlayResult", "offenseFormation",
               "pff_passCoverage", "pff_passCoverageType", "pff_playAction", "zona_campo", "yds_to_endzone",
               "time_to_throw_s", "presion", "sep_target_arrival_yd", "sep_esperada_yd", "SOE", "hip_flip_deg",
               "checkdown_trap", "max_speed_off", "cluster_id", "cluster_label", "target_nflId", "target_from_desc",
               "cov_def_nflId", "snap_frame", "arrival_frame", "arrival_source", "arrival_extrap_s",
               "dist_ball_target_yd"]
PT = P[P.snap_frame.notna() & P.sep_target_arrival_yd.between(FEAT_SEP_MIN, FEAT_SEP_MAX)]
# Trampas representativas: 1) llegada observada en los frames grabados, 2) separacion dentro de la banda
# tipica (TRAP_BAND), 3) cercania a la mediana del grupo. Evita ejemplos pegados al techo de 12 yd.
trap_pool = PT[(PT.checkdown_trap == 1) & (PT.passResult == "C")].copy()
trap_median = float(trap_pool.sep_target_arrival_yd.median())
trap_pool["_obs"] = (~trap_pool.arrival_source.isin(OBSERVED_ARRIVALS)).astype(int)
trap_pool["_band"] = (~trap_pool.sep_target_arrival_yd.between(*TRAP_BAND)).astype(int)
trap_pool["_dmed"] = (trap_pool.sep_target_arrival_yd - trap_median).abs()
log("trampa completa: mediana sep", round(trap_median, 2), "| observadas", int((trap_pool._obs == 0).sum()),
    "| en banda", int((trap_pool._band == 0).sum()), "de", len(trap_pool))
pools = {  # trampa primero para garantizar sus completos
    "trampa_presion": trap_pool.sort_values(["_obs", "_band", "_dmed"]),
    "explosiva": PT.sort_values(["prePenaltyPlayResult", "SOE"], ascending=False),
    "soe": PT.dropna(subset=["SOE"]).sort_values("SOE", ascending=False),
    "hip_flip": PT[PT.pff_passCoverageType == "Man"].dropna(subset=["hip_flip_deg"]).sort_values(
        ["hip_flip_deg", "playResult"], ascending=False),
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
    log("destacadas", tag, c, "de", len(pool))
n_trap_c = sum(1 for v in tag_of.values() if v == "trampa_presion")
assert n_trap_c >= MIN_TRAP_COMPLETIONS, f"solo {n_trap_c} trampas completas validas"
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

# pasada 2: tracking frame a frame solo de las jugadas destacadas (vectorizado por jugada)
need = defaultdict(set)
for g_, p_ in chosen:
    need[g_].add(p_)
featured_tracking = {}
for gid, pids in need.items():
    t = pd.read_csv(DATA / "tracking" / f"tracking_{gid}.csv",
                    usecols=["gameId", "playId", "nflId", "frameId", "team", "playDirection", "x", "y", "s",
                             "o", "dir", "event", "jerseyNumber"])
    t = normalize(t[t.playId.isin(pids)].copy())
    for pid, g in t.groupby("playId"):
        g = g.sort_values(["frameId", "nflId"], na_position="last")
        ent = g.drop_duplicates("nflId")[["nflId", "team", "jerseyNumber"]]
        roster = []
        for nid_, team_, jn in zip(ent.nflId, ent.team, ent.jerseyNumber):
            ball_row = pd.isna(nid_)
            nid = None if ball_row else int(nid_)
            roster.append({"nflId": nid, "team": team_, "displayName": "football" if ball_row else names.get(nid),
                           "jerseyNumber": None if pd.isna(jn) else int(jn),
                           "pff_role": None if ball_row else pff_role.get((gid, int(pid), nid))})
        ridx = {(-1 if r_["nflId"] is None else r_["nflId"]): i for i, r_ in enumerate(roster)}
        ri = g.nflId.fillna(-1).astype(int).map(ridx).to_numpy()
        vals = np.column_stack([ri, g.x.round(2), g.y.round(2), g.o.round(1), g.dir.round(1), g.s.round(2)])
        fids = g.frameId.to_numpy()
        evs = g.groupby("frameId").event.first()
        frames = []
        for fid in np.unique(fids):
            blk = vals[fids == fid]
            pts = [[int(b[0]), b[1], b[2], None if np.isnan(b[3]) else b[3], None if np.isnan(b[4]) else b[4], b[5]]
                   for b in blk.tolist()]
            e = evs.get(fid)
            frames.append({"frameId": int(fid), "event": None if pd.isna(e) else e, "p": pts})
        featured_tracking[f"{gid}_{int(pid)}"] = {"gameId": int(gid), "playId": int(pid), "roster": roster,
                                                  "frames": frames}
log("tracking destacado", len(featured_tracking))

# ================================================================ salidas
insights = clean({
    "meta": {"fuente": "NFL Big Data Bowl 2023 (semanas 1-8, jugadas de pase)",
             "normalizacion": "ataque siempre a la derecha; x=120-x, y=53.3-y, o/dir +180 cuando playDirection=left",
             "llegada": ("1) pass_arrived/pass_outcome_caught; 2) balon frenado (< 5 yd/s): frame de velocidad minima; "
                         "3) maximo acercamiento balon-receptor, observado o extrapolado linealmente desde el ultimo "
                         f"frame (max {MAX_EXTRAP_S} s). Nunca el penultimo frame. Sin lanzamiento: sin objetivo."),
             "objetivo": "receptor nombrado en playDescription; si no, maximo acercamiento a la trayectoria del balon",
             "hip_flip_nota": f"max |o-dir| (0-180) del Coverage mas cercano al objetivo, snap->llegada observada, s >= {MIN_SPEED_HIP} yd/s",
             "soe_nota": "sep_target_arrival_yd - media de (pff_passCoverage, zona_campo)",
             "featured_filtro": f"sep_target_arrival_yd entre {FEAT_SEP_MIN} y {FEAT_SEP_MAX} yd"},
    "kpis": kpis, "distribuciones": distrib, "curva_tiempo_bolsa": curva_tiempo, "reglas": reglas,
    "equipos_ofensiva": equipos, "clusters": clusters, "rankings": rankings, "trampa_presion": trampa,
    "featured_plays": featured_meta, "diagnostico": diag,
})
(DATA / "insights_partido.json").write_text(json.dumps(insights, ensure_ascii=False, indent=1), encoding="utf-8")
(DATA / "featured_plays_tracking.json").write_text(
    json.dumps(clean({"formato": "p = [indice_roster, x, y, o, dir, s]", "plays": featured_tracking}),
               ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

# ================================================================ reporte markdown
L_ = []
w = L_.append
w("# Reporte de arquitectura de datos\n")
w(f"Generado por `scripts/01_analisis_y_clustering.py` en {time.time() - T_START:.0f} s. {kpis['juegos']} juegos, "
  f"semanas {kpis['semanas'][0]}-{kpis['semanas'][1]}, {kpis['jugadas']} jugadas de pase. Solo pandas y numpy.\n")
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
w("\n## 3. Normalizacion, llegada y receptor objetivo\n")
w(f"left={tr['dir_left']}, right={tr['dir_right']}. Ofensiva a la izquierda de la defensa al snap tras normalizar: "
  f"{diag['pct_ofensiva_izq_al_snap_tras_normalizar']}%.\n")
w(f"El tracking termina {tr['frames_tras_lanzamiento']['mediana']:.0f} frames (mediana) despues del lanzamiento "
  f"({tr['frames_tras_lanzamiento']['pct_5_o_menos']}% de los pases con 5 frames o menos): el balon casi nunca llega "
  "al receptor dentro de los datos.\n")
w("Fuente del frame de llegada: " + ", ".join(f"{k}={v}" for k, v in tr["fuente_llegada"].items()) + ".\n")
w("Fuente del receptor objetivo: " + ", ".join(f"{k}={v}" for k, v in tr["fuente_objetivo"].items())
  + f". Cuando hay nombre en la descripcion, la trayectoria del balon elige al mismo receptor en "
  f"{cv['pct_coinciden']}% de los casos ({cv['coinciden']}/{cv['comparadas']}).\n")
ex = P.arrival_extrap_s[P.arrival_source == "cruce_extrapolado"]
if len(ex):
    w(f"Extrapolacion en cruce_extrapolado: mediana {ex.median():.2f} s, p90 {ex.quantile(0.9):.2f} s, "
      f"{pct((ex >= MAX_EXTRAP_S).sum(), len(ex))}% topado en {MAX_EXTRAP_S} s.\n")
w("## 4. KPIs\n")
for k, v in kpis.items():
    w(f"- {k}: {clean(v)}")
w("\n## 5. Metricas ineditas\n")
for c in ["sep_target_arrival_yd", "SOE", "hip_flip_deg", "dist_ball_target_yd"]:
    s = P[c].describe()
    w(f"- **{c}**: n={int(s['count'])}, media={s['mean']:.3f}, p25={s['25%']:.3f}, mediana={s['50%']:.3f}, p75={s['75%']:.3f}, max={s['max']:.3f}")
w(f"- sep_target_arrival_yd > 12 yd: {pct((P.sep_target_arrival_yd > 12).sum(), P.sep_target_arrival_yd.notna().sum())}% de los pases.")
w(f"- hip_flip_deg base Man {rankings['base_hip_flip']['man']:.1f}° vs Zone {rankings['base_hip_flip']['zone']:.1f}°.")
w(f"\n**Trampa de Presion**: {trampa['n']} jugadas ({trampa['pct_de_jugadas_con_presion']}% de las jugadas con presion, "
  f"{trampa['pct_de_pases_con_presion']}% de los pases lanzados bajo presion). Yardas promedio {trampa['yardas_promedio']:.2f}, "
  f"faltaron {trampa['yardas_faltantes_promedio']:.2f} yd. Completos: {trampa['completos']} "
  f"({trampa['completos_yardas_promedio']:.2f} yd). Resultado: {trampa['por_resultado']}.\n")


def tabla(nombre, lst, col="valor", fmt="{:.3f}"):
    w(f"**{nombre}**\n")
    w("| Jugador | Pos | Equipo | n | valor | sep obj | SOE | hip flip |\n|---|---|---|---|---|---|---|---|")
    for r in lst[:10]:
        w(f"| {r['displayName']} | {r['officialPosition']} | {r['team']} | {r['n']} | {fmt.format(r[col])} | "
          f"{r['sep_objetivo']} | {r['soe']} | {r['hip_flip']} |")
    w("")


tabla("Top SOE WR/TE (min 15 targets)", rankings["receptores_soe_wr_te"])
tabla("Top SOE RB/FB (min 15 targets)", rankings["receptores_soe_rb_fb"])
tabla("Top hip_flip defensores, solo cobertura Man (min 15)", rankings["defensores_hip_flip_man"], fmt="{:.1f}")
tabla("Top hip_flip inducido por WR/TE, solo Man (min 15)", rankings["receptores_hip_flip_inducido_man"], fmt="{:.1f}")
w("## 6. Reglas\n")
for nm in ["por_cobertura", "por_tipo_cobertura", "por_formacion", "por_play_action", "por_tiempo_bolsa",
           "por_zona_campo", "presion_vs_no"]:
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
  f"{len(featured_tracking)} jugadas ({', '.join(f'{t_}={sum(1 for v in tag_of.values() if v == t_)}' for t_ in pools)}), "
  f"todas con separacion entre {FEAT_SEP_MIN} y {FEAT_SEP_MAX} yd; trampa_presion = pases completos.")
DOCS.mkdir(exist_ok=True)
(DOCS / "reporte_arquitectura_datos.md").write_text("\n".join(L_), encoding="utf-8")
log("LISTO", {k: kpis[k] for k in ("pases_con_objetivo", "sep_objetivo_promedio_yd", "tasa_trampa_presion",
                                    "pct_objetivo_por_descripcion")})
