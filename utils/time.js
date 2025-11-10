// Time utilities for hamsci-mon
// GPL-3.0-or-later

export function fmt2(n) { return n.toString().padStart(2, '0'); }

export function formatLocalTime(d = new Date()) {
  return `${fmt2(d.getHours())}:${fmt2(d.getMinutes())}:${fmt2(d.getSeconds())}`;
}

export function formatUTC(d = new Date()) {
  return `${fmt2(d.getUTCHours())}:${fmt2(d.getUTCMinutes())}:${fmt2(d.getUTCSeconds())} ${fmt2(d.getUTCDate())}/${fmt2(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
}
