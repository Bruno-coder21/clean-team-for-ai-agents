#!/usr/bin/env bash
# Saves a Switch registration key to an env file outside git, mode 600, without showing it.
# Usage: bash save-registration-key.sh ~/.config/clean-team/.env
set -eu
umask 077
F="${1:?env file, for example ~/.config/clean-team/.env}"
mkdir -p "$(dirname "$F")"
chmod 700 "$(dirname "$F")"
printf 'Paste the key and press Enter (nothing will show on screen): '
IFS= read -rs K
echo
K="${K//[[:space:]]/}"
if [ -z "$K" ]; then
  echo "Nothing pasted. Run it again."
  exit 1
fi
printf 'SWITCH_REG_KEY=%s\n' "$K" > "$F"
chmod 600 "$F"
unset K
echo "Key saved."
