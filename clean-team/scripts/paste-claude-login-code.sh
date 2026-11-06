#!/usr/bin/env bash
# Entrega o codigo do login do Claude a sessao tmux do usuario indicado. Nao mostra o codigo na tela.
set -u
U="${1:?usuario}"
printf 'Cole o codigo aqui e aperte Enter (nada vai aparecer na tela): '
IFS= read -rs C
echo
C="${C//[[:space:]]/}"
if [ -z "$C" ]; then
  echo "Nada foi colado. Rode de novo."
  exit 1
fi
sudo -iu "$U" tmux send-keys -t login -l "$C"
sudo -iu "$U" tmux send-keys -t login Enter
unset C
echo "Codigo entregue. Aguardando..."
for _ in 1 2 3 4 5 6 7 8 9 10; do
  sleep 2
  if sudo -iu "$U" bash -lc 'claude auth status 2>/dev/null | grep -q "\"loggedIn\": true"'; then
    echo "LOGIN OK"
    exit 0
  fi
  if sudo -iu "$U" tmux capture-pane -p -J -t login | grep -q 'FIM-DO-LOGIN'; then
    break
  fi
done
echo "O login nao foi aceito."
