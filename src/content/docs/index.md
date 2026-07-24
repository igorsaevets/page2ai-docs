---
title: Page2AI
description: Convert any web page to clean Markdown for AI. Browser extension, MCP server, and library. Runs locally, no external API calls. By Igor Saevets.
template: splash
hero:
  tagline: Convert any web page to clean Markdown for AI. Local, deterministic, MIT-licensed.
  actions:
    - text: Install the extension
      link: /page2ai-docs/install/
      icon: right-arrow
    - text: Use the MCP server
      link: /page2ai-docs/mcp/
      icon: external
      variant: secondary
head:
  - tag: script
    attrs:
      type: application/ld+json
    content: |
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "@id": "https://igorsaevets.github.io/page2ai-docs/#website",
            "url": "https://igorsaevets.github.io/page2ai-docs/",
            "name": "Page2AI",
            "description": "Convert any web page to clean Markdown for AI. Chrome extension, MCP server, and npm library.",
            "publisher": { "@id": "https://igorsaevets.github.io/page2ai-docs/about/#person" },
            "inLanguage": "en"
          },
          {
            "@type": "Organization",
            "@id": "https://igorsaevets.github.io/page2ai-docs/#org",
            "name": "Page2AI",
            "url": "https://igorsaevets.github.io/page2ai-docs/",
            "founder": { "@id": "https://igorsaevets.github.io/page2ai-docs/about/#person" },
            "logo": "https://igorsaevets.github.io/page2ai-docs/favicon.svg",
            "sameAs": [
              "https://github.com/igorsaevets/page2ai-extension",
              "https://www.npmjs.com/package/@page2ai/mcp",
              "https://registry.modelcontextprotocol.io/v0/servers?search=page2ai"
            ]
          }
        ]
      }
---

## Three ways to use it

Page2AI is a small product suite for turning live web pages into LLM-ready Markdown, without sending page contents to a third-party service.

| Surface | Best for | Install |
|---|---|---|
| **Chrome extension** (also Firefox MV3) | Humans, one page at a time | Chrome Web Store or unpacked build |
| **MCP server** `@page2ai/mcp` | Agents (Claude Desktop, Cursor, Windsurf, Zed) | `npx -y page2ai-mcp` |
| **Library** `@page2ai/core` | Node and browser code | `npm i @page2ai/core` |

The extension runs the full pipeline against the live DOM, so it handles authenticated pages, dynamic tab widgets, and pages that require user session cookies. The MCP server and library run against static HTML for now; SPA rendering ships in v0.3.

## What it does

- Extracts the main article and strips ads, cookie banners, navigation, and footer noise
- Preserves headings, code blocks with language hints, links, tables, and blockquotes
- Emits YAML frontmatter with page metadata (`title`, `source`, `captured_at`, OpenGraph, Twitter, JSON-LD, `article:published_time`, etc.)
- Deduplicates content across tab widgets on documentation sites (Mintlify, Docusaurus, Starlight, Nextra, Fumadocs)
- Runs entirely in the user's browser or on the user's machine

## Zero data collection

Page2AI does not send page contents anywhere. The extension has `activeTab`, `scripting`, `clipboardWrite`, and `storage` permissions and no `host_permissions`. The MCP server and library make no network calls beyond the URL you ask them to fetch, and they enforce SSRF guards against private IP ranges and non-HTTP schemes.

See [Privacy](/page2ai-docs/privacy/) for details.

## Related

- Source: [github.com/igorsaevets/page2ai-extension](https://github.com/igorsaevets/page2ai-extension)
- Software Heritage archive: `swh:1:snp:05123c51ef9e7c0aeb06f42b1263c07a8d26999a`
- MCP Registry: [io.github.igorsaevets/page2ai-mcp](https://registry.modelcontextprotocol.io/v0/servers?search=page2ai)
- npm: [@page2ai/core](https://www.npmjs.com/package/@page2ai/core) · [@page2ai/mcp](https://www.npmjs.com/package/@page2ai/mcp) · [page2ai-mcp](https://www.npmjs.com/package/page2ai-mcp)

## Author

Page2AI is written and maintained by **[Igor Saevets](/page2ai-docs/about/)** — [LinkedIn](https://www.linkedin.com/in/igorsaevets/) · [GitHub](https://github.com/igorsaevets) · [ORCID 0009-0006-8636-1377](https://orcid.org/0009-0006-8636-1377).
