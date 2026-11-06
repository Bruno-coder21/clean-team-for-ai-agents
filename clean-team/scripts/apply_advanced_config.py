"""Aplica a configuracao avancada a um agente gerenciado, usando a sonda da mesma conta. Nao imprime chaves.

Uso: aplicar_config.py <arquivo .env da conta> <nome do agente alvo> <arquivo json da config>
"""

import json
import os
import sys
import urllib.error
import urllib.request

BASE = "http://127.0.0.1:53945"
env_path, alvo, cfg_path = sys.argv[1], sys.argv[2], sys.argv[3]


def le_env(caminho):
    valores = {}
    with open(caminho, encoding="utf-8") as f:
        for linha in f:
            linha = linha.strip()
            if "=" in linha:
                k, v = linha.split("=", 1)
                valores[k] = v
    return valores


env = le_env(os.path.expanduser(env_path))
agente, chave = env["SWITCH_SONDA_ID"], env["SWITCH_SONDA_KEY"]


def op(nome, args):
    req = urllib.request.Request(
        f"{BASE}/agents/{agente}/ops/{nome}", data=json.dumps(args).encode(), method="POST"
    )
    req.add_header("Authorization", "Bearer " + chave)
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.status, json.loads(r.read() or b"null")
    except urllib.error.HTTPError as e:
        texto = e.read().decode(errors="replace")
        try:
            return e.code, json.loads(texto)
        except ValueError:
            return e.code, texto[:300]


status, r = op("list_agents", {})
lista = r.get("result", r) if isinstance(r, dict) else r
if isinstance(lista, dict):
    lista = lista.get("agents", [])
alvo_id = next((a.get("id") for a in lista if a.get("name") == alvo), None)
print("list_agents:", status, "| alvo:", alvo, "| id encontrado:", bool(alvo_id))
if not alvo_id:
    sys.exit(1)

cfg = json.load(open(cfg_path, encoding="utf-8"))
status, r = op("update_agent_detail", {"agent_id": alvo_id, "advanced_config": cfg})
res = r.get("result", r) if isinstance(r, dict) else r
if status == 200 and isinstance(res, dict):
    m = res.get("managed") or {}
    adv = m.get("advanced_config") or {}
    print("update:", status, "| auto_mode:", m.get("auto_mode"), "| desired_state:", m.get("desired_state"),
          "| tools:", adv.get("tools"), "| negados:", len(adv.get("disallowedTools") or []))
else:
    print("update:", status, json.dumps(res, ensure_ascii=False)[:400])
