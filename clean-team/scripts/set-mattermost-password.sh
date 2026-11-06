#!/usr/bin/env bash
# Define a senha de um usuario de teste do Mattermost (paris ou meridian-exec). Nao mostra a senha na tela.
set -u
U="${1:?usuario do Mattermost}"
case "$U" in paris|meridian-exec) ;; *) echo "So vale para paris ou meridian-exec."; exit 1 ;; esac
printf 'Cole a nova senha de %s e aperte Enter (nada vai aparecer na tela): ' "$U"
IFS= read -rs P
echo
if [ -z "$P" ]; then echo "Nada foi colado. Nada mudou."; exit 1; fi
if docker exec switchdash-remote-mattermost-1 mmctl --local user change-password "$U" --password "$P" >/dev/null 2>&1; then
  echo "SENHA TROCADA: $U"
else
  echo "Nao funcionou e nada mudou. Use uma senha com 8 caracteres ou mais."
fi
unset P
