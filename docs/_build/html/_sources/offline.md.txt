---
# SPDX-License-Identifier: GPL-3.0-or-later
# Copyright (C) 2025 hamsci-mon contributors
---

# Offline Mode

hamsci-mon is designed to run fully offline after a one-time fetch of vendor libraries and map data.

## One-time fetch
Run this task while connected to the internet:

```bash
deno task offline:fetch
```

This downloads and saves:
- `public/vendor/d3.v7.min.js`
- `public/vendor/topojson-client.min.js`
- `public/data/land-110m.json`
- `public/data/countries-110m.json`

The application imports the vendor scripts with `<script>` tags and loads the map data from the local `/data` paths. No network is required afterwards.

## Verifying offline
1. Start the dev server:
   ```bash
   deno task dev
   ```
2. Disconnect from the internet (Wi‑Fi off or airplane mode).
3. Open a new Incognito/Private window to avoid cached CDN.
4. Navigate to:
   ```
   http://127.0.0.1:8000
   ```
5. In DevTools → Network, you should only see local requests (to `/vendor/*.js`, `/data/*.json`, `/app.js`, `/app.css`).

## Notes
- If a vendor or data file is missing, the app may try to fall back to a CDN. Make sure the four files above exist locally.
- If you prefer, you can commit these files to the repo so new clones work offline out of the box.
