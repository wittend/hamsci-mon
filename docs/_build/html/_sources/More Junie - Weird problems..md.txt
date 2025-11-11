
Me:
SOmething is wrong with this project. I try to test it by running `deno task dev` from a terminal window in the project's root.  That seems OK.  then Iitry to open a browser page for http://localhost:8000.  The browser then attempts to download whatever the last thing that I  that I downloaded (from wherever...) using that browser. I have tried Brave, Cromium.  I closed each browser, reopened it, and tried to clear the cache - anything that I could think of. but each time the result is the same.  What is going on?

1. Reproduce issue: start `deno task dev` and load localhost:8000; observe behavior and devtools network logs.
2. Inspect browser origin data: Application → Service Workers; check for controlling SW.
3. Search codebase for SW registration and headers that could force downloads.
4. Provide remediation steps to remove stale SW, verify via alternate port/incognito, and curl headers.
5. Optional server mitigations advice (development-only headers/port strategy).
6. Await user feedback with findings from DevTools or confirm resolution.

### What’s likely happening
Your symptoms strongly suggest you have a stale service worker registered for the origin http://localhost:8000 from an earlier project. A service worker can intercept all network requests for its scope and even trigger downloads or serve arbitrary cached responses. Because service workers are keyed by origin (scheme + host + port), reusing the same port (8000) lets that old worker keep controlling the page in Brave/Chromium — even if you start a different app now.

I reviewed your dev server and app:
- `server/main.ts` serves static files with correct `content-type` headers and falls back to `index.html` for SPA routes. There’s no `Content-Disposition: attachment` header or redirects that would cause the browser to download files.
- `index.html` is normal and loads `/app.js`.
- I searched the repo and found no service worker registration (`navigator.serviceWorker.register`) in this project.
  This all points back to a previously-installed service worker still controlling `localhost:8000` in your browsers.

### How to fix it quickly
Pick one of these, in order of convenience:

1) Hard kill any service workers for localhost:8000
- Open DevTools → Application (or Application > Service Workers) while on http://localhost:8000
- Check for an entry under Service Workers; click “Unregister” (and “Update” then “Unregister” if needed)
- In Application → Storage → Clear site data, check all boxes and click “Clear site data”
- Do a hard reload: Ctrl+Shift+R (Cmd+Shift+R on macOS)

2) Nuke from orbit for just this origin
- Chrome/Brave: go to `chrome://serviceworker-internals/` or `chrome://inspect/#service-workers`
- Find localhost:8000 and unregister it

3) Try a different port temporarily
- Start your server on another port to avoid the old SW scope, e.g. edit your task or run:
  ```
  deno run -A --watch server/main.ts
  ```
  and change `Deno.serve({ port: 8000 }, ...)` to `port: 8080` just to test. If it works on 8080, that confirms the SW theory.

4) Private window / different profile
- Open http://localhost:8000 in a private/incognito window (no existing service workers) or in a fresh browser profile. If it loads normally, it’s further confirmation.

5) Extra verification
- Use curl to see what the server sends:
  ```
  curl -i http://localhost:8000/
  ```
  You should see `Content-Type: text/html; charset=utf-8` for the SPA fallback.

### Optional mitigations in your app/server
If this pops up often during local dev across projects:
- Change dev ports between projects to avoid SW scope collisions.
- Consider sending a one-time `Clear-Site-Data` header on the root (only in development) to flush caches and service workers for localhost. Example header: `Clear-Site-Data: "cache", "cookies", "storage"`.
- Avoid registering service workers in dev builds, or gate SW registration behind `if (import.meta.env.PROD)` or an environment flag.

### Why the “downloads last thing I downloaded” symptom?
A misbehaving service worker can respond to navigations with a blob or a cached response that the browser decides should be downloaded. Since the browser remembers recent download filenames/locations, it can appear as if it’s “re-downloading the last file,” even though what’s really happening is the SW is returning a response that triggers a download.

If you try the steps above and the issue persists, tell me what you see under DevTools → Application → Service Workers for localhost:8000, and we’ll take the next diagnostic step.

#