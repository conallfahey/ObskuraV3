# Obskura v5 on Cloudflare Workers

Production domain: `https://obskura.us`. Worker: `obskura-us`.

The v5 HTML files remain the editable source. The production build promotes them to `/`, `/works`, `/team`, `/socials`, and `/case-studies`, rewrites links, and copies only the assets they use. `obskurastudios.com` and its existing GitHub Pages source remain unchanged.

## Build and verify

Requires Node.js 22.18 or newer.

```sh
npm ci
git lfs pull
npm run build
npm run check
npm run preview
```

The production preview runs at `http://127.0.0.1:8788`. `PORT` overrides the port. The original concept preview on port 8765 is separate.

The build checks missing assets and Workers' 25 MiB per-file limit, fixes asset filename casing for hosting, and generates a sitemap, canonical links, headers, redirects, and a 404 page. `dist/` is generated and ignored by Git.

## Deploy

Sign in with `npx cf auth login` if needed. Credentials stay in Cloudflare's local credential storage; do not commit them.

```sh
# Deploy to workers.dev without attaching domains.
npm run deploy:preview

# Attach obskura.us and www.obskura.us after the Cloudflare zone is active.
npm run deploy
```

The Cloudflare zone is `68bef8ad1c595bc25639db18619cdbdd`. Its assigned nameservers are:

```text
julissa.ns.cloudflare.com
yahir.ns.cloudflare.com
```

The domain was using GoDaddy nameservers at setup. A registrar nameserver change is required to activate Cloudflare DNS. Existing Zoho MX, SPF, DKIM and DMARC records, the `pay` subdomain and `_domainconnect` record have been imported into Cloudflare. Compare any additional records in GoDaddy before switching. Domain registration remains with GoDaddy.

The Vimeo hero and YouTube embeds remain with their existing hosts. Local project and social videos are included as static assets for progressive playback. Videos in Git use Git LFS; pull their contents before building from a fresh checkout. This deployment uses no R2 bucket, Stream subscription, or backend database. The game keeps its current local leaderboard behavior.

## Editing

| Source | Published route |
| --- | --- |
| `index-concept-v5.html` | `/` |
| `works-concept-v5.html` | `/works` |
| `team-concept-v5.html` | `/team` |
| `socials-concept-v5.html` | `/socials` |
| `social-cases-v5.html` | `/case-studies` |

Old concept URLs redirect to their published routes. Gallery and contact links redirect to the relevant homepage sections. Unknown routes return the branded 404 page.

After edits, rebuild, check, deploy, and verify the live routes. Cloudflare deploys assets together as a version; use Workers deployment history to roll back if required.
