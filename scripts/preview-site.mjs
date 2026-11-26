import http from "node:http";
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../dist/", import.meta.url));
const port = Number(process.env.PORT ?? 8788);
const redirects = (await readFile(path.join(root, "_redirects"), "utf8")).trim().split("\n").map(line => line.split(/\s+/));
const mime = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".mp4": "video/mp4", ".webm": "video/webm", ".woff": "font/woff", ".woff2": "font/woff2", ".xml": "application/xml", ".txt": "text/plain" };

http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://localhost");
    const redirect = redirects.find(([from]) => from === url.pathname);
    if (redirect) { response.writeHead(Number(redirect[2]), { Location: redirect[1] + url.search }); response.end(); return; }
    let relative = decodeURIComponent(url.pathname).replace(/^\/+/, "") || "index.html";
    if (!path.extname(relative)) relative = relative.replace(/\/$/, "") + ".html";
    let file = path.resolve(root, relative);
    if (path.relative(root, file).startsWith("..") || path.isAbsolute(path.relative(root, file))) { response.writeHead(403); response.end(); return; }
    let info;
    try { info = await stat(file); if (!info.isFile()) throw new Error(); }
    catch { file = path.join(root, "404.html"); info = await stat(file); response.statusCode = 404; }
    response.setHeader("Content-Type", mime[path.extname(file)] ?? "application/octet-stream");
    response.setHeader("Accept-Ranges", "bytes");
    const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    let start = 0, end = info.size - 1;
    if (range) {
      start = Number(range[1]); end = range[2] ? Math.min(Number(range[2]), end) : end;
      if (start > end) { response.writeHead(416, { "Content-Range": `bytes */${info.size}` }); response.end(); return; }
      response.statusCode = 206;
      response.setHeader("Content-Range", `bytes ${start}-${end}/${info.size}`);
    }
    response.setHeader("Content-Length", end - start + 1);
    if (request.method === "HEAD") response.end();
    else createReadStream(file, { start, end }).pipe(response);
  } catch { response.writeHead(500); response.end("Preview error"); }
}).listen(port, "127.0.0.1", () => console.log(`Production preview: http://127.0.0.1:${port}`));
