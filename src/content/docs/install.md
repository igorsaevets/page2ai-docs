---
title: Install
description: Install the Page2AI extension, MCP server, or npm library for your target environment. By Igor Saevets.
head:
  - tag: script
    attrs:
      type: application/ld+json
    content: |
      {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": "Install Page2AI — Chrome extension, MCP server, npm library",
        "author": { "@id": "https://igorsaevets.github.io/page2ai-docs/about/#person" },
        "publisher": { "@id": "https://igorsaevets.github.io/page2ai-docs/about/#person" },
        "url": "https://igorsaevets.github.io/page2ai-docs/install/",
        "mainEntityOfPage": "https://igorsaevets.github.io/page2ai-docs/install/",
        "proficiencyLevel": "Beginner"
      }
---

Pick the surface that matches the job:

- **Pasting the page you are reading into a chat** → the [browser extension](#chrome-extension-manifest-v3) (Chrome, [Firefox](#firefox-extension-manifest-v3)).
- **An agent reading public pages** (Claude Code, Cursor, Codex, any MCP client) → the [MCP server](#mcp-server-agents).
- **ChatGPT reading a public page** → the [ChatGPT plugin](#chatgpt-plugin).
- **HTML that you or your agent already loaded** (your own app, a page behind a sign-in, an intranet or tailnet host) → the MCP tool's [`html` argument](/page2ai-docs/mcp/#tool-page_to_markdown), or the [library](#npm-library-node-or-browser-code).
- **An agent that drives a browser** (Chrome DevTools MCP, Playwright MCP) and wants the extension's Markdown of the page in it → the [agent script](#agent-script-browser-automation).

What each one cannot do: [Which Page2AI do I need?](/page2ai-docs/#which-page2ai-do-i-need)

## Chrome extension (Manifest V3)

The recommended way for humans clipping one page at a time.

**Chrome Web Store: live since 2026-07-30.** Install it from the
[store listing](https://chromewebstore.google.com/detail/dlpaaijcnbbmlfeohlphjpnbbcnomnno). To see the
published version yourself, no account needed, ask the endpoint a real browser uses for extension updates:

```bash
curl -s 'https://clients2.google.com/service/update2/crx?prodversion=140.0&acceptformat=crx2,crx3&x=id%3Ddlpaaijcnbbmlfeohlphjpnbbcnomnno%26uc'
```

`status="ok"` plus a version means it is live. `error-unknownApplication` means it is not.

**Install from a release.** Every tagged version ships a zip built by CI on the
[releases page](https://github.com/igorsaevets/page2ai-extension/releases). Unzip it and load it
unpacked via `chrome://extensions` → Developer mode → Load unpacked.

**Build from source (for reviewers / local dev).**

```bash
git clone https://github.com/igorsaevets/page2ai-extension
cd page2ai-extension
npm install
npx wxt zip -b chrome
```

Output lands in `.output/page2ai-extension-<version>-chrome.zip`. Load unpacked from `.output/chrome-mv3/` via `chrome://extensions` → Developer mode → Load unpacked.

**Trigger extraction.** Press `Alt+Shift+M` on any page, or click the toolbar icon, to open the popup, then press Enter or select **Extract Markdown**. When it is done, the Markdown is on your clipboard.

## Firefox extension (Manifest V3)

**Firefox Add-ons (AMO): listed since 2026-07-31.** Install it from the
[AMO listing](https://addons.mozilla.org/firefox/addon/page2ai-webpage-to-markdown/). To see the published version
yourself, no account needed: `curl -s "https://addons.mozilla.org/api/v5/addons/addon/page2ai@igorsaevets.com/"`
and read `current_version.version`.

Build from source:

```bash
npx wxt zip -b firefox
```

Load in `about:debugging` → This Firefox → Load Temporary Add-on → pick `manifest.json` from `.output/firefox-mv3/`.

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
npx -y page2ai-mcp --version
```

It prints the version and exits (`--version` needs 0.6.2 or later). It needs Node.js 20 or later.

Without `--version` the server starts on stdio, prints `[page2ai-mcp] server <version> ready on stdio` to stderr and waits for an MCP client: that is normal, Ctrl+C to exit. The lines about Agent Bridge that follow it are about connecting that server to extension 1.6.0 — ignore them unless you are setting up the Agent Bridge below. To see the server answer a request, run the [`initialize` example](/page2ai-docs/mcp/#verify-locally).

**Agent Bridge (extension 1.6.0).** To let the server read pages through your browser (behind a sign-in, or rendered by JavaScript): open the extension popup, turn on *Agent Bridge*, allow access to websites, and give the server the key the popup shows — full steps and the version table are on the [MCP server page](/page2ai-docs/mcp/#agent-bridge-extension-160). If your store install has no such switch, update the extension first, then set up the bridge; otherwise pass the page's HTML as the tool's `html` argument instead.

Full details: [MCP server page](/page2ai-docs/mcp/).

## ChatGPT (plugin)

Page2AI is in ChatGPT's plugin directory: [Page2AI · Public web page to Markdown](https://chatgpt.com/plugins/plugin_asdk_app_6a94ee278a70819185e417020a0450f6). Page2AI itself needs no account or key.

1. In ChatGPT on the web, desktop or mobile, open **Plugins** in the sidebar and find Page2AI, or open the link above.
2. Select **Install plugin**.
3. In a chat, give ChatGPT a page address and ask for the page as Markdown. ChatGPT uses an installed plugin when it fits the request; to pick it yourself, type `@` and choose Page2AI, or select **+** and enter its name.

Whether you can install a plugin depends on your plan and, in a workspace, on what its administrators allow ([OpenAI Help: Plugins in ChatGPT](https://help.openai.com/en/articles/20001256)).

The plugin reads **public pages only**. It calls the [hosted endpoint](/page2ai-docs/mcp/#hosted-endpoint-no-install), which fetches the URL from its own server, without your cookies, and runs no page scripts: a page behind a sign-in comes back as its login page, and a page that JavaScript builds in the browser comes back nearly empty. For those, copy the page with the [extension](#chrome-extension-manifest-v3) and paste it into the chat. The plugin takes a URL only and waits at most 20 seconds for a page.

## Agent script (browser automation)

For an agent that already drives a browser through Chrome DevTools MCP or Playwright MCP. The script is the extension's own extractor as a plain page script: the agent gets the Markdown the popup would give for the page that browser shows, a page behind a sign-in too when that browser is signed in, without installing the extension. It reads only the page and makes no network request.

Every release since 1.5.0 ships it on the [releases page](https://github.com/igorsaevets/page2ai-extension/releases/latest):

- `page2ai-agent.fn.js` for Chrome DevTools MCP (`evaluate_script` with `sourcePath`);
- `page2ai-agent.js` for Playwright MCP (`--init-script`, then `browser_evaluate`);
- `page2ai-agent.SHA256SUMS`: check both files with `sha256sum -c page2ai-agent.SHA256SUMS`.

The result is one JSON object with the Markdown in `markdown`. Have the browser server write it to a file (`filePath` in Chrome DevTools MCP, `filename` in Playwright MCP), then `jq -r .markdown result.json > page.md`. Steps for both servers: [agent/README.md](https://github.com/igorsaevets/page2ai-extension/blob/v1.5.1/agent/README.md).

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

Node 18.17 or later. Zero external API calls; uses [linkedom](https://github.com/WebReflection/linkedom) for parsing.

---

*Written by [Igor Saevets](/page2ai-docs/about/) — [LinkedIn](https://www.linkedin.com/in/igorsaevets/) · [GitHub](https://github.com/igorsaevets).*
