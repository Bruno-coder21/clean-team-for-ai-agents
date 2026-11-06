"""Registers a data-free probe agent owned by a non-admin account, and saves its key next to the registration key.

The probe has no LLM, no session and no data. We use it for three things:
  - testing the wall against the server directly (wall_test.py),
  - applying advanced config to a managed agent of the same owner (apply_advanced_config.py),
  - the wall guard that evicts the analista from any other room (../muro.py).

Usage: python3 -I register_probe.py <env file> [probe name]
The env file must hold SWITCH_REG_KEY=<registration key created on the Gateway's API Keys page,
signed in as the non-admin account>. Keep it outside git, mode 600. Nothing secret is printed.
"""

import json
import os
import sys
import urllib.error
import urllib.request

BASE = "http://127.0.0.1:53945"
env_path = os.path.expanduser(sys.argv[1])
name = sys.argv[2] if len(sys.argv) > 2 else "t6b-sonda"

env = {}
with open(env_path, encoding="utf-8") as f:
    for line in f:
        if "=" in line:
            k, v = line.strip().split("=", 1)
            env[k] = v
if "SWITCH_SONDA_ID" in env:
    print("probe already registered; nothing to do")
    sys.exit(0)

body = {
    "name": name,
    "description": "Data-free probe: wall tests and room hygiene. Runs no session.",
    "connector_type": "test-probe",
    "integration_profile": {
        "connection_model": "session_passive",
        "message_exchange": False,
        "pre_invocation_mediation": [],
        "post_invocation_mediation": [],
        "event_reporting": [],
    },
}
req = urllib.request.Request(f"{BASE}/agents", data=json.dumps(body).encode(), method="POST")
req.add_header("Authorization", "Bearer " + env["SWITCH_REG_KEY"])
req.add_header("Content-Type", "application/json")
try:
    with urllib.request.urlopen(req, timeout=30) as r:
        result = json.loads(r.read())
except urllib.error.HTTPError as e:
    print("registration failed:", e.code, e.read().decode(errors="replace")[:300])
    sys.exit(1)

fd = os.open(env_path, os.O_WRONLY | os.O_APPEND)
with os.fdopen(fd, "a") as f:
    f.write(f"SWITCH_SONDA_ID={result['id']}\nSWITCH_SONDA_KEY={result['api_key']}\n")
print("probe registered:", name, result["id"])
