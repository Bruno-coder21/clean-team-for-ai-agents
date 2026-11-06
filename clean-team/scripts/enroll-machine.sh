#!/usr/bin/env bash
# Registra a maquina de um usuario da VM no Switch com o comando "Copy enroll command" do Gateway.
# O comando traz um codigo de uso unico: ele nao aparece na tela nem fica gravado.
set -u
U="${1:?usuario da VM, por exemplo dealteam}"
printf 'Cole o comando do Gateway e aperte Enter (nada vai aparecer na tela): '
IFS= read -rs CMD
echo
CMD="$(printf '%s' "$CMD" | tr -s '[:space:]' ' ' | sed 's/^ //; s/ $//')"
if ! printf '%s' "$CMD" | grep -Eq '^switch-agent-controller enroll --server http://localhost:53945 --code [A-Za-z0-9_-]+ --name [a-z0-9-]+$'; then
  echo "Esse nao parece o comando de registro. Nada foi feito."
  echo "Ele deve comecar com: switch-agent-controller enroll --server http://localhost:53945 --code"
  exit 1
fi
CODE="$(printf '%s' "$CMD" | sed -E 's/.* --code ([A-Za-z0-9_-]+) .*/\1/')"
NAME="$(printf '%s' "$CMD" | sed -E 's/.* --name ([a-z0-9-]+)$/\1/')"
unset CMD
UID_N="$(id -u "$U")"
if sudo -iu "$U" env XDG_RUNTIME_DIR="/run/user/$UID_N" bash -lc "switch-agent-controller enroll --server http://localhost:53945 --code '$CODE' --name '$NAME' 2>&1 | grep -E '^Enrolled|rror' ; switch-agent-controller install-service --shared-host-bundle \"\$HOME/.local/lib/switch/shared-host.mjs\" 2>&1 | grep -E '^Installed|rror'"; then
  echo "MAQUINA REGISTRADA: $NAME"
else
  echo "O registro falhou."
fi
unset CODE
