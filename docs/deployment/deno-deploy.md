---
# SPDX-License-Identifier: GPL-3.0-or-later
# Copyright (C) 2025 hamsci-mon contributors
---

# Deno Deploy

Deno Deploy is a serverless platform for running Deno apps globally. The built‑in server in `server/main.ts` already detects Deploy via the `DENO_DEPLOYMENT_ID` environment variable and automatically disables write endpoints under `/api/*`.

## Prepare the project
- Ensure your app runs locally: `deno task dev`
- Make sure offline vendor files exist (optional but recommended when you also serve from Deploy):
  ```bash
  deno task offline:fetch
  ```

## Deploy using the dashboard
1. Create a new project at https://dash.deno.com/
2. Choose your GitHub repo and the `main` branch.
3. Build command: none (Deno uses your entry file).
4. Entry file: `server/main.ts`
5. Environment variables: none required.
6. Save and deploy.

## Deploy using deployctl (CLI)
```bash
# Install deployctl if needed
brew install deno # on macOS; deployctl is included via deno install or use curl installer

# From project root
export DENO_DEPLOY_TOKEN=... # from dash.deno.com/account

# Deploy
deployctl deploy --project=hamsci-mon --entry=server/main.ts
```

## Notes and limitations on Deploy
- Writes are disabled by the server code on Deploy. Expect `403` on `POST /api/projects` and similar endpoints.
- Static files under `public/` and the SPA fallback will work normally.
- Prefer vendored `public/vendor/*.js` and `public/data/*.json` to avoid external network fetches at runtime.
