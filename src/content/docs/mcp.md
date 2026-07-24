---
title: MCP server
description: Page2AI MCP server exposes a single tool page_to_markdown for Claude Desktop, Cursor, Windsurf, Zed, and other MCP clients.
---

`@page2ai/mcp` is an MCP server (Model Context Protocol) that exposes a single tool for turning any web page into clean Markdown. It speaks stdio, ships as an npm package, and requires no external services.

## Install

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

## Tool: `page_to_markdown`

Fetch a URL and convert the resulting HTML to Markdown.

**Input schema.**

```json
{
  "url": "string (required, HTTPS)",
  "includeFrontmatter": "boolean (default: true)",
  "includeImages": "boolean (default: true)",
  "timeoutMs": "number (default: 15000, max: 60000)"
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

- **HTTPS only** — schemes other than `https:` are rejected. `http:`, `file:`, `data:`, and `javascript:` are blocked.
- **SSRF guard** — blocks requests to loopback (`127.0.0.0/8`), private IPv4 ranges (`10/8`, `172.16/12`, `192.168/16`), link-local (`169.254/16`, including AWS/GCP metadata endpoints), and IPv6 loopback / private ranges.
- **Redirect validation** — after following redirects, the final URL is re-validated against the same rules.
- **10 MB size cap** — responses larger than 10 MB are rejected.
- **Timeout** — enforced via `AbortController`; default 15 s, cap 60 s.
- **UTF-8 only** — response body must decode as UTF-8; other encodings are rejected.

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

`npm audit` reports one moderate finding in `@hono/node-server`, a transitive dependency of `@modelcontextprotocol/sdk`. The affected code path is only reached by the SDK's HTTP/OAuth server code; this stdio server never loads it. See the [package README](https://github.com/igorsaevets/page2ai-mcp#known-advisories) for the full analysis.
