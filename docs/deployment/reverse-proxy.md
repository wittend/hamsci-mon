---
# SPDX-License-Identifier: GPL-3.0-or-later
# Copyright (C) 2025 hamsci-mon contributors
---

# Reverse proxy (Nginx/Caddy)

Fronting the app with a reverse proxy lets you enable HTTPS and caching while keeping the Deno server simple.

## Nginx example

```nginx
server {
  listen 80;
  server_name example.com;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl http2;
  server_name example.com;

  ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

  # Static caching (tune to your needs)
  location ~* \.(js|css|svg|png|jpg|woff2)$ {
    add_header Cache-Control "public, max-age=31536000, immutable";
    proxy_pass http://127.0.0.1:8000;
  }

  # API (no caching)
  location ^~ /api/ {
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass http://127.0.0.1:8000;
  }

  # SPA fallback
  location / {
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass http://127.0.0.1:8000;
  }
}
```

## Caddy example

```caddyfile
example.com {
  encode zstd gzip
  reverse_proxy 127.0.0.1:8000
}
```

## Tips
- Keep the Deno server bound to `127.0.0.1:8000` for safety; expose via the proxy.
- Consider adding `Clear-Site-Data` headers during development only if you fight stale caches.
- If you enable compression at the proxy, you don’t need to add it to the Deno server.
