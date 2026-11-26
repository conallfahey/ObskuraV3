import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.resolve(root, "dist");
if (path.relative(root, output) !== "dist") throw new Error("Invalid build output directory");
const pages = [
  ["index-concept-v5.html", "index.html", "/"],
  ["works-concept-v5.html", "works.html", "/works"],
  ["team-concept-v5.html", "team.html", "/team"],
  ["socials-concept-v5.html", "socials.html", "/socials"],
  ["social-cases-v5.html", "case-studies.html", "/case-studies"],
];
const routes = new Map(pages.map(([source, , route]) => [source, route]));
routes.set("gallery.html", "/#archive");
const seen = new Set();
const manifest = [];
const textTypes = new Set([".css", ".js", ".svg", ".html"]);
const missing = new Set();
const directoryCache = new Map();

async function actualPath(relative) {
  let current = root;
  const result = [];
  for (const part of relative.split("/").filter(Boolean)) {
    if (part === "." || part === "..") throw new Error(`Unsafe asset path: ${relative}`);
    let entries = directoryCache.get(current);
    if (!entries) {
      try { entries = await readdir(current); }
      catch { return null; }
      directoryCache.set(current, entries);
    }
    const found = entries.find(entry => entry === part)
      ?? entries.find(entry => entry.toLowerCase() === part.toLowerCase());
    if (!found) return null;
    result.push(found);
    current = path.join(current, found);
  }
  return result.join("/");
}

function assetReferences(text, filename) {
  const refs = new Set();
  // Quoted HTML attributes and JS literals, including filenames containing spaces.
  for (const match of text.matchAll(/(["'`])((?:\/?(?:assets|fonts|img|favicon|js|outputs)\/)[^"'`\r\n]+)\1/g)) {
    refs.add(match[2]);
  }
  // CSS URLs are relative to their own stylesheet.
  for (const match of text.matchAll(/url\(\s*(?:["']([^"']+)["']|([^)]*?))\s*\)/g)) {
    const value = (match[1] ?? match[2]).trim();
    if (!/^(?:data:|https?:|#|\$\{)/.test(value)) {
      refs.add(value.startsWith("/") ? value : path.posix.join(path.posix.dirname(filename), value));
    }
  }
  return refs;
}

function rewriteRoutes(text) {
  for (const [source, route] of routes) text = text.replaceAll(source, route);
  return text;
}

async function normalizeAssets(text, filename) {
  for (const value of assetReferences(text, filename)) {
    if (value.includes("${")) continue;
    const relative = decodeURIComponent(value.split(/[?#]/, 1)[0]).replace(/^\//, "");
    const actual = await actualPath(relative);
    if (!actual || !(await stat(path.join(root, actual))).isFile()) {
      missing.add(`${filename}: ${relative}`);
      continue;
    }
    if (actual !== relative) text = text.replaceAll(relative, actual);
    await include(actual);
  }
  return rewriteRoutes(text);
}

async function include(relative) {
  if (seen.has(relative)) return;
  seen.add(relative);
  const source = path.join(root, relative);
  const target = path.join(output, relative);
  const info = await stat(source);
  if (info.size > 25 * 1024 * 1024) throw new Error(`Asset exceeds Workers' 25 MiB limit: ${relative}`);
  if (info.size < 200 && (await readFile(source, "utf8")).startsWith("version https://git-lfs.github.com/spec/v1")) {
    throw new Error(`Git LFS content is missing for ${relative}. Run git lfs pull before building.`);
  }
  await mkdir(path.dirname(target), { recursive: true });
  if (textTypes.has(path.extname(relative).toLowerCase())) {
    const text = await normalizeAssets(await readFile(source, "utf8"), relative);
    await writeFile(target, text);
  } else await copyFile(source, target);
  manifest.push({ path: relative, bytes: info.size });
}

async function includeTree(folder) {
  for (const entry of await readdir(path.join(root, folder), { withFileTypes: true })) {
    const relative = `${folder}/${entry.name}`;
    if (entry.isDirectory()) await includeTree(relative);
    else await include(relative);
  }
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
// The social carousel constructs media URLs at runtime.
await includeTree("assets/socials");
for (const [source, filename, route] of pages) {
  let html = await normalizeAssets(await readFile(path.join(root, source), "utf8"), source);
  html = html.replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi, "");
  html = html.replace("</head>", `<link rel="canonical" href="https://obskura.us${route}">\n</head>`);
  await writeFile(path.join(output, filename), html);
}

if (missing.size) throw new Error(`Missing production assets:\n${[...missing].join("\n")}`);

const redirects = [...pages.map(([source, , route]) => `/${source} ${route} 301`),
  "/index / 301", "/work /works 301", "/gallery /#archive 301", "/gallery.html /#archive 301",
  "/contact /#getintouch 301", "/contact.html /#getintouch 301", "/about /team 301",
].join("\n") + "\n";
await writeFile(path.join(output, "_redirects"), redirects);
await writeFile(path.join(output, "_headers"), `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
/assets/*
  Cache-Control: public, max-age=86400

/img/*
  Cache-Control: public, max-age=86400

/fonts/*
  Cache-Control: public, max-age=31536000, immutable
`);
await writeFile(path.join(output, "404.html"), `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found — Obskura</title><style>@font-face{font-family:Grotesk;src:url('/fonts/overused-grotesk/OverusedGrotesk-Medium.woff');font-weight:500}body{margin:0;padding:8vw;background:#ece9e1;color:#151613;font:500 24px Grotesk,Arial,sans-serif}h1{font-size:clamp(64px,12vw,180px);letter-spacing:-.077em;margin:12vh 0 30px;line-height:1}a{color:inherit;text-underline-offset:8px}.bar{display:flex;width:180px;height:8px}.bar i{flex:1;background:#3189b5}.bar i:nth-child(2){background:#ed5035}.bar i:nth-child(3){background:#f4ce48}</style><div class="bar"><i></i><i></i><i></i></div><h1>Nothing here.</h1><a href="/">Back to Obskura ↗</a></html>`);
await writeFile(path.join(output, "robots.txt"), "User-agent: *\nAllow: /\nSitemap: https://obskura.us/sitemap.xml\n");
await writeFile(path.join(output, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(([, , route]) => `<url><loc>https://obskura.us${route}</loc></url>`).join("")}</urlset>`);
await mkdir(path.join(root, ".cloudflare"), { recursive: true });
await writeFile(path.join(root, ".cloudflare/site-manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`Built ${pages.length} pages and ${manifest.length} assets (${(manifest.reduce((sum, file) => sum + file.bytes, 0) / 1024 ** 2).toFixed(1)} MiB) for obskura.us.`);
