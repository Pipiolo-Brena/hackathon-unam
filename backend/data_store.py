"""Carga de solo lectura de los JSON generados por scripts/01_analisis_y_clustering.py."""
import json
from functools import lru_cache
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"
INSIGHTS_FILE = DATA / "insights_partido.json"
TRACKING_FILE = DATA / "featured_plays_tracking.json"


class DataNotReady(RuntimeError):
    pass


def _read(path: Path) -> dict:
    if not path.exists():
        raise DataNotReady(f"Falta {path.name}. Ejecuta scripts/01_analisis_y_clustering.py")
    return json.loads(path.read_text(encoding="utf-8"))


@lru_cache(maxsize=1)
def insights() -> dict:
    return _read(INSIGHTS_FILE)


@lru_cache(maxsize=1)
def tracking() -> dict:
    return _read(TRACKING_FILE)["plays"]


def featured_plays() -> list[dict]:
    return insights()["featured_plays"]


def find_play(game_id: int, play_id: int) -> dict | None:
    return next((p for p in featured_plays() if p["gameId"] == game_id and p["playId"] == play_id), None)


def filter_plays(cluster_id: int | None = None, coverage: str | None = None,
                 team: str | None = None, tag: str | None = None) -> list[dict]:
    out = featured_plays()
    if cluster_id is not None:
        out = [p for p in out if p.get("cluster_id") == cluster_id]
    if coverage:
        c = coverage.strip().lower()
        out = [p for p in out if (p.get("pff_passCoverage") or "").lower() == c]
    if team:
        t = team.strip().upper()
        out = [p for p in out if t in (p.get("possessionTeam"), p.get("defensiveTeam"))]
    if tag:
        g = tag.strip().lower()
        out = [p for p in out if g in p.get("tags", [])]
    return out


def play_frames(game_id: int, play_id: int) -> dict | None:
    """Expande el formato compacto a registros con todos los campos por entidad y frame."""
    raw = tracking().get(f"{game_id}_{play_id}")
    if raw is None:
        return None
    roster = raw["roster"]
    frames = []
    for fr in raw["frames"]:
        ents = []
        for ri, x, y, o, d, s in fr["p"]:
            r = roster[ri]
            ents.append({"nflId": r["nflId"], "displayName": r["displayName"], "jerseyNumber": r["jerseyNumber"],
                         "team": r["team"], "pff_role": r["pff_role"], "x": x, "y": y, "o": o, "dir": d, "s": s})
        frames.append({"frameId": fr["frameId"], "event": fr["event"], "entities": ents})
    return {"gameId": game_id, "playId": play_id, "field": {"length": 120, "width": 53.3, "attack": "right"},
            "play": find_play(game_id, play_id), "frames": frames}
