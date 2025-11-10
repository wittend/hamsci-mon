// hamsci-mon client app
// GPL-3.0-or-later

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { feature } from "https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js";

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const canvas = /** @type {HTMLCanvasElement} */ ($('#globe'));
const overlay = /** @type {SVGSVGElement} */ ($('#overlay'));
const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;

// Projection and path
const projection = d3.geoOrthographic().translate([width/2, height/2]).scale(Math.min(width, height) * 0.45).clipAngle(90);
const geoPath = d3.geoPath(projection, ctx);
const graticule = d3.geoGraticule10();

let worldData = null; // GeoJSON for land, countries
let objects = []; // placed objects on globe
let connectors = []; // {fromId, toId}
let currentProjectName = null;
let dark = false;

// Status elements
const statusLat = $('#status-lat');
const statusLon = $('#status-lon');
const statusLocal = $('#status-local');
const statusUTC = $('#status-utc');
const tooltip = $('#tooltip');

import { fmt2, formatLocalTime, formatUTC } from '/utils/time.js';

function setTheme(isDark) {
  dark = isDark;
  document.body.classList.toggle('theme-light', !isDark);
  draw();
}

$('#theme-toggle').addEventListener('change', (e) => setTheme(e.target.checked));

// Menu items (placeholder dropdowns)
$$('.menubar .menu-item').forEach(mi => mi.addEventListener('click', () => alert(`${mi.dataset.menu} menu (todo)`)));

// Toolbar buttons
$('#btn-new').addEventListener('click', () => newProject());
$('#btn-open').addEventListener('click', () => openProject());
$('#btn-save').addEventListener('click', () => saveProject());
$('#btn-saveas').addEventListener('click', () => saveProject({ saveAs: true }));

async function openProject() {
  // Try server API to list projects
  try {
    const list = await api('/api/projects');
    const choice = prompt('Enter project to open:\n' + list.files.join('\n'));
    if (!choice) return;
    const text = await api(`/api/projects/${encodeURIComponent(choice)}`);
    const data = typeof text === 'string' ? JSON.parse(text) : text;
    loadProjectData(data, choice);
    return;
  } catch (e) {
    console.warn('Server open failed; falling back to file picker.', e);
    // Fallback: file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(String(reader.result));
          loadProjectData(data, file.name);
        } catch (err) {
          alert('Failed to parse project JSON: ' + err);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }
}

function loadProjectData(data, name) {
  currentProjectName = name.endsWith('_prj.json') ? name : null;
  objects = Array.isArray(data.objects) ? data.objects : [];
  connectors = Array.isArray(data.connectors) ? data.connectors : [];
  draw();
}

function newProject() {
  if (!confirm('Close current project and start a new one?')) return;
  currentProjectName = null;
  objects = [];
  connectors = [];
  draw();
}

async function api(url, opts={}) {
  try {
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const ct = res.headers.get('content-type') || '';
    return ct.includes('application/json') ? res.json() : res.text();
  } catch (e) {
    return Promise.reject(e);
  }
}

async function saveProject({ saveAs = false } = {}) {
  const data = { objects, connectors, meta: { savedAt: new Date().toISOString(), app: 'hamsci-mon' } };
  let name = currentProjectName;
  if (saveAs || !name) {
    name = prompt('Enter project filename (e.g., demo_prj.json):', name || 'demo_prj.json');
    if (!name) return;
    if (!name.endsWith('_prj.json')) name = name.replace(/\.json$/, '') + '_prj.json';
  }

  // Try server API first
  try {
    const result = await api('/api/projects', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, data })});
    console.log('Saved', result);
    currentProjectName = name;
    alert(`Saved ${name}`);
    return;
  } catch (e) {
    console.warn('Server save failed (likely on Deploy). Falling back to download.', e);
    // Fallback: client-side download
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }
}

// Load palette
async function loadPalette() {
  let list;
  try {
    const res = await fetch('/palette_objects.json');
    list = await res.json();
  } catch (e) {
    console.warn('No palette_objects.json found at root, using example');
    list = [
      { guid: 'example-1', name: 'Example Node', ordinal: 1, icon: '/javascript.svg', def: '/api/objects/example-1_obj.json' }
    ];
  }

  const el = $('#palette-list');
  el.innerHTML = '';
  for (const item of list.sort((a,b) => a.ordinal - b.ordinal)) {
    const div = document.createElement('div');
    div.className = 'palette-item';
    div.draggable = true;
    div.dataset.guid = item.guid;
    div.innerHTML = `<img class="palette-icon" src="${item.icon || '/javascript.svg'}" alt=""> <span>${item.name}</span>`;
    div.addEventListener('dragstart', (ev) => {
      ev.dataTransfer?.setData('text/plain', JSON.stringify(item));
    });
    el.appendChild(div);
  }
}

// Object placement and hover
overlay.addEventListener('dragover', (e) => { e.preventDefault(); });
overlay.addEventListener('drop', async (e) => {
  e.preventDefault();
  const data = e.dataTransfer?.getData('text/plain');
  if (!data) return;
  const item = JSON.parse(data);
  const pt = pointerOnOverlay(e);
  const ll = projection.invert(pt);
  if (!ll) return;
  const def = await loadObjectDef(item);
  const obj = makeObject(def, ll[1], ll[0]);
  objects.push(obj);
  draw();
});

function pointerOnOverlay(e) {
  const rect = overlay.getBoundingClientRect();
  return [e.clientX - rect.left, e.clientY - rect.top];
}

async function loadObjectDef(paletteItem) {
  // Try API path or relative icon; otherwise return minimal def
  try {
    if (paletteItem.def) {
      const res = await fetch(paletteItem.def);
      return await res.json();
    }
  } catch (_) {}
  return {
    guid: paletteItem.guid,
    name: paletteItem.name,
    type: 'generic',
    owner: 'unknown',
  };
}

function makeObject(def, lat, lon) {
  const id = crypto.randomUUID();
  return {
    id,
    guid: def.guid || def.id || id,
    name: def.name || 'Object',
    owner: def.owner || '',
    type: def.type || '',
    maidenhead: def.maidenhead || '',
    elevation: def.elevation ?? 0,
    lat, lon,
    currentState: def.currentState || 'unknown',
    timeLastSeen: new Date().toISOString(),
    notes: def.notes || '',
  };
}

// Hover tooltip on objects
overlay.addEventListener('mousemove', (e) => {
  const pt = pointerOnOverlay(e);
  const ll = projection.invert(pt);
  if (ll) {
    statusLat.textContent = ll[1].toFixed(3);
    statusLon.textContent = ll[0].toFixed(3);
    statusUTC.textContent = formatUTC(new Date());
  } else {
    statusLat.textContent = '—';
    statusLon.textContent = '—';
    statusUTC.textContent = '—';
  }

  // local clock
  statusLocal.textContent = formatLocalTime(new Date());

  const hit = hitTest(pt);
  if (hit) {
    tooltip.hidden = false;
    tooltip.style.left = `${pt[0] + 12}px`;
    tooltip.style.top = `${pt[1] + 12}px`;
    tooltip.innerHTML = renderTooltip(hit);
  } else {
    tooltip.hidden = true;
  }
});

function renderTooltip(obj) {
  return `<div><strong>${obj.name}</strong></div>
          <div>ID: ${obj.id}</div>
          <div>GUID: ${obj.guid}</div>
          <div>Type: ${obj.type}</div>
          <div>Owner: ${obj.owner}</div>
          <div>Grid: ${obj.maidenhead}</div>
          <div>Lat: ${obj.lat.toFixed(3)} Lon: ${obj.lon.toFixed(3)} Elev: ${obj.elevation}</div>
          <div>State: ${obj.currentState}</div>
          <div>Last seen: ${obj.timeLastSeen}</div>`;
}

function hitTest(pt) {
  // Check proximity to object screen positions
  const r = 8;
  for (const obj of objects) {
    const xy = projection([obj.lon, obj.lat]);
    if (!xy) continue;
    const dx = xy[0] - pt[0];
    const dy = xy[1] - pt[1];
    if (dx*dx + dy*dy <= r*r) return obj;
  }
  return null;
}

function drawGlobeBase() {
  if (!worldData) return;
  ctx.clearRect(0,0,width,height);
  ctx.fillStyle = dark ? '#0b2239' : '#cce5ff'; // ocean
  ctx.beginPath();
  geoPath({ type: 'Sphere' });
  ctx.fill();

  ctx.strokeStyle = dark ? '#2a4a6a' : '#7fb2e6';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  geoPath(graticule);
  ctx.stroke();

  // land
  ctx.fillStyle = dark ? '#2e3b2d' : '#d1dccc';
  ctx.beginPath();
  geoPath(worldData.land);
  ctx.fill();

  // borders
  ctx.strokeStyle = dark ? '#666' : '#888';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  geoPath(worldData.countries);
  ctx.stroke();
}

function drawObjectsAndConnectors() {
  // connectors
  const svg = overlay;
  svg.innerHTML = '';
  const ns = 'http://www.w3.org/2000/svg';

  for (const c of connectors) {
    const from = objects.find(o => o.id === c.fromId);
    const to = objects.find(o => o.id === c.toId);
    if (!from || !to) continue;
    const A = projection([from.lon, from.lat]);
    const B = projection([to.lon, to.lat]);
    if (!(A && B)) continue;

    // simple quadratic bezier via mid control point
    const ctrl = [(A[0]+B[0])/2, (A[1]+B[1])/2 - 20];
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', `M ${A[0]},${A[1]} Q ${ctrl[0]},${ctrl[1]} ${B[0]},${B[1]}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', dark ? '#ddd' : '#333');
    path.setAttribute('stroke-width', '1.5');
    path.setAttribute('marker-end', 'url(#arrow)');
    svg.appendChild(path);
  }

  // Arrowhead marker
  const defs = document.createElementNS(ns, 'defs');
  const marker = document.createElementNS(ns, 'marker');
  marker.setAttribute('id', 'arrow');
  marker.setAttribute('markerWidth', '6');
  marker.setAttribute('markerHeight', '6');
  marker.setAttribute('refX', '5');
  marker.setAttribute('refY', '3');
  marker.setAttribute('orient', 'auto');
  const arrow = document.createElementNS(ns, 'path');
  arrow.setAttribute('d', 'M0,0 L0,6 L6,3 z');
  arrow.setAttribute('fill', dark ? '#ddd' : '#333');
  marker.appendChild(arrow);
  defs.appendChild(marker);
  svg.appendChild(defs);

  // objects
  for (const obj of objects) {
    const xy = projection([obj.lon, obj.lat]);
    if (!xy) continue;
    const g = document.createElementNS(ns, 'g');
    g.setAttribute('transform', `translate(${xy[0]}, ${xy[1]})`);

    const circle = document.createElementNS(ns, 'circle');
    circle.setAttribute('r', '5');
    circle.setAttribute('fill', dark ? '#ffcc00' : '#ff6600');
    circle.setAttribute('stroke', dark ? '#333' : '#fff');
    circle.setAttribute('stroke-width', '1');

    g.appendChild(circle);
    svg.appendChild(g);
  }
}

function draw() {
  drawGlobeBase();
  drawObjectsAndConnectors();
}

// Pan/zoom/rotate with drag and wheel
let lastPos = null;
canvas.addEventListener('mousedown', (e) => { lastPos = [e.clientX, e.clientY]; });
window.addEventListener('mouseup', () => { lastPos = null; });
window.addEventListener('mousemove', (e) => {
  if (!lastPos) return;
  const dx = e.clientX - lastPos[0];
  const dy = e.clientY - lastPos[1];
  lastPos = [e.clientX, e.clientY];
  const r = projection.rotate();
  projection.rotate([r[0] + dx * 0.2, r[1] - dy * 0.2, r[2]]);
  draw();
});
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const scale = projection.scale();
  const next = Math.max(50, Math.min(800, scale * (e.deltaY < 0 ? 1.1 : 0.9)));
  projection.scale(next);
  draw();
}, { passive: false });

async function loadWorld() {
  const landTopo = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json').then(r=>r.json());
  const countriesTopo = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(r=>r.json());
  worldData = {
    land: feature(landTopo, landTopo.objects.land),
    countries: feature(countriesTopo, countriesTopo.objects.countries)
  };
}

function tickClock() {
  statusLocal.textContent = formatLocalTime(new Date());
  requestAnimationFrame(tickClock);
}

(async function init() {
  await loadWorld();
  await loadPalette();
  draw();
  tickClock();
})();
