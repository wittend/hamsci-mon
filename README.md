# hamsci-mon

A Deno-based, offline-capable, browser application that renders an interactive globe (D3 + TopoJSON) with a draggable palette for placing objects and drawing connectors. It ships with a minimal development server and optional persistence endpoints for local projects. The UI supports dark/light themes, fits the window responsively, and works fully offline (vendored JS + map data).

SPDX-License-Identifier: GPL-3.0-or-later

## Features
- Interactive orthographic globe with drag/rotate and scroll zoom
- Graticule, land, and country borders (world-atlas data)
- Draggable palette to place objects on the globe; connectors between objects
- Dark/Light theme with persistence
- Responsive canvas/SVG rendering with HiDPI support
- Fully offline (vendored D3/TopoJSON + map JSON)
- Simple local JSON APIs for projects and object definitions (disabled on Deno Deploy)

## Quick start
Requirements: Deno (latest stable). Optional: Python 3 if you want to build the docs locally.

```bash
# Start the dev server
deno task dev
# Open the app
# Prefer 127.0.0.1 to avoid proxy oddities during development
open http://127.0.0.1:8000
```

The server listens on 127.0.0.1:8000 and serves the SPA with a fallback to `index.html`. Basic JSON endpoints live under `/api/*` for local development.

## Offline setup
Run once while online to vendor dependencies and data:

```bash
deno task offline:fetch
```
This saves the following files, which the app will load locally:
- `public/vendor/d3.v7.min.js`
- `public/vendor/topojson-client.min.js`
- `public/data/land-110m.json`
- `public/data/countries-110m.json`

After that, the app works without an internet connection.

## Development tasks
```bash
# Format and lint
deno task fmt
deno task lint

# Run tests (if present)
deno task test
```

## Project structure
```
server/          # Deno.serve dev server and local JSON API
public/          # Static assets (CSS, fonts, vendor libs, data)
index.html       # App shell
app.js           # Main client app (uses window.d3 and window.topojson)
utils/           # Small browser utilities
projects/        # Local project JSON files (created via API)
obj/             # Object definition JSON files
docs/            # Sphinx/Furo documentation (Read the Docs)
```

## Deployment options
High-level summary; see the full docs for detailed steps:

- Deno Deploy
  - The server detects `DENO_DEPLOYMENT_ID` and automatically disables write endpoints.
  - Deploy `server/main.ts` (or a small wrapper) and serve `/public` and the SPA fallback.

- Docker
  - A small container can run the Deno server binding to `0.0.0.0:8000`.
  - Mount volumes for `projects/` and `obj/` if you want persistence.

- Reverse proxy (Nginx/Caddy)
  - Terminate TLS and proxy to `127.0.0.1:8000`.
  - Optionally add gzip/etag caching for static assets.

- Systemd (Linux)
  - Run the server as a user service at boot with `Restart=on-failure`.

Refer to the Read the Docs site (or the `docs/` folder) for step-by-step instructions and configuration snippets.

## Documentation
We provide a Sphinx/Furo documentation site designed for Read the Docs. To build locally:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r docs/requirements.txt
sphinx-build -b html docs docs/_build/html
```
Then open `docs/_build/html/index.html`.

## License
SPDX-License-Identifier: GPL-3.0-or-later

Copyright (C) 2025 hamsci-mon contributors

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Unless otherwise noted, all components in this repository are licensed under GPL-3.0-or-later. Any third‑party assets included under `public/` remain under their respective licenses.
