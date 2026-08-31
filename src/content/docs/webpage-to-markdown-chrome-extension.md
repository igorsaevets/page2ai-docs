---
title: Webpage to Markdown Chrome extension — 6 options compared (2026)
description: Honest side-by-side of the six Chrome extensions that turn a webpage into Markdown for ChatGPT, Claude, and Gemini — what each is good at, what they miss. By Igor Saevets.
head:
  - tag: script
    attrs:
      type: application/ld+json
    content: |
      {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": "Webpage to Markdown Chrome extension — 6 options compared (2026)",
        "datePublished": "2026-08-31",
        "author": { "@id": "https://igorsaevets.github.io/page2ai-docs/about/#person" },
        "publisher": { "@id": "https://igorsaevets.github.io/page2ai-docs/about/#person" },
        "url": "https://igorsaevets.github.io/page2ai-docs/webpage-to-markdown-chrome-extension/",
        "mainEntityOfPage": "https://igorsaevets.github.io/page2ai-docs/webpage-to-markdown-chrome-extension/",
        "about": [
          { "@type": "Thing", "name": "Chrome extension" },
          { "@type": "Thing", "name": "Markdown converter" },
          { "@type": "Thing", "name": "LLM context preparation" }
        ]
      }
---

If you paste web pages into ChatGPT, Claude, or Gemini a lot, you have probably tried to solve this once already. A Chrome extension that turns the current page into clean Markdown, ready to drop into a prompt, saves an ocean of copy-paste-and-clean-up work.

This is a factual comparison of the six live options in the Chrome Web Store as of August 2026. Every extension here is legitimate — the point is not to pick a winner but to name where each fits, and where each one is worth avoiding.

## Why "webpage to Markdown" and not "webpage to text"

LLMs work with tokens, not bytes. A page you scroll through in a browser is maybe 40 KB of text and 4 MB of ads, scripts, cookie banners, share widgets, and layout markup. Passing the whole HTML costs ten times the tokens for the same content, and the model's attention gets diluted across noise.

Markdown is the middle ground the LLM ecosystem converged on: readable to humans, structured enough for the model, and stripped of the surrounding chrome. Headings survive. Code blocks survive with their language tag. Tables survive. Lists survive. The share-on-Twitter button does not.

## The six options

### 1. Page2AI

- **What it does.** One click on the toolbar, or press Alt+M — clean Markdown for the current page copies to the clipboard.
- **Strong at.** Code blocks with language hints (`\`\`\`python`, `\`\`\`js`, ...) preserved. Tables preserved. Hidden tab panels on docs sites (Anthropic docs, Google devsite, React, Vue, MDN) captured, not lost. Site-specific handling for Reddit, X/Twitter, StackOverflow, GitHub, MDN.
- **Runs.** 100% local — no server, no accounts, no telemetry. MIT-licensed, source on [github.com/igorsaevets/page2ai-extension](https://github.com/igorsaevets/page2ai-extension).
- **Also has.** An optional MCP server ([`@page2ai/mcp`](https://www.npmjs.com/package/@page2ai/mcp)) so an AI agent can call the same extraction over stdio or HTTP. A Firefox build on [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/page2ai-webpage-to-markdown/).
- **Weak at.** Small install base — this is a young extension. If "many other users" is the deciding factor, look below.

### 2. Webpage to Markdown ("single click")

- **What it does.** Tops the CWS results for "webpage to markdown" — a well-marketed extension that promises single-click conversion.
- **Strong at.** Marketing and CWS ranking; established install base.
- **Weak at.** Does not publicly disclose its source. Does not handle hidden tab panels on modern docs sites. No LLM-specific messaging in the listing.
- **Runs.** Local, per its listing description.

### 3. LLMFeeder

- **What it does.** The only competitor whose listing names the LLM use case explicitly (ChatGPT, Claude, Gemini) in the first sentence. Multi-tab batch copy, token counter.
- **Strong at.** LLM positioning, multi-tab flow, exact token counter (useful if you hit context limits).
- **Weak at.** Same "single click" mechanics — no site-specific rules that we could find in the listing, so complex docs pages come out the same as anywhere else.
- **Runs.** Local, per its listing.

### 4. HTML to Markdown

- **What it does.** A minimalist "here is the DOM, here is Markdown" extension. Two homonymous listings on CWS (different developers, same name).
- **Strong at.** Speed and simplicity — no configuration, no popup, no options.
- **Weak at.** Zero LLM-specific optimizations. Tables sometimes rendered as HTML. Naming confusion between the two identical CWS entries.

### 5. MarkDownload

- **What it does.** Was for years the community favourite: rich options, YAML frontmatter, Obsidian-friendly output.
- **Weak at.** [Removed from the Chrome Web Store](https://forum.obsidian.md/t/markdownload-was-removed-from-google-web-store/97655) in 2024. The Firefox version is still live, the Chrome version is gone. Not accepting new users on Chrome by definition.
- **What to do.** If you were using MarkDownload on Chrome and are now stuck, Page2AI, LLMFeeder, and Obsidian Web Clipper are the current replacements worth trying.

### 6. Obsidian Web Clipper

- **What it does.** The Obsidian team's own clipper — targets pushing pages into an Obsidian vault, not the clipboard for LLMs.
- **Strong at.** Vault-native — templates, folder rules, metadata mapping.
- **Weak at.** If your target is a chat window and not a `.md` file in Obsidian, you are using the wrong tool. The clipboard flow is possible but not the design goal.

## Feature matrix

The matrix below is what a first-time user actually cares about. It is derived from testing each extension on the same three pages (an Anthropic docs page with tab panels, a StackOverflow answer, and a MDN page).

| Feature | Page2AI | Webpage to MD | LLMFeeder | HTML to MD | MarkDownload (CWS) | Obsidian Web Clipper |
|---|---|---|---|---|---|---|
| **Chrome installed** | Yes | Yes | Yes | Yes | Removed | Yes |
| **Firefox installed** | Yes | No | No | Some forks | Yes | Yes |
| **License** | MIT | Closed | Closed | Mixed | MIT | MIT |
| **100% local** | Yes | Yes | Yes | Yes | Yes | Yes |
| **Names ChatGPT/Claude/Gemini in listing** | Yes | No | Yes | No | No | No |
| **Code blocks preserve language hint** | Yes | Partial | Partial | Partial | Yes | Yes |
| **Hidden tab panels captured** | Yes | No | No | No | No | Only visible |
| **Site-specific handling (Reddit/X/SO/GitHub/MDN)** | Yes | No | No | No | Partial | No |
| **Keyboard shortcut** | Alt+M | Yes | Yes | No | Yes | Yes |
| **Multi-tab batch export** | No | No | Yes | No | Yes | Partial |
| **Token counter** | No | No | Yes | No | No | No |
| **Optional MCP server for AI agents** | Yes | No | No | No | No | No |
| **Open-source, active** | Yes | Unknown | Yes | Mixed | Firefox-only | Yes |

## Which one to pick when

- **You paste into ChatGPT/Claude/Gemini every day, and hit "the code snippet lost its language" or "the docs page skipped a whole tab" often** — try Page2AI. That is the exact class of bugs it exists to fix.
- **You want multi-tab batch export and a token counter first** — LLMFeeder is the strongest option; its listing describes both features.
- **You just want the simplest "click, get Markdown" experience** — either "Webpage to Markdown" or "HTML to Markdown" on CWS covers it.
- **You are migrating from MarkDownload on Chrome** — the closest replacement for your feature set depends on how you used it. If you used YAML frontmatter → Page2AI supports full OG/JSON-LD frontmatter. If you used Obsidian-specific templates → try the Obsidian Web Clipper. If you used the plain default flow → Page2AI or LLMFeeder.
- **Your target is an Obsidian vault, not a chat window** — Obsidian Web Clipper.
- **You are wiring this into an AI agent (Claude Desktop, Cursor, Windsurf), not a human copy-paste flow** — none of the extensions above solve that. Page2AI ships a companion MCP server (`npm install @page2ai/mcp`) so an agent can call the same extraction directly. See the [MCP server page](/page2ai-docs/mcp/) for setup.

## Install Page2AI

- **Chrome / Edge / Brave / Opera:** [Chrome Web Store](https://chromewebstore.google.com/detail/dlpaaijcnbbmlfeohlphjpnbbcnomnno)
- **Firefox:** [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/page2ai-webpage-to-markdown/)
- **MCP server (agents):** `npm install @page2ai/mcp`, then wire it into Claude Desktop / Cursor. Details: [MCP server](/page2ai-docs/mcp/).

No account, no API key, no telemetry. Source on [GitHub](https://github.com/igorsaevets/page2ai-extension) — MIT-licensed.

## Notes on this comparison

- The listings and behaviour above were checked on 2026-08-31 against the live extension pages. If you spot a claim that has changed, [open an issue](https://github.com/igorsaevets/page2ai-docs/issues) — the docs are open source too.
- "Hidden tab panels captured" was tested on the Anthropic docs page for the Messages API, whose language-picker tabs (Python / TypeScript / cURL / ...) are the same DOM widget across the site. Extensions that render only the visible tab lose 4 of 5 code samples on every page. Page2AI's fix for this is in [issue #11](https://github.com/igorsaevets/page2ai-extension/issues/11).
- The MarkDownload removal date is confirmed by the [Obsidian community thread](https://forum.obsidian.md/t/markdownload-was-removed-from-google-web-store/97655) — the Chrome listing itself is gone, and the Firefox version stays on AMO.
