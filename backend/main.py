"""API del proyecto. Ejecuta: .venv/Scripts/uvicorn backend.main:app --reload"""
import os
from pathlib import Path


def cargar_env():
    f = Path(__file__).resolve().parent.parent / ".env"
    if f.exists():
        for linea in f.read_text(encoding="utf-8-sig").splitlines():
            linea = linea.strip()
            if linea and not linea.startswith("#") and "=" in linea:
                k, v = linea.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


cargar_env()
# En Windows, SSLKEYLOGFILE (lo define el terminal del IDE) hace que OpenSSL aborte el proceso
# ("no OPENSSL_Applink") al abrir TLS, por ejemplo al llamar a Bedrock. Solo sirve para depurar TLS.
if os.name == "nt":
    os.environ.pop("SSLKEYLOGFILE", None)

from fastapi import FastAPI, HTTPException, Query  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from fastapi.staticfiles import StaticFiles  # noqa: E402
from pydantic import BaseModel, Field  # noqa: E402

from backend import data_store as ds  # noqa: E402
from backend.agent import chat as agent_chat  # noqa: E402

app = FastAPI(title="Hackathon NFL UNAM")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["GET", "POST"], allow_headers=["*"])


def _data(fn, *a, **kw):
    try:
        return fn(*a, **kw)
    except ds.DataNotReady as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/api/overview")
def overview() -> dict:
    ins = _data(ds.insights)
    return {"kpis": ins["kpis"], "coberturas": ins["distribuciones"]["cobertura"],
            "tipo_cobertura": ins["distribuciones"]["tipo_cobertura"],
            "formaciones": ins["distribuciones"]["formacion"],
            "curva_tiempo_bolsa": ins["curva_tiempo_bolsa"],
            "reglas_tiempo_bolsa": ins["reglas"]["por_tiempo_bolsa"],
            "reglas_cobertura": ins["reglas"]["por_cobertura"],
            "reglas_formacion": ins["reglas"]["por_formacion"],
            "reglas_play_action": ins["reglas"]["por_play_action"]}


@app.get("/api/research-insights")
def research_insights() -> dict:
    ins = _data(ds.insights)
    return {"clusters": ins["clusters"]["k4"], "rankings": ins["rankings"],
            "trampa_presion": ins["trampa_presion"], "metodologia": ins["meta"]}


@app.get("/api/plays")
def plays(cluster_id: int | None = Query(None, ge=0, le=3), coverage: str | None = None,
          team: str | None = Query(None, max_length=4), tag: str | None = None) -> dict:
    items = _data(ds.filter_plays, cluster_id, coverage, team, tag)
    return {"count": len(items), "plays": items}


@app.get("/api/plays/{game_id}/{play_id}/tracking")
def play_tracking(game_id: int, play_id: int) -> dict:
    out = _data(ds.play_frames, game_id, play_id)
    if out is None:
        raise HTTPException(status_code=404, detail="Jugada sin tracking destacado")
    return out


class ChatIn(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    mode: str = Field("coach", pattern="^(coach|broadcast)$")


@app.post("/api/chat")
def chat(body: ChatIn) -> dict:
    _data(ds.insights)
    return agent_chat(body.message, body.mode)


_dist = Path(__file__).resolve().parent.parent / "dashboard" / "dist"
if _dist.exists():
    app.mount("/", StaticFiles(directory=_dist, html=True), name="dashboard")
