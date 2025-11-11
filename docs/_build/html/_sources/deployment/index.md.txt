---
# SPDX-License-Identifier: GPL-3.0-or-later
# Copyright (C) 2025 hamsci-mon contributors
---

# Deployment Options

This section covers several ways to deploy hamsci-mon.

```{toctree}
:maxdepth: 2

deno-deploy
docker
reverse-proxy
systemd
```

## Overview
- Single binary runtime: Deno
- Static assets under `public/`
- SPA fallback to `index.html`
- Optional local JSON APIs (`/api/*`). On some platforms (e.g., Deno Deploy), write endpoints are disabled automatically by the server when `DENO_DEPLOYMENT_ID` is set.
