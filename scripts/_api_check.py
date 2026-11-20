"""Prueba de humo de la API en proceso con TestClient."""
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from fastapi.testclient import TestClient  # noqa: E402

from backend.main import app  # noqa: E402

c = TestClient(app)
out = open(Path(__file__).with_name("api_check_final.log"), "w", encoding="utf-8")


def p(*a):
    print(*a, file=out, flush=True)


p("health", c.get("/health").json())
ov = c.get("/api/overview").json()
p("overview", list(ov), "curva", len(ov["curva_tiempo_bolsa"]))
ri = c.get("/api/research-insights").json()
p("research", [x["etiqueta"] for x in ri["clusters"]["clusters"]],
  {k: len(v) for k, v in ri["rankings"].items() if isinstance(v, list)})
pl = c.get("/api/plays").json()
p("plays", pl["count"])
for q in ["?tag=trampa_presion", "?tag=soe", "?tag=hip_flip", "?tag=explosiva", "?cluster_id=0", "?coverage=Cover-1", "?team=KC", "?cluster_id=9"]:
    r = c.get("/api/plays" + q)
    p("plays" + q, r.status_code, r.json().get("count"))
pp = pl["plays"][0]
tk = c.get(f"/api/plays/{pp['gameId']}/{pp['playId']}/tracking").json()
p("tracking", len(tk["frames"]), len(tk["frames"][0]["entities"]), tk["frames"][0]["entities"][0])
p("tracking 404", c.get("/api/plays/1/1/tracking").status_code)
p("chat 422", c.post("/api/chat", json={"message": ""}).status_code)
t = time.time()
r = c.post("/api/chat", json={"message": "¿Cómo atacar la presión contra Cover-1?", "mode": "coach"})
p("chat", r.status_code, round(time.time() - t, 1), "s", json.dumps(r.json(), ensure_ascii=False)[:900])
p("FIN")
