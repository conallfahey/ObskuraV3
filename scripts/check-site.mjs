import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = fileURLToPath(new URL("../dist/", import.meta.url));
const files = ["index.html", "works.html", "team.html", "socials.html", "case-studies.html"];
const routes = new Map(files.map(file => [file === "index.html" ? "/" : `/${file.slice(0, -5)}`, file]));
let checked = 0;
for (const file of files) {
  const html = await readFile(path.join(root, file), "utf8");
  assert(!/(?:index|works|team|socials)-concept-v5\.html|social-cases-v5\.html/.test(html), `${file}: old preview URL`);
  assert(html.includes('href="https://obskura.us'), `${file}: missing canonical`);
  const menu = html.match(/<div class="mainmenuUzi">([\s\S]*?)<\/div>/)?.[1];
  assert(menu?.includes(">Works</a>"), `${file}: missing Works navigation`);
  assert(!menu.includes("Case studies"), `${file}: unexpected menu item`);
  assert(html.includes('href="https://www.youtube.com/@obskurastudios"'), `${file}: missing YouTube`);
  for (const match of html.matchAll(/\b(?:src|href|poster|data-src)=["']([^"']+)["']/g)) {
    const value = match[1].replaceAll("&amp;", "&");
    if (/^(?:[a-z]+:|\/\/|#)/i.test(value)) continue;
    const clean = decodeURIComponent(value.split(/[?#]/)[0]);
    const relative = clean.startsWith("/") ? clean.slice(1) : clean;
    const asset = routes.get(clean) ?? (relative || "index.html");
    assert((await stat(path.join(root, asset))).isFile(), `${file}: missing ${value}`);
    checked++;
  }
  for (const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\bsrc=|type=["'](?:application\/ld\+json|module)/.test(script[1])) continue;
    new vm.Script(script[2], { filename: file });
  }
}
async function checkFiles(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await checkFiles(file);
    else {
      assert((await stat(file)).size <= 25 * 1024 ** 2, `Asset exceeds 25 MiB: ${file}`);
      assert(!/(?:^|[\/\\])(?:\.env|\.git|node_modules|tmp|Headshots)(?:$|[\/\\])/.test(file), `Private source included: ${file}`);
    }
  }
}
await checkFiles(root);
console.log(`Checked ${files.length} production pages, ${checked} local links/assets, inline JavaScript, navigation, and asset limits.`);
