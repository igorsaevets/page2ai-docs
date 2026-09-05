---
title: Privacy Policy
description: What Page2AI collects, sends, and stores. Short answer, none. Author, Igor Saevets.
head:
  - tag: script
    attrs:
      type: application/ld+json
    content: |
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": "https://igorsaevets.github.io/page2ai-docs/privacy/",
        "name": "Page2AI privacy policy",
        "url": "https://igorsaevets.github.io/page2ai-docs/privacy/",
        "author": { "@id": "https://igorsaevets.github.io/page2ai-docs/about/#person" },
        "publisher": { "@id": "https://igorsaevets.github.io/page2ai-docs/about/#person" },
        "datePublished": "2026-07-24",
        "inLanguage": "en"
      }
---

**Effective date:** 2026-07-24. **Applies to:** Page2AI Chrome extension (Manifest V3), `@page2ai/core` npm package, `@page2ai/mcp` MCP server, and the unscoped `page2ai-mcp` wrapper. **Author:** Igor Saevets (support@igorsaevets.com, ORCID 0009-0006-8636-1377).

## Summary

Page2AI does not collect, transmit, sell, share, or store any personal data. There is no telemetry, no analytics, no crash reporting, no A/B testing, and no third-party services embedded in any of the products.

Every product in the suite runs entirely on the user's own machine.

## What each surface does with your data

### Chrome extension

- **Runs on the current tab only** when you invoke it (`Alt+Shift+M` or click the toolbar icon). Manifest requests only `activeTab`, `scripting`, `clipboardWrite`, and `storage`. No `host_permissions`, no `<all_urls>`, no `tabs` API access.
- **Reads the DOM** of the active page to extract content.
- **Writes to your clipboard** the resulting Markdown, so you can paste it into your LLM of choice.
- **Stores locally** (via `chrome.storage.session`) the last extraction result per tab, so re-invoking the icon retrieves a cached result. Cleared on tab close or navigation. Never sent anywhere.
- **Makes requests to the site you are already on, and only that site.** Many documentation sites publish a machine-readable copy of a page as Markdown. When you invoke the extension it looks for one: it requests `/llms.txt`, `/docs/llms.txt` and `/llms-full.txt` on the current origin, and if the index names a Markdown file for the page you are reading, it requests that file too. These requests carry your normal cookies for that site, exactly as clicking a link on it would, because they are same-origin requests made from the page itself. The extension holds no `host_permissions`, so the browser will not let it reach any other origin. Nothing about you or the page is sent to the author or to any third party at any point. You can turn this off: set **Official Markdown** to `never` in the popup.
- **Does not** transmit page contents, URLs, or any other data off your machine, and contacts no server belonging to the author or to anyone else.

### `@page2ai/core` npm library

- Runs synchronously in Node.js or in a browser bundle. Consumes an HTML string or a URL you provide.
- `fetchAndConvert(url, opts)` makes a single outbound `fetch()` to the URL you pass in — nowhere else. It enforces the SSRF guards below.
- Emits Markdown, returns it to your code. No storage, no logging.

### `@page2ai/mcp` MCP server

- Runs as a stdio process spawned by your MCP client (Claude Desktop, Cursor, Windsurf, Zed).
- Exposes one tool, `page_to_markdown`. When your agent calls it, the server fetches the URL your agent provided and returns the extracted Markdown to the agent.
- Server-side safety rules:
  - **HTTPS only** — `http:`, `file:`, `data:`, `javascript:` schemes are rejected.
  - **SSRF guard** — blocks loopback, private IPv4 (`10/8`, `172.16/12`, `192.168/16`), link-local (`169.254/16` including cloud metadata endpoints), IPv6 loopback and private ranges. Applied both pre-request and post-redirect on the final URL.
  - **10 MB response cap.**
  - **Timeout** enforced by `AbortController`, default 15 s, hard cap 60 s.
  - **UTF-8 only** on response body.
- Does not log requests, does not persist anything to disk. All state is per-invocation.

## Third parties

None. The products do not embed any third-party SDKs, trackers, analytics, remote configuration services, feature-flag services, or CDNs.

The one exception: `@page2ai/mcp` depends on `@modelcontextprotocol/sdk` from Anthropic. That SDK is used only to speak the MCP protocol over stdio to the client. It makes no network calls in the code path this server exercises.

## Children's privacy

The products are general-purpose developer tools and are not directed at children under 13.

## Changes

Material changes to this policy will be published to this page and to the extension's Chrome Web Store listing with an updated effective date.

## Contact

- Email: support@igorsaevets.com
- GitHub: [github.com/igorsaevets/page2ai-extension/issues](https://github.com/igorsaevets/page2ai-extension/issues)

## Source

This policy applies to the products at these canonical locations:

- Chrome extension ID `dlpaaijcnbbmlfeohlphjpnbbcnomnno`, submitted to the Chrome Web Store on 2026-07-21. The listing is still in review, so there is no public store page yet.
- npm: [@page2ai/core](https://www.npmjs.com/package/@page2ai/core), [@page2ai/mcp](https://www.npmjs.com/package/@page2ai/mcp), [page2ai-mcp](https://www.npmjs.com/package/page2ai-mcp)
- GitHub: [igorsaevets/page2ai-extension](https://github.com/igorsaevets/page2ai-extension), [igorsaevets/page2ai-core](https://github.com/igorsaevets/page2ai-core), [igorsaevets/page2ai-mcp](https://github.com/igorsaevets/page2ai-mcp)
- Software Heritage archive: `swh:1:snp:05123c51ef9e7c0aeb06f42b1263c07a8d26999a`
