# Files in `clean-team/`

| File | What it is |
|---|---|
| `analista.instructions.md` | Instructions of the clean-team analyst, pasted into the Gateway's New managed agent form |
| `assistente.instructions.md` | Instructions of the deal-team assistant |
| `clean-team.room.md`, `deal-team.room.md` | Room instructions, also inside the YAML files |
| `clean-team.room.yaml`, `deal-team.room.yaml` | Room documents pasted into Gateway → Rooms → New room → YAML, signed in as `Admin`. Private in Switch and in Mattermost |
| `tools.txt` | The analyst's allowed local tools: `Read, Grep, Glob` |
| `disallowed-tools.txt` | The analyst's 35 denied tools: shell, file writes, web, subagents, the account's connectors, and every Switch tool that changes rooms, members, roles, templates or agents |
| `muro.py` | Wall guard. Uses the data-free probe to remove the analyst from any room other than `#clean-team`. Comments are in Portuguese |
| `systemd/muro-clean-team.service`, `.timer` | User units that run the guard every minute, starting 1 minute after boot |
| `scripts/setup-vm-users.sh` | Creates the `cleanteam` and `dealteam` Linux users (no `sudo`, no `docker`), their folders, and copies Claude Code and the agent controller |
| `scripts/hidepid.sh` | Mounts `/proc` with `hidepid=2` so users can't see each other's processes or keys; reapplied at every boot |
| `scripts/enroll-machine.sh` | Enrolls a user's machine with the Gateway's one-time enroll command, without showing or storing the code |
| `scripts/paste-claude-login-code.sh` | Hands the Claude sign-in code to the user's `tmux` session, without showing it |
| `scripts/save-registration-key.sh` | Saves a Switch registration key to an env file outside git, mode 600 |
| `scripts/register_probe.py` | Registers the data-free probe agent for a non-admin account |
| `scripts/apply_advanced_config.py` | Applies an agent's advanced config through the probe (`update_agent_detail`), because the Gateway has no field for it |
| `scripts/analista-advanced-config.json` | The analyst's advanced config: allowed and denied tools |
| `scripts/wall_test.py` | Tries to cross the wall with the probe; every call should be refused. Room ids are this deployment's |
| `scripts/set-mattermost-password.sh` | Sets the password of a test chat user (`paris` or `meridian-exec`) without showing it |
