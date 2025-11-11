---
# SPDX-License-Identifier: GPL-3.0-or-later
# Copyright (C) 2025 hamsci-mon contributors
---

# Troubleshooting

## Browser tries to download a file instead of showing the page
- Symptom: a download prompt appears; DevTools → Network shows `Content-Type: application/octet-stream`.
- Cause: A server responded with a binary content-type for a navigation request (often due to misrouted localhost or a dev server bug serving directories as files).
- Fix: Use `http://127.0.0.1:8000` (not `localhost`) during development to bypass proxies; ensure you are running `deno task dev`. Our server serves `index.html` for navigations and sets `text/html; charset=utf-8`.

## MIME error: “Expected a JavaScript module but got text/html”
- Symptom: Console shows strict MIME type errors for module scripts.
- Cause: The requested JS path didn’t exist and the SPA fallback served `index.html`.
- Fix: Ensure offline vendor files exist by running `deno task offline:fetch` and that `index.html` includes the correct `<script>` tags for `/vendor/d3.v7.min.js` and `/vendor/topojson-client.min.js`.

## Service worker cache weirdness
- While this app doesn’t register a service worker, previous projects might have.
- Fix: In DevTools → Application → Service Workers, unregister anything under the current origin; Clear site data; hard reload.

## Port already in use
- Symptom: server won’t start, or curl to `127.0.0.1:8000` returns unexpected responses.
- Fix: Find conflicting process and stop it, or run on another port temporarily.

## Deno Deploy shows 403 on writing endpoints
- Expected. The server disables writes on Deploy when `DENO_DEPLOYMENT_ID` is set.

## Still stuck?
Collect the following and open an issue:
- Output of `deno task dev` (startup line)
- `curl -i http://127.0.0.1:8000/` headers
- DevTools → Network → top document → Response headers
- DevTools → Console errors (copy exact lines)
