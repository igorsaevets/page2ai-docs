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

- `src/content/docs/` — the five content pages: `index`, `install`, `mcp`, `comparison`, `privacy`
- `src/assets/logo.svg` — site logo
- `astro.config.mjs` — Starlight config (sidebar, plugins, LLM txt generator)

The `starlight-llms-txt` plugin emits `/llms.txt`, `/llms-full.txt`, and `/llms-small.txt` at build time — LLM-consumable views of the entire docs corpus.

## License

MIT — Copyright (c) 2026 Igor Saevets.
