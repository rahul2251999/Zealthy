from __future__ import annotations

import os
import sys
from pathlib import Path

from mangum import Mangum

REPO_ROOT = Path(__file__).resolve().parents[2]
SERVER_DIR = REPO_ROOT / "server"

# Make sure Python can find our FastAPI app modules.
sys.path.append(str(SERVER_DIR))

# Netlify Functions only allow writing to /tmp, so point SQLite there by default.
os.environ.setdefault("DB_PATH", str(Path("/tmp/zealthy/db.sqlite3")))

from main import app as fastapi_app  # noqa: E402

# Strip the /api prefix added by the Netlify redirect before handing to FastAPI.
handler = Mangum(fastapi_app, api_gateway_base_path="/api")
