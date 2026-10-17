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

Same code as the local server, rate-limited per IP. Convenient when you cannot run Node.js on the host (mobile clients, browser-only IDEs, hosted playgrounds).

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
| Claude Code | `claude mcp add page2ai -- npx -y page2ai-mcp` |
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

Fetch a URL and convert the resulting HTML to Markdown.

**Input schema.**

```json
{
  "url": "string (required, absolute http or https URL)",
  "include_images": "boolean (default: true)",
  "include_frontmatter": "boolean (default: true)",
  "timeout_ms": "number (default: 15000, range: 1000-60000)"
}
```

**Output.**

```json
{
  "markdown": "string",
  "title": "string",
  "baseUrl": "string (final URL after redirects)",
  "charCount": "number",
  "extractedAt": "ISO 8601 timestamp"
}
```

**Read-only.** The tool declares `readOnlyHint: true` in its MCP manifest — it never writes, and it never modifies system state.

## Safety

The server enforces the following at runtime:

- **http and https only** — every other scheme (`file:`, `data:`, `javascript:`, `ftp:`) is rejected.
- **SSRF guard** — checked on the URL and on every redirect hop, after DNS resolution. Blocks `localhost`, loopback (`127.0.0.0/8`, `::1`), `0.0.0.0/8`, private IPv4 ranges (`10/8`, `172.16/12`, `192.168/16`), link-local (`169.254/16`, including AWS/GCP metadata endpoints, and `fe80::/10`), CGNAT `100.64.0.0/10` (this includes Tailscale addresses), IPv6 unique-local (`fc00::/7`), IPv4-mapped IPv6, the unspecified address `::`, and the hostnames `metadata` and `metadata.google.internal`. A page on your own intranet or tailnet therefore cannot be read through this server: fetch the HTML yourself and convert it with `htmlToMarkdown` from [`@page2ai/core`](https://www.npmjs.com/package/@page2ai/core), which accepts whole documents and fragments.
- **Redirect validation** — redirects are followed by hand (at most 10), and every hop is checked against the same rules before it is requested.
- **10 MB size cap** — responses larger than 10 MB are rejected.
- **Timeout** — enforced via `AbortController`; default 15 s, cap 60 s.
- **UTF-8 decoding** — the body is decoded as UTF-8 whatever charset the server declares, so a page in another encoding (Windows-1251, Shift_JIS) comes out garbled rather than refused.
- **Markdown twin first, up to `@page2ai/core` 0.1.13 (`@page2ai/mcp` 0.2.8)** — the server first asks for `<url>.md` (Mintlify and other docs platforms serve the page as Markdown there) and returns it when it answers with Markdown; a server that answers the request itself with `text/markdown` is returned as-is too. **The next core release drops both:** it requests only the URL you pass and its Accept header asks for HTML, never for Markdown, because a site's Markdown copy can be older than the page ([core PR #34](https://github.com/igorsaevets/page2ai-core/pull/34)). A URL that is itself Markdown stays Markdown. Up to `@page2ai/core` 0.1.12 (`@page2ai/mcp` 0.2.7) these two paths added the frontmatter even with `include_frontmatter: false`; core 0.1.13 and `@page2ai/mcp` 0.2.8 leave it out. The Markdown a site serves can open with its own frontmatter (Mintlify's names `title`, `url` and `description`): that block is part of the page and comes back either way, so with `include_frontmatter: true` the answer holds two YAML blocks, the server's first.

## Verify locally

```bash
npx -y page2ai-mcp
```

The process starts on stdio and waits for JSON-RPC messages. To test it manually:

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{}}}' | npx -y page2ai-mcp
```

Expect a JSON response with server info and capabilities.

## Registry

Registered as `io.github.igorsaevets/page2ai-mcp` in the [official MCP Registry](https://registry.modelcontextprotocol.io/v0/servers?search=page2ai). Downstream aggregators (Smithery, Glama, MCP.so, PulseMCP) pick up from that source automatically.

## Known advisories

None known. Since 0.2.0 the server runs on the v2 SDK packages, and the move dropped the transitive `@hono/node-server` dependency together with its advisory. The [package README](https://github.com/igorsaevets/page2ai-mcp#known-advisories) keeps the current list.

---

*Written by [Igor Saevets](/page2ai-docs/about/) — [LinkedIn](https://www.linkedin.com/in/igorsaevets/) · [GitHub](https://github.com/igorsaevets) · [ORCID 0009-0006-8636-1377](https://orcid.org/0009-0006-8636-1377).*
