// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2025 hamsci-mon contributors
// Fetch and cache external assets locally for offline use.
// Run: deno run -A tools/fetch_offline.ts
// Or via task (see deno.json): deno task offline:fetch

const baseDir = new URL("../", import.meta.url);
const vendorDir = new URL("public/vendor/", baseDir);
const dataDir = new URL("public/data/", baseDir);

await ensureDir(vendorDir);
await ensureDir(dataDir);

const assets: { url: string; path: URL }[] = [
  // UMD builds for globals (window.d3, window.topojson)
  { url: "https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js", path: new URL("d3.v7.min.js", vendorDir) },
  { url: "https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js", path: new URL("topojson-client.min.js", vendorDir) },
  // Optional: self-contained ESM bundles (not used by app when offline, kept for reference)
  { url: "https://esm.sh/d3@7?bundle", path: new URL("d3.bundle.js", vendorDir) },
  { url: "https://esm.sh/topojson-client@3?bundle", path: new URL("topojson-client.bundle.js", vendorDir) },
  // World atlas data
  { url: "https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json", path: new URL("land-110m.json", dataDir) },
  { url: "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json", path: new URL("countries-110m.json", dataDir) },
];

for (const { url, path } of assets) {
  console.log(`Downloading ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  await Deno.writeFile(path, buf);
  console.log(`Saved ${path.pathname}`);
}

console.log("Offline assets fetched successfully.");

async function ensureDir(url: URL) {
  try {
    await Deno.mkdir(url, { recursive: true });
  } catch (_) {
    // ignore
  }
}
