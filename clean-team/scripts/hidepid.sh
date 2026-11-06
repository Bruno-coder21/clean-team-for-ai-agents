#!/usr/bin/env bash
# Hides each Linux user's processes from the others (hidepid=2), so one side's agent cannot
# read the other side's agent key from the process list. polkitd and systemd-logind keep
# full visibility through the procview group. A oneshot service reapplies it at every boot.
# Undo: sudo systemctl disable --now hidepid.service
#
# These are the commands we ran on 2026-11-05, collected in one file.
set -eu

sudo groupadd -f -r procview
G="$(getent group procview | cut -d: -f3)"
sudo usermod -aG procview polkitd

sudo mkdir -p /etc/systemd/system/systemd-logind.service.d
printf '[Service]\nSupplementaryGroups=procview\n' \
  | sudo tee /etc/systemd/system/systemd-logind.service.d/hidepid.conf >/dev/null

printf '[Unit]\nDescription=Hide processes between users (hidepid)\nAfter=local-fs.target\n\n[Service]\nType=oneshot\nRemainAfterExit=yes\nExecStart=/usr/bin/mount -o remount,hidepid=2,gid=%s /proc\nExecStop=/usr/bin/mount -o remount,hidepid=0 /proc\n\n[Install]\nWantedBy=multi-user.target\n' "$G" \
  | sudo tee /etc/systemd/system/hidepid.service >/dev/null

sudo systemctl daemon-reload
sudo systemctl restart systemd-logind
sudo systemctl restart polkit
sudo systemctl enable --now hidepid.service
grep -E '^proc ' /proc/mounts
