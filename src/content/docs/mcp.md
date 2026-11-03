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

The same conversion as the local server, behind a narrower tool: `url` and `query` (no `html`, no pagination), public pages only, at most 20 s per page (its platform stops every request at 30 s), rate-limited per IP. The [Page2AI plugin in ChatGPT](/page2ai-docs/install/#chatgpt-plugin) calls this endpoint. Convenient when you cannot run Node.js on the host (mobile clients, browser-only IDEs, hosted playgrounds).

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

## CLI: `npx page2ai <url>`

Convert any web page to Markdown from the terminal — no MCP client needed.

```bash
npx page2ai https://docs.python.org/3/library/stdtypes.html
```

The `page2ai` npm package depends only on `@page2ai/core` (no MCP overhead). Output goes to stdout with no frontmatter by default, so it pipes cleanly:

```bash
npx page2ai https://example.com > page.md
npx page2ai https://example.com --max-length 5000
npx page2ai --html local.html --base-url https://example.com
curl -s https://example.com | npx page2ai -
```

| Option | Description |
|---|---|
| `--frontmatter` | Include a YAML frontmatter block (off by default) |
| `--no-images` | Strip image references |
| `--timeout <ms>` | Fetch timeout (default: 15000) |
| `--max-length <chars>` | Truncate output |
| `--html <file>` | Convert a local file instead of fetching |
| `--base-url <url>` | Base URL for relative links (with `--html`) |

The same SSRF guard protects the CLI: private ranges, loopback, and cloud metadata endpoints are blocked.

## Tool: `page_to_markdown`

Fetch a URL, or take the HTML you already have, and convert it to Markdown.

**Input schema.**

```json
{
  "url": "string (absolute http or https URL; required unless html is given)",
  "html": "string (optional, up to 10,000,000 characters): the page's HTML, converted instead of fetching",
  "include_images": "boolean (default: true)",
  "include_frontmatter": "boolean (default: true)",
  "timeout_ms": "number (default: 15000, range: 1000-60000)",
  "query": "string (optional, up to 1000 characters): free-text query; only matching sections returned (BM25, no API call)",
  "max_length": "number (default: 30000, range: 100-1000000): characters per part; a longer page comes back in parts",
  "start_index": "number (default: 0): character offset to read from: the next part, or one section"
}
```

Give `url`, `html`, or both. With both, the URL is not fetched: it names the page the HTML came from, relative links resolve against it, and the frontmatter adds `provenance: "HTML supplied by the caller; the source URL was not fetched"`. This is how to convert a page that a browser tool (Playwright, Chrome DevTools MCP) already loaded, including your own app on a private network or a page behind a sign-in. `html` needs `@page2ai/mcp` 0.5.2 or later; the hosted endpoint takes `url` only.

**Output.** A text block with the Markdown: unless `include_frontmatter` is false it opens with YAML frontmatter (title, source URL, capture time, page metadata, extractor version), then the page. A second text block follows only when the server has a note about the result. A failure (a blocked address, a timeout, a page over 10 MB) comes back as a tool error that says why; since 0.7.0 its second line says what to do next. An HTTP 401 or 403 (on 2026-10-30, npm, Stack Overflow, Medium and OpenAI refused the server's requests) points to the page's HTML from a browser tool as `html`, or to the Agent Bridge, and says the same request will be refused again; 404 and 410 say to check the URL, 429 to wait, 5xx to try later, a timeout to raise `timeout_ms`. A page with no readable text and a fetch that landed on a sign-in page come back with a note giving the same steps.

**Query mode (0.9.0 and later).** When the agent passes a `query`, only the page sections whose text matches the query are returned, ranked by [BM25](https://en.wikipedia.org/wiki/Okapi_BM25) relevance and fitted into `max_length`. No external API call — scoring runs locally. This saves agents 50–200K tokens on large documentation pages by returning only the sections that answer the question. When no sections match, the page comes back unfiltered with a note. The `start_index` parameter is ignored when `query` is given: the query is the selection mechanism. Since 0.10.1, `query` is available on the hosted endpoint (returning all matching sections without a length limit).

**Long pages (0.7.0 and later).** A page longer than `max_length` characters (30,000 by default, about 8,000 tokens) comes back in parts. A part ends between blocks, never inside a code block or the frontmatter and never right after a heading. The first part ends with a note naming the `start_index` of the next part and listing the page's sections as `start_index (length): heading`, so an agent can ask for one section by its `start_index` and its length as `max_length`. Later parts come from the text the first part was cut from, kept in the server's memory for 10 minutes after the last part was read: the site gets no new request, the Agent Bridge opens no second tab, and offsets do not move. A page that fits in one part comes back exactly as before. Python's built-in types page (285,604 characters on 2026-10-31) comes back in 10 parts, the first of 29,662 characters with 18 sections listed. The hosted endpoint returns whole pages (no pagination); pass `query` to filter a long page to the relevant sections instead.

**Read-only.** The tool declares `readOnlyHint: true` in its MCP manifest — it never writes, and it never modifies system state.

## Agent Bridge (extension 1.6.0)

The local server fetches without cookies and runs no page scripts, so a page behind a sign-in or one rendered only by JavaScript comes back as its login page or nearly empty. The Agent Bridge lets it ask your own browser instead: the Page2AI extension (1.6.0 or later) opens the page in a background tab, with your cookies and the page's scripts, and returns the extension's Markdown. The call's `include_images` and `include_frontmatter` are honoured on this path too.

Setup: install the extension 1.6.0, open its popup, turn on **Agent Bridge**, allow access to websites, and paste the key it shows (*Copy key*) into this server's `PAGE2AI_BRIDGE_KEY` (Claude Desktop: the *Agent Bridge key* setting), then restart the MCP client. Both sides prove they know the key before any page opens; the key never crosses the local connection (WebSocket on `127.0.0.1`, your own machine only). The extension refuses sign-in providers' pages and non-public addresses, before opening and again on the page a tab lands on; a page it declines is fetched by the server as usual, with a note saying why.

### Multiple MCP clients (0.8.0 / extension 1.7.0)

When `PAGE2AI_BRIDGE_PORT` is not set, the server (0.8.0 or later) tries ports 3025 through 3032 and binds the first free one. A second server picks the next port automatically. The extension (1.7.0 or later) scans the full range and connects to every server it finds — so Claude Desktop on port 3025, Cursor on 3026, and a `claude -p` job on 3027 all share the same browser, each with its own bridge connection. Explicit `PAGE2AI_BRIDGE_PORT` still binds only the port you set.

| Extension | MCP server | What you get |
|---|---|---|
| 1.7.0 or later | 0.8.0 or later | **Multiple servers share the browser.** Each picks a free port in 3025–3032; the extension connects to all of them. |
| 1.6.0 | 0.6.0 or later | Single bridge on port 3025 (1.6.0 connects to 3025 only). With 0.8.0, a second server auto-selects a different port that 1.6.0 cannot reach — upgrade the extension. |
| 1.5.1 (Firefox Add-ons) | any | No bridge — the popup has no Agent Bridge switch. The server fetches public pages itself, or converts `html` you hand it. |
| any | older than 0.6.0 | No bridge — the key protocol arrived in 0.6.0. |

There is no bridge on the hosted endpoint: it can never reach your browser.

## Proxy support (0.4.0)

Since `@page2ai/core` 0.4.0 (`@page2ai/mcp` 0.8.1, 2026-11-02), the local server honours the standard HTTP proxy environment variables:

| Variable | Used when |
|---|---|
| `HTTPS_PROXY` / `https_proxy` | the target URL is `https://` |
| `HTTP_PROXY` / `http_proxy` | the target URL is `http://` |
| `NO_PROXY` / `no_proxy` | lists hostnames or domains that bypass the proxy |

Lowercase takes precedence over uppercase, matching the curl / wget / Node.js convention. When a proxy is set and `NO_PROXY` does not match the target, the request routes through an undici `ProxyAgent`. When `NO_PROXY` matches the target — or no proxy variable is set — the request goes direct with full DNS pinning, the same path as before 0.4.0.

**Passing env vars to the server.** The server inherits environment variables from its parent process. In MCP clients that use the JSON config format, add an `env` object:

```json
{
  "mcpServers": {
    "page2ai": {
      "command": "npx",
      "args": ["-y", "page2ai-mcp"],
      "env": {
        "HTTPS_PROXY": "http://proxy.corp.example:8080",
        "NO_PROXY": "localhost,127.0.0.1,.internal.example"
      }
    }
  }
}
```

Claude Code, Codex CLI and other terminal-based clients inherit the shell's environment, so `export HTTPS_PROXY=...` (or `$env:HTTPS_PROXY = ...` on Windows) before launching the client is enough.

**`NO_PROXY` matching.** A comma-separated list of entries, each matched against the target hostname:

- `example.com` — exact match, bypasses the proxy for that host.
- `.example.com` (or `example.com`) — also matches any subdomain (`sub.example.com`).
- `example.com:8080` — matches only when the target port is 8080.
- `*` — bypasses the proxy for everything (all requests go direct).

**SSRF guard interaction.** DNS pinning is impossible through a proxy: the proxy resolves the target hostname, not the server. The SSRF guard's string-level checks (private hostnames, `metadata.google.internal`) still block before the request is made, and the advisory DNS resolution still runs — a hostname that resolves to a private IP is blocked even through a proxy. The proxy URL itself is trusted infrastructure and is not checked by the SSRF guard. See [Safety](#safety) below.

The hosted endpoint does not read proxy variables — it fetches from its own server.

## Safety

The server enforces the following at runtime:

- **http and https only** — every other scheme (`file:`, `data:`, `javascript:`, `ftp:`) is rejected.
- **SSRF guard** — checked on the URL and on every redirect hop, after DNS resolution. Blocks `localhost`, loopback (`127.0.0.0/8`, `::1`), `0.0.0.0/8`, private IPv4 ranges (`10/8`, `172.16/12`, `192.168/16`), link-local (`169.254/16`, including AWS/GCP metadata endpoints, and `fe80::/10`), CGNAT `100.64.0.0/10` (this includes Tailscale addresses), IPv6 unique-local (`fc00::/7`), IPv4-mapped IPv6, the unspecified address `::`, and the hostnames `metadata` and `metadata.google.internal`. A page on your own intranet or tailnet therefore cannot be fetched by this server: fetch the HTML yourself and pass it to the tool as `html` with the page's `url`, or convert it with `htmlToMarkdown` from [`@page2ai/core`](https://www.npmjs.com/package/@page2ai/core), which accepts whole documents and fragments.
- **Redirect validation** — redirects are followed by hand (at most 10), and every hop is checked against the same rules before it is requested.
- **10 MB size cap** — responses larger than 10 MB are rejected.
- **Timeout** — enforced via `AbortController`; default 15 s, cap 60 s (20 s on the hosted endpoint).
- **UTF-8 decoding** — the body is decoded as UTF-8 whatever charset the server declares, so a page in another encoding (Windows-1251, Shift_JIS) comes out garbled rather than refused.
- **Output safety (since `@page2ai/core` 0.4.2)** — the Markdown output is hardened for LLM consumers that process it without human review:
  - Unsafe link protocols (`javascript:`, `vbscript:`, `data:text/html`) are stripped from hrefs — link text is kept, the URL is dropped.
  - Inline `data:` image URIs larger than 64 KB are dropped (alt text fallback). A real icon is a few KB; anything larger wastes tokens or carries a payload.
  - Elements with inline CSS `display:none` or `visibility:hidden` are excluded, closing the main hidden-text prompt-injection channel.
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
