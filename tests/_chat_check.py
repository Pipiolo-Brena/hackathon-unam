"""Prueba manual de /api/chat contra Amazon Nova (requiere credenciales en .env; no imprime llaves).

Uso: .venv/Scripts/python tests/_chat_check.py ["pregunta"]
El nombre empieza con '_' para que pytest no la recoja (llama a Bedrock y cuesta tokens).
"""
import json
import os
import sys
import tempfile
import time
from pathlib import Path

os.environ.pop("SSLKEYLOGFILE", None)  # en Windows hace abortar OpenSSL
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from fastapi.testclient import TestClient  # noqa: E402

from backend.main import app  # noqa: E402

PREGUNTA = sys.argv[1] if len(sys.argv) > 1 else "¿Cuál es el hallazgo más importante de separación bajo presión?"
log_path = Path(os.environ.get("CHAT_CHECK_LOG", Path(tempfile.gettempdir()) / "chat_check.log"))
t = time.time()
r = TestClient(app).post("/api/chat", json={"message": PREGUNTA, "mode": "coach"})
body = r.json()
used = set(body.get("tools_used", []))
chk = body.get("recommended_play_check", {})
checks = {
    "source == bedrock": body.get("source") == "bedrock",
    "tools_used incluye get_rules": "get_rules" in used,
    "tools_used incluye get_player_rankings": "get_player_rankings" in used,
    "cierra con search_featured_plays": (body.get("tool_sequence") or [None])[-1] == "search_featured_plays",
    "protocolo_ok": bool(body.get("protocolo_ok")),
    "jugada con separacion <= 12 yd": bool(chk.get("realista")),
}
txt = (f"status {r.status_code} | {time.time() - t:.1f} s\n"
       + "\n".join(f"[{'OK' if v else 'FALLA'}] {k}" for k, v in checks.items()) + "\n"
       + json.dumps(body, ensure_ascii=False, indent=1))
log_path.write_text(txt, encoding="utf-8")
print(txt)
print("log:", log_path)
