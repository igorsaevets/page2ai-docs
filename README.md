# page2ai-docs

Documentation site for the [Page2AI](https://github.com/igorsaevets/page2ai-extension) product suite (Chrome extension + `@page2ai/core` + `@page2ai/mcp`).

Live: <https://igorsaevets.github.io/page2ai-docs/>

Built with [Starlight](https://starlight.astro.build/) (Astro-based static docs framework). Auto-deployed to GitHub Pages via `.github/workflows/deploy.yml` on every push to `main`.

## Local dev

```bash
npm install
npm run dev
```

Then open <http://localhost:4321/page2ai-docs/>.

## Structure

- `src/content/docs/` — the seven content pages: `index`, `install`, `mcp`, `comparison`, `webpage-to-markdown-chrome-extension`, `about`, `privacy` (plus `404`)
- `src/assets/logo.svg` — site logo
- `astro.config.mjs` — Starlight config (sidebar, plugins, LLM txt generator)

The `starlight-llms-txt` plugin emits `/llms.txt`, `/llms-full.txt`, and `/llms-small.txt` at build time — LLM-consumable views of the entire docs corpus.

## Search engines

Astro writes `sitemap-index.xml` and `sitemap-0.xml` (every page). A robots.txt cannot announce them: crawlers read
robots.txt only at the host root (RFC 9309, section 2.3), and `https://igorsaevets.github.io/robots.txt` is not ours to
serve from this repo. So:

- **Google:** both sitemaps are submitted in Search Console, URL-prefix property
  `https://igorsaevets.github.io/page2ai-docs/` (2026-10-24). `public/google47ba3b993e85bcfc.html` verifies that
  property: keep it.
- **IndexNow** (Bing, Yandex, Seznam, Naver, Yep and the other participants; a submission to one is shared with the
  others): the 32-character `.txt` file in `public/` named after its own content is the key. A key file under
  `/page2ai-docs/` admits only URLs under that path, which is every page here. After a deploy that adds or changes
  pages, POST those URLs to `https://api.indexnow.org/indexnow` with that key and its `keyLocation`
  (https://www.indexnow.org/documentation). Do not delete the file.
- `public/robots.txt` stays only as a note; directives in it have no effect.

## License

MIT — Copyright (c) 2026 Igor Saevets.
