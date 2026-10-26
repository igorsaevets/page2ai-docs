---
title: MCP server
description: Page2AI MCP server exposes a single tool page_to_markdown for Claude Desktop, Cursor, Windsurf, Zed, and other MCP clients. By Igor Saevets.
head:
  - tag: script
    attrs:
      type: application/ld+json
    content: |
      {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": "Page2AI MCP server — page_to_markdown tool for Claude Desktop, Cursor, Windsurf, Zed",
        "author": { "@id": "https://igorsaevets.github.io/page2ai-docs/about/#person" },
        "publisher": { "@id": "https://igorsaevets.github.io/page2ai-docs/about/#person" },
        "url": "https://igorsaevets.github.io/page2ai-docs/mcp/",
        "mainEntityOfPage": "https://igorsaevets.github.io/page2ai-docs/mcp/",
        "about": {
          "@type": "SoftwareApplication",
          "name": "@page2ai/mcp",
          "applicationCategory": "DeveloperApplication",
          "operatingSystem": "macOS, Windows, Linux",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
        }
      }
---

`@page2ai/mcp` is an MCP server (Model Context Protocol) that exposes a single tool for turning any web page into clean Markdown. It speaks stdio, ships as an npm package, and requires no external services.

## Hosted endpoint (no install)

For clients that accept a remote MCP server URL (Streamable HTTP):

```
https://page2ai-mcp-remote.vercel.app/api/mcp
```

The same conversion as the local server, behind a narrower tool: `url` only (no `html`), public pages only, at most 20 s per page (its platform stops every request at 30 s), rate-limited per IP. The [Page2AI plugin in ChatGPT](/page2ai-docs/install/#chatgpt-plugin) calls this endpoint. Convenient when you cannot run Node.js on the host (mobile clients, browser-only IDEs, hosted playgrounds).

**Privacy trade-off:** URLs sent to the hosted endpoint are fetched *from that server*, so they transit infrastructure operated by the author (on Vercel). Running locally via `npx` keeps everything on your machine — prefer it when you can.

## Install (local)

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "page2ai": {
      "command": "npx",
      "args": ["-y", "page2ai-mcp"]
    }
  }
}
```

Restart the client. The `page2ai` server should show one tool: `page_to_markdown`.

## Per-client setup

| Client | Method |
|---|---|
| Claude Code | `claude mcp add --scope user page2ai -- npx -y page2ai-mcp` (`--scope user`: every project on this machine; without it, only the current project gets the server) |
| Claude Desktop (one-click) | Download `page2ai-mcp-<version>.mcpb` from [latest release](https://github.com/igorsaevets/page2ai-mcp/releases/latest) → Settings → Extensions → Advanced settings → Install Extension |
| Claude Desktop (JSON) | Add the JSON block above to `claude_desktop_config.json`, restart |
| Cursor | [One-click install deeplink](https://cursor.com/install-mcp?name=page2ai&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsInBhZ2UyYWktbWNwIl19) or add JSON to `~/.cursor/mcp.json` |
| VS Code (GitHub Copilot) | `code --add-mcp '{"name":"page2ai","command":"npx","args":["-y","page2ai-mcp"]}'` |
| Codex CLI | `codex mcp add page2ai -- npx -y page2ai-mcp` |
| Gemini CLI | `gemini mcp add page2ai npx -y page2ai-mcp` |
| Antigravity (`agy`) | `agy mcp add page2ai npx -y page2ai-mcp` |
| Windsurf | Add JSON block to `~/.codeium/windsurf/mcp_config.json` |
| Zed | Add to `context_servers` in `settings.json` |
| Cline (VS Code) | Install via [`llms-install.md`](https://github.com/igorsaevets/page2ai-mcp/blob/main/llms-install.md) — Cline reads it and configures itself |
| LobeHub | [Listing page](https://lobehub.com/mcp/igorsaevets-page2ai-mcp) — one-click enable |

## Tool: `page_to_markdown`

Fetch a URL, or take the HTML you already have, and convert it to Markdown.

**Input schema.**

```json
{
  "url": "string (absolute http or https URL; required unless html is given)",
  "html": "string (optional, up to 10,000,000 characters): the page's HTML, converted instead of fetching",
  "include_images": "boolean (default: true)",
  "include_frontmatter": "boolean (default: true)",
  "timeout_ms": "number (default: 15000, range: 1000-60000)"
}
```

Give `url`, `html`, or both. With both, the URL is not fetched: it names the page the HTML came from, relative links resolve against it, and the frontmatter adds `provenance: "HTML supplied by the caller; the source URL was not fetched"`. This is how to convert a page that a browser tool (Playwright, Chrome DevTools MCP) already loaded, including your own app on a private network or a page behind a sign-in. `html` needs `@page2ai/mcp` 0.5.2 or later; the hosted endpoint takes `url` only.

**Output.** A text block with the Markdown: unless `include_frontmatter` is false it opens with YAML frontmatter (title, source URL, capture time, page metadata, extractor version), then the page. A second text block follows only when the server has a note about the result. A failure (a blocked address, a timeout, a page over 10 MB) comes back as a tool error that says why.

**Read-only.** The tool declares `readOnlyHint: true` in its MCP manifest — it never writes, and it never modifies system state.

## Agent Bridge (extension 1.6.0)

The local server fetches without cookies and runs no page scripts, so a page behind a sign-in or one rendered only by JavaScript comes back as its login page or nearly empty. The Agent Bridge lets it ask your own browser instead: the Page2AI extension (1.6.0 or later) opens the page in a background tab, with your cookies and the page's scripts, and returns the extension's Markdown. The call's `include_images` and `include_frontmatter` are honoured on this path too.

Setup: install the extension 1.6.0, open its popup, turn on **Agent Bridge**, allow access to websites, and paste the key it shows (*Copy key*) into this server's `PAGE2AI_BRIDGE_KEY` (Claude Desktop: the *Agent Bridge key* setting), then restart the MCP client. Both sides prove they know the key before any page opens; the key never crosses the local connection (`ws://127.0.0.1:3025`, your own machine only). The extension refuses sign-in providers' pages and non-public addresses, before opening and again on the page a tab lands on; a page it declines is fetched by the server as usual, with a note saying why.

| Extension | MCP server | What you get |
|---|---|---|
| 1.5.1 (in the stores) | any | No bridge — the popup has no Agent Bridge switch. The server fetches public pages itself, or converts `html` you hand it. |
| 1.6.0 or later | 0.6.0 or later | Bridge available (protocol `page2ai-bridge/2`, paired by key). |
| 1.6.0 or later | older than 0.6.0 | No pairing: the key protocol arrived in 0.6.0, so the server fetches by itself, silently. (The result notes that name the reason arrived in 0.6.2, the extension version in them in 0.6.3 — neither is in this row's server.) |

There is no bridge on the hosted endpoint: it can never reach your browser.

## Safety

The server enforces the following at runtime:

- **http and https only** — every other scheme (`file:`, `data:`, `javascript:`, `ftp:`) is rejected.
- **SSRF guard** — checked on the URL and on every redirect hop, after DNS resolution. Blocks `localhost`, loopback (`127.0.0.0/8`, `::1`), `0.0.0.0/8`, private IPv4 ranges (`10/8`, `172.16/12`, `192.168/16`), link-local (`169.254/16`, including AWS/GCP metadata endpoints, and `fe80::/10`), CGNAT `100.64.0.0/10` (this includes Tailscale addresses), IPv6 unique-local (`fc00::/7`), IPv4-mapped IPv6, the unspecified address `::`, and the hostnames `metadata` and `metadata.google.internal`. A page on your own intranet or tailnet therefore cannot be fetched by this server: fetch the HTML yourself and pass it to the tool as `html` with the page's `url`, or convert it with `htmlToMarkdown` from [`@page2ai/core`](https://www.npmjs.com/package/@page2ai/core), which accepts whole documents and fragments.
- **Redirect validation** — redirects are followed by hand (at most 10), and every hop is checked against the same rules before it is requested.
- **10 MB size cap** — responses larger than 10 MB are rejected.
- **Timeout** — enforced via `AbortController`; default 15 s, cap 60 s (20 s on the hosted endpoint).
- **UTF-8 decoding** — the body is decoded as UTF-8 whatever charset the server declares, so a page in another encoding (Windows-1251, Shift_JIS) comes out garbled rather than refused.
- **Only the page you name, since `@page2ai/core` 0.2.0 (`@page2ai/mcp` 0.3.0, 2026-10-17)** — the server requests only the URL you pass, with the Accept header Firefox sends when it opens a page, because a site's Markdown copy can be older than the page; Markdown that a server still sends for a page address is refused with an error ([core PR #34](https://github.com/igorsaevets/page2ai-core/pull/34), [#35](https://github.com/igorsaevets/page2ai-core/pull/35)). A URL whose path names a Markdown or text file (`.md`, `.txt` and the like) is the page and comes back as is, whether the server sends it as `text/markdown`, `text/plain` or `application/octet-stream`. Such a file can open with its own frontmatter: that block is part of the file and comes back either way, so with `include_frontmatter: true` the answer holds two YAML blocks, the server's first. Up to core 0.1.13 (`@page2ai/mcp` 0.2.8) the server first asked for `<url>.md` (Mintlify and other docs platforms serve the page as Markdown there) and returned it when it answered with Markdown, a server that answered the request itself with `text/markdown` was returned as is too, and a `.md` file served as `text/plain`, as GitHub raw serves it, came out as a single line. Up to core 0.1.12 (`@page2ai/mcp` 0.2.7) those two paths added the frontmatter even with `include_frontmatter: false`.

## Verify locally

```bash
npx -y page2ai-mcp
```

The process starts on stdio and waits for JSON-RPC messages. To test it manually:

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"test","version":"0"}}}' | npx -y page2ai-mcp
```

Expect a JSON response with server info and capabilities.

## Registry

Registered as `io.github.igorsaevets/page2ai-mcp` in the [official MCP Registry](https://registry.modelcontextprotocol.io/v0/servers?search=page2ai). Also listed on [Glama](https://glama.ai/mcp/servers/igorsaevets/page2ai-mcp) and [LobeHub](https://lobehub.com/mcp/igorsaevets-page2ai-mcp).

## Known advisories

None known. Since 0.2.0 the server runs on the v2 SDK packages, and the move dropped the transitive `@hono/node-server` dependency together with its advisory. The [package README](https://github.com/igorsaevets/page2ai-mcp#known-advisories) keeps the current list.

---

*Written by [Igor Saevets](/page2ai-docs/about/) — [LinkedIn](https://www.linkedin.com/in/igorsaevets/) · [GitHub](https://github.com/igorsaevets) · [ORCID 0009-0006-8636-1377](https://orcid.org/0009-0006-8636-1377).*
