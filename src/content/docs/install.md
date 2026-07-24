---
title: Install
description: Install the Page2AI extension, MCP server, or npm library for your target environment.
---

Pick the surface that matches how you want to use Page2AI.

## Chrome extension (Manifest V3)

The recommended way for humans clipping one page at a time.

**Chrome Web Store.** Search for `Page2AI` or open the direct listing:
[chromewebstore.google.com/detail/dlpaaijcnbbmlfeohlphjpnbbcnomnno](https://chromewebstore.google.com/detail/dlpaaijcnbbmlfeohlphjpnbbcnomnno)

**Unpacked build (for reviewers / local dev).**

```bash
git clone https://github.com/igorsaevets/page2ai-extension
cd page2ai-extension
npm install
npx wxt zip -b chrome
```

Output lands in `.output/page2ai-extension-<version>-chrome.zip`. Load unpacked from `.output/chrome-mv3/` via `chrome://extensions` → Developer mode → Load unpacked.

**Trigger extraction.** Press `Alt+Shift+M` on any page, or click the toolbar icon. Extracted Markdown is copied to your clipboard.

## Firefox extension (Manifest V3)

Build from source:

```bash
npx wxt zip -b firefox
```

Load in `about:debugging` → This Firefox → Load Temporary Add-on → pick `manifest.json` from `.output/firefox-mv3/`. AMO listing is submitted; awaiting review.

## MCP server (agents)

For Claude Desktop, Cursor, Windsurf, Zed, and any other MCP client.

**One-liner install.** Add this to your MCP client config:

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

The unscoped `page2ai-mcp` package is a thin wrapper that reexports `@page2ai/mcp`; both are on npm.

**Verify.** From a shell:

```bash
npx -y page2ai-mcp
```

The server starts on stdio and responds to `initialize` and `tools/list`. Ctrl+C to exit.

Full details: [MCP server page](/page2ai-docs/mcp/).

## npm library (Node or browser code)

For programmatic HTML → Markdown conversion in your own code.

```bash
npm install @page2ai/core
```

```javascript
import { htmlToMarkdown, fetchAndConvert } from '@page2ai/core';

const html = '<article><h1>Hello</h1><p>World</p></article>';
const { markdown, title } = htmlToMarkdown(html, {
  baseUrl: 'https://example.com/hello',
  includeFrontmatter: true,
});

const result = await fetchAndConvert('https://docs.anthropic.com/en/api/messages');
console.log(result.markdown);
```

Both `htmlToMarkdown` (sync) and `fetchAndConvert` (async, with SSRF guard + timeout) are exported.

Node ≥ 18. Zero external API calls; uses [linkedom](https://github.com/WebReflection/linkedom) for parsing.
