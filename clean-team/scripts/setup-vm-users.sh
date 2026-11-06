#!/usr/bin/env bash
# One Linux user per side of the wall, with no sudo and no docker, each with its own folder.
# It also copies Claude Code and the agent controller that Switch Console already installed
# for the admin user, because the official controller installer finds no stable release
# (see the README). Run as the admin user of the VM, who has sudo.
#
# These are the commands we ran on 2026-11-05, collected in one file. Not yet run
# end to end as a single script on a fresh machine.
set -eu

for U in cleanteam dealteam; do
  id "$U" >/dev/null 2>&1 || sudo useradd -m -s /bin/bash "$U"
  sudo loginctl enable-linger "$U"   # lets the user's controller service run without a login
  sudo chmod 750 "/home/$U"
done

sudo install -d -o cleanteam -g cleanteam -m 700 /srv/cleanteam /srv/cleanteam/data-room
sudo install -d -o dealteam -g dealteam -m 700 /srv/dealteam /srv/dealteam/released

# Claude Code: the same binary the admin user runs. Each user signs in on their own later.
CLAUDE_BIN="$(readlink -f "$HOME/.local/bin/claude")"
# Agent controller and session host: the copies Switch Console put on this machine.
CONTROLLER="$(ls "$HOME"/.local/state/switch/sdk-host/agent-controller-*.mjs | head -1)"
SHARED_HOST="$(ls "$HOME"/.local/state/switch/sdk-host/shared-host-*.mjs | head -1)"

for U in cleanteam dealteam; do
  sudo install -d -o "$U" -g "$U" -m 755 "/home/$U/.local" "/home/$U/.local/bin" "/home/$U/.local/lib" "/home/$U/.local/lib/switch"
  sudo install -o "$U" -g "$U" -m 755 "$CLAUDE_BIN" "/home/$U/.local/bin/claude"
  sudo install -o "$U" -g "$U" -m 644 "$CONTROLLER" "/home/$U/.local/lib/switch/agent-controller.mjs"
  sudo install -o "$U" -g "$U" -m 644 "$SHARED_HOST" "/home/$U/.local/lib/switch/shared-host.mjs"
  printf '#!/bin/sh\nexec /usr/bin/node "$HOME/.local/lib/switch/agent-controller.mjs" "$@"\n' \
    | sudo tee "/home/$U/.local/bin/switch-agent-controller" >/dev/null
  sudo chown "$U:$U" "/home/$U/.local/bin/switch-agent-controller"
  sudo chmod 755 "/home/$U/.local/bin/switch-agent-controller"
  sudo -u "$U" sh -c 'grep -q SWITCH_CONTROLLER_SHARED_HOST_BUNDLE "$HOME/.profile" 2>/dev/null || printf "\nexport SWITCH_CONTROLLER_SHARED_HOST_BUNDLE=\"\$HOME/.local/lib/switch/shared-host.mjs\"\n" >> "$HOME/.profile"'
done

echo "Done. Next: hidepid.sh, then enroll each machine with enroll-machine.sh."
