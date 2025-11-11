---
# SPDX-License-Identifier: GPL-3.0-or-later
# Copyright (C) 2025 hamsci-mon contributors
---

# Docker

This guide shows how to containerize the dev server for simple deployments.

## Example Dockerfile
Create a `Dockerfile` (you can copy this snippet locally without committing if you prefer):

```dockerfile
# syntax=docker/dockerfile:1
FROM denoland/deno:alpine-1.45.5

# Workdir
WORKDIR /app

# Cache deps
COPY deno.json deno.lock ./
# No compile step needed; server uses std imports

# App source
COPY . .

# Expose port
EXPOSE 8000

# Run the Deno server (bind to all interfaces in container)
CMD ["deno", "run", "-A", "server/main.ts"]
```

Build and run:

```bash
docker build -t hamsci-mon .
docker run --rm -p 8000:8000 hamsci-mon
```

Open in your browser:
```
http://localhost:8000
```

## Persisting data (optional)
If you want to keep `projects/` and `obj/` data outside the container:

```bash
docker run --rm -p 8000:8000 \
  -v $(pwd)/projects:/app/projects \
  -v $(pwd)/obj:/app/obj \
  hamsci-mon
```

## Notes
- The server auto-detects Deno Deploy via `DENO_DEPLOYMENT_ID`; in Docker it’s not set, so local write endpoints are enabled by default.
- Consider fronting the container with a reverse proxy for TLS and compression (see {doc}`reverse-proxy`).
