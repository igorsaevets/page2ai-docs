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
- **Makes no network request since version 1.5.0** (2026-10-17). It reads only the page in your tab, no longer asks the site for an `llms.txt` index or a Markdown copy of the page, which can be older than the page, and copies parts of the page into a separate document in which the browser loads nothing. To capture content shown on demand it scrolls the page and opens tabs and collapsed sections, as you would; the page may then load more of its own content, as when you do it yourself.
- **Up to version 1.4.0 it asked the site you were reading for a Markdown copy of the page** each time you invoked it: `/llms.txt`, `/docs/llms.txt` and `/llms-full.txt` in every profile, with your cookies for that site, and no setting turned these off. With the Docs or Research profile (Auto-detect picked Docs on documentation pages) it also requested the page's address with `.md` and `/index.md` added, whether or not such a file existed, and a `.md` address for the page named by the page or by its `llms.txt`, on that site or on one of ten documentation hosts listed in [PRIVACY.md](https://github.com/igorsaevets/page2ai-extension/blob/main/PRIVACY.md). Requests to one of those hosts carried no cookies but, like any request a page makes, showed it your IP address and, by default, the site you were on. When it copied part of the page to read its text, the browser could also load images, video or audio of that part that the page had not loaded yet.
- **Does not** send page contents or any other data to the author or to any other service. Up to 1.4.0 the only servers it contacted were the ones above.

### `@page2ai/core` npm library

- Runs synchronously in Node.js or in a browser bundle. Consumes an HTML string or a URL you provide.
- `fetchAndConvert(url, opts)` requests the URL you pass in and follows its redirects, nothing else. Up to 0.1.13 it first requested `<url>.md` as well, and its Accept header asked for Markdown. It enforces the SSRF guards below.
- Emits Markdown, returns it to your code. No storage, no logging.

### `@page2ai/mcp` MCP server

- Runs as a stdio process spawned by your MCP client (Claude Desktop, Cursor, Windsurf, Zed).
- Exposes one tool, `page_to_markdown`. When your agent calls it, the server fetches the URL your agent provided, following its redirects, and returns the extracted Markdown to the agent; it requests nothing else. Up to `@page2ai/mcp` 0.2.8 (`@page2ai/core` 0.1.13) it first requested that URL with `.md` added, on the same site.
- Server-side safety rules:
  - **http and https only** — `file:`, `data:`, `javascript:` and every other scheme are rejected.
  - **SSRF guard** — blocks loopback, private IPv4 (`10/8`, `172.16/12`, `192.168/16`), link-local (`169.254/16` including cloud metadata endpoints), IPv6 loopback and private ranges. Applied before the request and on every redirect hop, after DNS resolution.
  - **10 MB response cap.**
  - **Timeout** enforced by `AbortController`, default 15 s, hard cap 60 s.
  - **UTF-8 only** on response body.
- Does not log requests, does not persist anything to disk. All state is per-invocation.

## Third parties

None. The products do not embed any third-party SDKs, trackers, analytics, remote configuration services, feature-flag services, or CDNs.

The one exception: `@page2ai/mcp` depends on `@modelcontextprotocol/server` from Anthropic. That SDK is used only to speak the MCP protocol over stdio to the client. It makes no network calls in the code path this server exercises.

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
