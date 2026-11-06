# Wall test output

`python3 -I clean-team/scripts/wall_test.py`, run on the VM on 2026-11-05 at 22:08 (UTC-3), with the data-free probe `t6b-sonda` (owner `clean-team`, not a member of either room, "Can manage agents" off). The same script ran again at 22:09 from a Mac terminal over SSH for the demo video, with the same six results.

```
1 deal-team | read_context | 403 | "{\"detail\":\"Agent is not a member of this room\"}"
2 deal-team | connect_to_room | 400 | "{\"detail\":\"Agent is not a member of this room\"}"
3 deal-team | invite_agent_to_room | 403 | "{\"detail\":\"Not authorized to change this room's membership\"}"
4 deal-team | invite_agent_to_room | 403 | "{\"detail\":\"Not authorized to change this room's membership\"}"
5 clean-team | add_users_to_room | 403 | "{\"detail\":\"Not authorized to change this room's membership\"}"
6 clean-team | read_context | 403 | "{\"detail\":\"Agent is not a member of this room\"}"
```

Line 3 tries to invite the probe itself into `#deal-team`, line 4 the analyst, and line 5 tries to add the executive to `#clean-team`.
