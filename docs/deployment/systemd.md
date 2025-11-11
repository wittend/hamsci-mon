---
# SPDX-License-Identifier: GPL-3.0-or-later
# Copyright (C) 2025 hamsci-mon contributors
---

# systemd service (Linux)

This guide shows how to run the hamsci-mon Deno server as a user service on Linux using systemd.

## Create a user service
Create the unit file at `~/.config/systemd/user/hamsci-mon.service`:

```ini
[Unit]
Description=hamsci-mon Deno server
After=network.target

[Service]
# Adjust path to your project root
WorkingDirectory=%h/Projects/deno-dev/hamsci-mon
ExecStart=/usr/bin/deno run -A server/main.ts
Restart=on-failure
Environment=NO_PROXY=localhost,127.0.0.1,::1
# Bind to loopback only; front with a reverse proxy for public access

[Install]
WantedBy=default.target
```

Reload and enable the service:

```bash
systemctl --user daemon-reload
systemctl --user enable --now hamsci-mon.service
```

Check status and logs:

```bash
systemctl --user status hamsci-mon.service
journalctl --user -u hamsci-mon.service -f
```

## Notes
- The service runs as your user. To expose publicly, use a reverse proxy (see {doc}`reverse-proxy`).
- If `deno` is not at `/usr/bin/deno`, run `which deno` and update `ExecStart` accordingly.
