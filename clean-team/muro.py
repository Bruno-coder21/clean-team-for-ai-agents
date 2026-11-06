"""Guarda do muro: mantem o analista so na sala clean-team.

O Switch 0.31 recoloca um agente em toda sala cujo canal do Mattermost tem o bot dele,
toda vez que o servidor inicia. O Mattermost nao deixa ninguem sair de Town Square.
Este script roda a cada minuto, usando um agente de teste da mesma conta do analista,
e tira o analista de qualquer sala que nao seja a clean-team. Nao imprime chaves.

Uso: python3 -I muro.py <arquivo .env com SWITCH_SONDA_ID e SWITCH_SONDA_KEY>
"""

import json
import sys
import time
import urllib.error
import urllib.request

BASE = "http://127.0.0.1:53945"
AGENTE = "analista"
SALA_PERMITIDA = "clean-team"
SALA_PERMITIDA_ID = "47e144f5-005c-45bc-b6dc-62dbc59cdac6"


def le_env(caminho):
    valores = {}
    with open(caminho, encoding="utf-8") as f:
        for linha in f:
            if "=" in linha:
                k, v = linha.strip().split("=", 1)
                valores[k] = v
    return valores


env = le_env(sys.argv[1])
sonda, chave = env["SWITCH_SONDA_ID"], env["SWITCH_SONDA_KEY"]


def op(nome, args):
    req = urllib.request.Request(f"{BASE}/agents/{sonda}/ops/{nome}", data=json.dumps(args).encode(), method="POST")
    req.add_header("Authorization", "Bearer " + chave)
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            corpo = json.loads(r.read() or b"null")
            return r.status, corpo.get("result", corpo) if isinstance(corpo, dict) else corpo
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode(errors="replace")[:200]
    except urllib.error.URLError as e:
        return 0, str(e.reason)[:200]


agora = time.strftime("%Y-%m-%d %H:%M:%S")
status, agentes = op("list_agents", {})
if status != 200:
    print(agora, "servidor indisponivel:", status, agentes)
    sys.exit(0)
if isinstance(agentes, dict):
    agentes = agentes.get("agents", [])
alvo = next((a for a in agentes if a.get("name") == AGENTE), None)
if alvo is None:
    print(agora, "agente nao encontrado:", AGENTE)
    sys.exit(1)
status, detalhe = op("get_agent_detail", {"agent_id": alvo["id"]})
salas = (detalhe or {}).get("rooms", []) if isinstance(detalhe, dict) else []
fora = [s for s in salas if (s.get("room_id") or s.get("id")) != SALA_PERMITIDA_ID]
if not fora:
    print(agora, "ok:", AGENTE, "so em", SALA_PERMITIDA)
    sys.exit(0)
for s in fora:
    sala_id = s.get("room_id") or s.get("id")
    status, r = op("remove_agent_from_room", {"room_id": sala_id, "agent_name": AGENTE})
    nome = s.get("name") or s.get("room_name") or sala_id
    print(agora, "removido" if status == 200 else "FALHOU", AGENTE, "de", nome, status, "" if status == 200 else r)
