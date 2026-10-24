---
title: Page2AI
description: Convert any web page to clean Markdown for AI. Browser extension, MCP server, and library. Runs locally, no external API calls. By Igor Saevets.
template: splash
hero:
  tagline: Convert any web page to clean Markdown for AI. Local, deterministic, MIT-licensed.
  image:
    file: ../../assets/docs-hero.png
    alt: Three Page2AI popup captures on live sites — USCIS EB-1 policy manual, Open WebUI docs, and xAI Grok models page — showing real profile, character counts, and quality ratios returned by the extension.
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

## Which Page2AI do I need?

Page2AI is a small product suite for turning live web pages into LLM-ready Markdown, without sending page contents to a third-party service. Pick it by the job:

| Your job | Use | Start |
|---|---|---|
| Paste the page you are reading into ChatGPT, Claude or Gemini | **Browser extension** (Chrome, Firefox) | [Install](/page2ai-docs/install/#chrome-extension-manifest-v3), press `Alt+Shift+M` or click the toolbar icon, then Enter or **Extract Markdown**: the Markdown is on your clipboard |
| Let an agent (Claude Code, Cursor, Codex, any MCP client) read public web pages as Markdown | **MCP server**, on your machine | `npx -y page2ai-mcp` in the client's MCP config ([setup](/page2ai-docs/mcp/)) |
| Have ChatGPT read a public page as Markdown | **ChatGPT plugin** | Plugins → Page2AI → Install plugin ([steps](/page2ai-docs/install/#chatgpt-plugin)) |
| Convert a page that you or your agent already loaded: your own app, a page behind a sign-in, an intranet or tailnet host | **MCP tool with `html`**, or the library | Pass the page's HTML as `html` together with its `url`, or call `htmlToMarkdown` in Node |
| Let an agent that drives a browser (Chrome DevTools MCP, Playwright MCP) get the extension's Markdown of the page that browser shows | **Agent script** from the GitHub release | `page2ai-agent.fn.js` or `page2ai-agent.js` ([steps](/page2ai-docs/install/#agent-script-browser-automation)) |
| Convert HTML in your own code, or save the Markdown to a file | **Library** `@page2ai/core` | `npm i @page2ai/core` ([example](/page2ai-docs/install/#npm-library-node-or-browser-code)) |

**What the server-side paths cannot do.** The MCP server, the ChatGPT plugin and the library's `fetchAndConvert` fetch without cookies and run no page scripts: a page behind a sign-in comes back as its login page, and a page that builds its content with JavaScript in the browser comes back nearly empty. The extension reads the page as your browser shows it. The MCP server also refuses private, loopback and tailnet addresses; for those, fetch the HTML yourself and pass it in.

**Why not the agent's own web reader?** For most fetches, Claude Code's built-in WebFetch runs a separate model call on the page and gives the agent that call's answer, not the page; its documentation calls this ["lossy by design"](https://code.claude.com/docs/en/tools-reference). `page_to_markdown` returns the page itself: headings, tables, code blocks with their language, and each tab of a tabbed code sample as its own section.

**Personal data.** Whatever an MCP tool returns enters the agent's context. If a page carries personal data that must not reach the model, convert it with the library, write the Markdown to a file, and give the agent only the file's path and size.

## What it does

- Extracts the main article and strips ads, cookie banners, navigation, and footer noise
- Preserves headings, code blocks with language hints, links, tables, and blockquotes
- Emits YAML frontmatter with page metadata (`title`, `source`, `captured_at`, OpenGraph, Twitter, JSON-LD, `article:published_time`, etc.)
- Deduplicates content across tab widgets on documentation sites (Mintlify, Docusaurus, Starlight, Nextra, Fumadocs)
- Runs in the user's browser or on the user's machine; the one exception is the hosted endpoint behind the ChatGPT plugin, below

## Zero data collection

Page2AI does not send page contents anywhere. The extension has `activeTab`, `scripting`, `clipboardWrite`, and `storage` permissions and no `host_permissions`. The MCP server and library make no network calls beyond the URL you ask them to fetch, and they enforce SSRF guards against private IP ranges and non-HTTP schemes. The hosted endpoint behind the ChatGPT plugin fetches the URL from its own server: see its [privacy trade-off](/page2ai-docs/mcp/#hosted-endpoint-no-install).

See [Privacy](/page2ai-docs/privacy/) for details.

## Related

- Comparisons: [how Page2AI compares to other converters](/page2ai-docs/comparison/) · [Webpage to Markdown Chrome extension: 6 options compared](/page2ai-docs/webpage-to-markdown-chrome-extension/)
- Source: [github.com/igorsaevets/page2ai-extension](https://github.com/igorsaevets/page2ai-extension)
- Software Heritage archive: `swh:1:snp:05123c51ef9e7c0aeb06f42b1263c07a8d26999a`
- MCP Registry: [io.github.igorsaevets/page2ai-mcp](https://registry.modelcontextprotocol.io/v0/servers?search=page2ai)
- npm: [@page2ai/core](https://www.npmjs.com/package/@page2ai/core) · [@page2ai/mcp](https://www.npmjs.com/package/@page2ai/mcp) · [page2ai-mcp](https://www.npmjs.com/package/page2ai-mcp)

## Author

Page2AI is written and maintained by **[Igor Saevets](/page2ai-docs/about/)** — [LinkedIn](https://www.linkedin.com/in/igorsaevets/) · [GitHub](https://github.com/igorsaevets) · [ORCID 0009-0006-8636-1377](https://orcid.org/0009-0006-8636-1377).
