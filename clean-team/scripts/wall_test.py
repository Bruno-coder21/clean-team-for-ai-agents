"""Teste da parede na configuracao final, com a sonda de dono clean-team, que nao e membro das salas finais. Nao imprime chaves."""

import json
import os
import urllib.error
import urllib.request

BASE = "http://127.0.0.1:53945"
DEAL = "c318dcaa-7704-46ed-bea9-25d98675f00f"
CLEAN = "47e144f5-005c-45bc-b6dc-62dbc59cdac6"

env = {}
with open(os.path.expanduser("~/.config/clean-team/.env"), encoding="utf-8") as f:
    for linha in f:
        if "=" in linha:
            k, v = linha.strip().split("=", 1)
            env[k] = v
agente, chave = env["SWITCH_SONDA_ID"], env["SWITCH_SONDA_KEY"]


def op(rotulo, nome, args):
    req = urllib.request.Request(f"{BASE}/agents/{agente}/ops/{nome}", data=json.dumps(args).encode(), method="POST")
    req.add_header("Authorization", "Bearer " + chave)
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            status, corpo = r.status, json.loads(r.read() or b"null")
    except urllib.error.HTTPError as e:
        status, corpo = e.code, e.read().decode(errors="replace")[:200]
    print(f"{rotulo} | {nome} | {status} | {json.dumps(corpo, ensure_ascii=False)[:160]}")


op("1 deal-team", "read_context", {"room_id": DEAL})
op("2 deal-team", "connect_to_room", {"room_id": DEAL})
op("3 deal-team", "invite_agent_to_room", {"room_id": DEAL, "agent_name": "t6b-sonda"})
op("4 deal-team", "invite_agent_to_room", {"room_id": DEAL, "agent_name": "analista"})
op("5 clean-team", "add_users_to_room", {"room_id": CLEAN, "user_names": ["meridian-exec"]})
op("6 clean-team", "read_context", {"room_id": CLEAN})
