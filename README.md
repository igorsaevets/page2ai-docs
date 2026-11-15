# page2ai-docs

Documentation site for the [Page2AI](https://github.com/igorsaevets/page2ai-extension) product suite (Chrome extension + `@page2ai/core` + `@page2ai/mcp`).

Live: <https://page2ai.net/>

Built with [Starlight](https://starlight.astro.build/) (Astro-based static docs framework). Auto-deployed to GitHub Pages via `.github/workflows/deploy.yml` on every push to `main`.

## Domain

Since 2026-11-15 the site is served at `https://page2ai.net/`, a GitHub Pages custom domain set in the repository's
Pages settings (with an Actions deployment there is no `CNAME` file; GitHub ignores one). The domain is verified for the
`igorsaevets` account (Settings → Pages → Verified domains), which keeps other accounts from publishing on it. Its DNS
is at Cloudflare, DNS only (grey cloud): four `A` and four `AAAA` records for the apex, `www` as a `CNAME` to
`igorsaevets.github.io`, and the `_github-pages-challenge-igorsaevets` TXT record that keeps the verification; do not
proxy them, and do not add a wildcard record.

The old address `https://igorsaevets.github.io/page2ai-docs/<path>` answers 301 to `https://page2ai.net/<path>`, so
every page keeps its path: links in the store listings, npm, catalogs and articles keep working. Moving a page breaks
its old links.

## Local dev

```bash
npm install
npm run dev
```

Then open <http://localhost:4321/>.

## Structure

- `src/content/docs/` — the seven content pages: `index`, `install`, `mcp`, `comparison`, `webpage-to-markdown-chrome-extension`, `about`, `privacy` (plus `404`)
- `src/assets/logo.svg` — site logo
- `astro.config.mjs` — Starlight config (sidebar, plugins, LLM txt generator)

The `starlight-llms-txt` plugin emits `/llms.txt`, `/llms-full.txt`, and `/llms-small.txt` at build time — LLM-consumable views of the entire docs corpus.

## Search engines

Astro writes `sitemap-index.xml` and `sitemap-0.xml` (every page). Since the move to `page2ai.net` the site sits at the
root of its own host, so `public/robots.txt` is read by crawlers (RFC 9309, section 2.3) and announces
`https://page2ai.net/sitemap-index.xml`. Before that (2026-07-23 to 2026-11-15) it sat under `/page2ai-docs/` and no
crawler read it.

- **Google:** Search Console URL-prefix property `https://page2ai.net/`, sitemap `sitemap-index.xml`.
  `public/google47ba3b993e85bcfc.html` verifies it (and verified the old property
  `https://igorsaevets.github.io/page2ai-docs/`, 2026-10-24): keep it.
- **IndexNow** (Bing, Yandex, Seznam, Naver, Yep and the other participants; a submission to one is shared with the
  others): the 32-character `.txt` file in `public/` named after its own content is the key, now at the host root, so
  it admits every URL on `page2ai.net`. After a deploy that adds or changes pages, POST those URLs to
  `https://api.indexnow.org/indexnow` with that key and its `keyLocation` (https://www.indexnow.org/documentation).
  Do not delete the file.

## License

MIT — Copyright (c) 2026 Igor Saevets.
