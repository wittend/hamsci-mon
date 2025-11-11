// Fetch and cache external assets locally for offline use.
// Run: deno run -A tools/fetch_offline.ts
// Or via task (see deno.json): deno task offline:fetch

const baseDir = new URL("../", import.meta.url);
const vendorDir = new URL("public/vendor/", baseDir);
const dataDir = new URL("public/data/", baseDir);

await ensureDir(vendorDir);
await ensureDir(dataDir);

const assets: { url: string; path: URL }[] = [
  // ESM builds for direct module imports
  { url: "https://cdn.jsdelivr.net/npm/d3@7/+esm", path: new URL("d3.esm.js", vendorDir) },
  { url: "https://cdn.jsdelivr.net/npm/topojson-client@3/+esm", path: new URL("topojson-client.esm.js", vendorDir) },
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
