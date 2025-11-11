### Pre‑bundling offline assets into the repo
Great — the assets are modest in size and suitable for committing. Here’s what to include and how to do it cleanly.

What will be committed (approx sizes, unminified ESM):
- `/public/vendor/d3.esm.js` (a few MB unminified; ~200–300 KB gzipped when served with compression)
- `/public/vendor/topojson-client.esm.js` (~20–40 KB)
- `/public/data/land-110m.json` (~300–600 KB)
- `/public/data/countries-110m.json` (~300–600 KB)
Total: typically under ~5–7 MB for the four files — reasonable for source control.

Your project is already wired for offline use. To pre‑bundle:

1) Fetch the files once (while online)
- From project root:
```
deno task offline:fetch
```
This downloads the exact versions to:
- `public/vendor/d3.esm.js`
- `public/vendor/topojson-client.esm.js`
- `public/data/land-110m.json`
- `public/data/countries-110m.json`

2) Verify the app works fully offline
- Restart server: `deno task dev`
- Disconnect from the internet (or block the browser from the network)
- Open `http://127.0.0.1:8000` in an Incognito window
- You should see the sphere + graticule + land + borders, with no console errors

3) Commit the offline assets
- Add the new files to git:
```
git add public/vendor/d3.esm.js \
        public/vendor/topojson-client.esm.js \
        public/data/land-110m.json \
        public/data/countries-110m.json
```
- Commit:
```
git commit -m "chore(offline): vendor d3/topojson + world-atlas data"
```

That’s it — anyone cloning the repo will run `deno task dev` and be 100% offline.


## Plan:
Notes and recommendations
- Licensing: D3 (BSD-3-Clause), topojson-client (ISC), and world-atlas (ISC) are permissive; including unmodified distributions is fine.
- Compression: Your simple dev server doesn’t gzip by default; browsers will still load quickly, but if you ever add compression, the size drops significantly.
- Future updates: If you later want newer map data or libraries, just rerun `deno task offline:fetch` to refresh, then recommit the updated files.
- Optional: If you want me to also commit these files now (in this project), say the word and I’ll proceed, but I’ll need you to first run `deno task offline:fetch` so the files exist locally for the commit.

If you hit any issues during the fetch or commit steps, paste the error and I’ll resolve it quickly.
1. Implement Fit-to-window in app.js.
2. Implement palette resizer drag.
3. Persist theme preference.
4. Verify behavior.
5. Summarize changes and ask for tweaks (palette min/max, fit rotation/margins).
