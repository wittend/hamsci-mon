// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2025 hamsci-mon contributors
// deno-lint-ignore-file no-explicit-any
/**
 * Simple Deno.serve-based dev server for SPA + dev-only file persistence.
 * - Serves static files from project root and /public
 * - SPA fallback to /index.html
 * - Dev-only JSON API for reading/writing project files in ./projects and object defs in ./obj
 *   (disabled automatically on Deno Deploy)
 */

import {
  basename,
  extname,
  join,
} from 'https://deno.land/std@0.224.0/path/mod.ts';
import { contentType } from 'https://deno.land/std@0.224.0/media_types/mod.ts';

const isDeploy = !!Deno.env.get('DENO_DEPLOYMENT_ID');
const root = new URL("../", import.meta.url);
const PUBLIC_DIR = join(root.pathname, "public");
const PROJECTS_DIR = join(root.pathname, "projects");
const OBJ_DIR = join(root.pathname, "obj");

await ensureDir(PUBLIC_DIR);
await ensureDir(PROJECTS_DIR);
await ensureDir(OBJ_DIR);

async function ensureDir(path: string) {
  try {
    await Deno.mkdir(path, { recursive: true });
  } catch (_) {
    // ignore
  }
}

function json(data: any, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json; charset=utf-8" },
    ...init,
  });
}

function notFound() {
  return new Response("Not found", { status: 404 });
}

function isApiRequest(url: URL) {
  return url.pathname.startsWith("/api/");
}

async function serveStatic(url: URL): Promise<Response> {
  // Normalize and prevent absolute path escape; only serve regular files
  const requested = url.pathname.replace(/^\/+/, "");
  const tryPaths = [
    join(root.pathname, requested),
    join(PUBLIC_DIR, requested),
  ];

  for (const p of tryPaths) {
    try {
      const stat = await Deno.stat(p);
      if (!stat.isFile) continue; // skip directories and non-regular files
      const file = await Deno.open(p, { read: true });
      const type = contentType(extname(p)) ?? "application/octet-stream";
      return new Response(file.readable, { headers: { "content-type": type } });
    } catch (_) {
      // keep trying
    }
  }

  // SPA fallback (also handles "/" and directory paths)
  try {
    const index = await Deno.open(join(root.pathname, "index.html"), {
      read: true,
    });
    return new Response(index.readable, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  } catch (e) {
    return new Response(`index.html missing: ${e}`, { status: 500 });
  }
}

function ensurePrjName(name: string) {
  if (!/^[-\w]+_prj\.json$/.test(name)) {
    throw new Error("Invalid project file name");
  }
  return name;
}

async function handleApi(req: Request, url: URL): Promise<Response> {
  if (url.pathname === "/api/health") {
    return json({ ok: true, deploy: isDeploy });
  }

  // Disable write endpoints on Deploy
  const method = req.method.toUpperCase();
  const writeBlocked = isDeploy && ["POST", "PUT", "DELETE"].includes(method);
  if (writeBlocked) {
    return json({ error: "Writes disabled on Deploy" }, { status: 403 });
  }

  // Projects
  if (url.pathname === "/api/projects" && method === "GET") {
    const list: string[] = [];
    for await (const entry of Deno.readDir(PROJECTS_DIR)) {
      if (entry.isFile && entry.name.endsWith("_prj.json")) {
        list.push(entry.name);
      }
    }
    list.sort();
    return json({ files: list });
  }

  if (url.pathname === "/api/projects" && method === "POST") {
    const body = await req.json();
    const name = ensurePrjName(String(body?.name ?? ""));
    const data = body?.data ?? {};
    const path = join(PROJECTS_DIR, name);
    await Deno.writeTextFile(path, JSON.stringify(data, null, 2));
    return json({ saved: basename(path) });
  }

  if (url.pathname.startsWith("/api/projects/") && method === "GET") {
    const name = ensurePrjName(basename(url.pathname));
    const path = join(PROJECTS_DIR, name);
    const text = await Deno.readTextFile(path);
    return new Response(text, {
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  // Object definitions listing (read-only ok on Deploy)
  if (url.pathname === "/api/objects" && method === "GET") {
    const list: string[] = [];
    for await (const entry of Deno.readDir(OBJ_DIR)) {
      if (entry.isFile && entry.name.endsWith("_obj.json")) {
        list.push(entry.name);
      }
    }
    list.sort();
    return json({ files: list });
  }

  if (url.pathname.startsWith("/api/objects/") && method === "GET") {
    const name = basename(url.pathname);
    if (!name.endsWith("_obj.json")) return notFound();
    const path = join(OBJ_DIR, name);
    const text = await Deno.readTextFile(path);
    return new Response(text, {
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  if (url.pathname === "/api/objects" && method === "POST") {
    const body = await req.json();
    const name: string = String(body?.name ?? "");
    if (!/^[-\w]+_obj\.json$/.test(name)) {
      throw new Error("Invalid object file name");
    }
    const path = join(OBJ_DIR, name);
    await Deno.writeTextFile(path, JSON.stringify(body?.data ?? {}, null, 2));
    return json({ saved: basename(path) });
  }

  return notFound();
}

Deno.serve({ hostname: "127.0.0.1", port: 8000 }, (req) => {
  const url = new URL(req.url);
  if (isApiRequest(url)) {
    return handleApi(req, url).catch((e) => {
      console.error(e);
      return json({ error: String(e?.message ?? e) }, { status: 500 });
    });
  }
  return serveStatic(url);
});
