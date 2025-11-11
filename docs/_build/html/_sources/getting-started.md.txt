---
# SPDX-License-Identifier: GPL-3.0-or-later
# Copyright (C) 2025 hamsci-mon contributors
---

# Getting Started

This guide helps you run hamsci-mon locally for development and try the app.

## Prerequisites
- Deno (latest stable): https://deno.land/
- Optional: Python 3.10+ (for local docs build)

## Run the dev server
```bash
deno task dev
```
Open the app in a browser:
```
http://127.0.0.1:8000
```

Tip: Prefer `127.0.0.1` during development to avoid system proxy/DNS issues with `localhost`.

## Offline setup
Run once while online to fetch vendor libraries and map data for offline use:
```bash
deno task offline:fetch
```
Files are saved to:
- `public/vendor/d3.v7.min.js`
- `public/vendor/topojson-client.min.js`
- `public/data/land-110m.json`
- `public/data/countries-110m.json`

After this step, the app works fully offline.

## Keyboard and mouse basics
- Left-click drag on the globe: rotate
- Scroll wheel/trackpad: zoom in/out
- Fit button in toolbar: reset rotation and scale to fit
- Dark Mode checkbox: toggles theme (remembered across sessions)

## Project files
For convenience in local development, the dev server exposes JSON endpoints under `/api/*`:
- `GET /api/projects` — list `*_prj.json` files in `./projects`
- `POST /api/projects` — save a project file (payload includes `name` and `data`)
- `GET /api/projects/<name>` — read a project file
- `GET /api/objects` — list `*_obj.json` files in `./obj`
- `GET /api/objects/<name>` — read an object definition

On Deno Deploy, write endpoints are automatically disabled.

## Next steps
- Read the {doc}`user-guide` to learn the UI and object palette
- See {doc}`offline` for the offline data flow
- Explore deployment options under {doc}`deployment/index`
