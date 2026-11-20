"""Prueba de conexión de /api/chat con Amazon Nova (no imprime credenciales)."""
import json
import os
import sys
import time
from pathlib import Path

os.environ.pop("SSLKEYLOGFILE", None)
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from fastapi.testclient import TestClient  # noqa: E402

from backend.main import app  # noqa: E402

out = open(Path(__file__).with_name("_chat_check.log"), "w", encoding="utf-8")
print("AWS_REGION:", os.environ.get("AWS_REGION"), "| AWS_DEFAULT_REGION:", os.environ.get("AWS_DEFAULT_REGION"),
      "| BEDROCK_MODEL_ID:", os.environ.get("BEDROCK_MODEL_ID"), file=out, flush=True)
t = time.time()
r = TestClient(app).post("/api/chat", json={"message": "¿Cuál es el hallazgo más importante de separación bajo presión?",
                                             "mode": "coach"})
print("status", r.status_code, "segundos", round(time.time() - t, 1), file=out)
print(json.dumps(r.json(), ensure_ascii=False, indent=1), file=out, flush=True)
