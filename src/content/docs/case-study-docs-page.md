---
title: 'Web-to-Markdown benchmark: 17 tools on one docs page'
description: 'Single-page benchmark of 17 web-to-Markdown and browser-fetcher tools for LLMs and AI agents (Page2AI local and hosted, CloakBrowser, Firecrawl, Jina Reader, Tavily, Exa, Nimble, Parallel, crawl4ai, scrapling 0.4 and 0.5, trafilatura, Claude in Chrome, Playwright, Playwright Extension), scored on text, noise, structure and wall-clock latency, grouped by Device vs Cloud hosting. Measured 2026-11-13 and 2026-11-15.'
head:
  - tag: meta
    attrs:
      name: keywords
      content: 'web to markdown, webpage to markdown, html to markdown, url to markdown, markdown converter benchmark, web scraping benchmark, LLM-ready markdown, markdown for LLM, AI agents, MCP server, remote MCP server, local MCP server, hosted MCP, Device vs Cloud, MCP fetch tool, context window, token efficiency, RAG ingestion, Firecrawl alternative, Jina Reader alternative, Firecrawl vs Jina Reader, Tavily extract, Exa web fetch, Nimble extract, Parallel web fetch, crawl4ai, scrapling, scrapling 0.5, trafilatura, Playwright MCP, Playwright Extension, Claude in Chrome, CloakBrowser, stealth browser, browser automation fetcher, accessibility tree, innerText, agent fallback, Claude Code, latency benchmark, wall-clock time'
  - tag: script
    attrs:
      type: application/ld+json
    content: |
      {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": "Web-to-Markdown benchmark: 17 tools on one docs page",
        "description": "Single-page benchmark of 17 web-to-Markdown and browser-fetcher tools for LLMs and AI agents, scored on text, noise, structure and latency against the site's own Markdown, grouped by Device vs Cloud hosting.",
        "keywords": "web to markdown, html to markdown, markdown converter benchmark, web scraping benchmark, LLM-ready markdown, AI agents, MCP fetch tool, remote MCP server, local MCP server, context window, token efficiency, Firecrawl alternative, Jina Reader alternative, Playwright MCP, Claude in Chrome, CloakBrowser, scrapling 0.5, latency benchmark",
        "datePublished": "2026-11-13",
        "dateModified": "2026-11-15",
        "author": { "@type": "Person", "name": "Igor Saevets", "url": "https://igorsaevets.github.io/page2ai-docs/about/" },
        "about": [
          { "@type": "Thing", "name": "HTML to Markdown conversion" },
          { "@type": "Thing", "name": "Web scraping for LLMs and AI agents" },
          { "@type": "Thing", "name": "Browser automation for AI agents" }
        ],
        "mentions": [
          { "@type": "SoftwareApplication", "name": "Page2AI", "url": "https://igorsaevets.github.io/page2ai-docs/" },
          { "@type": "SoftwareApplication", "name": "Firecrawl" },
          { "@type": "SoftwareApplication", "name": "Jina Reader" },
          { "@type": "SoftwareApplication", "name": "Tavily" },
          { "@type": "SoftwareApplication", "name": "Exa" },
          { "@type": "SoftwareApplication", "name": "Nimble" },
          { "@type": "SoftwareApplication", "name": "Parallel" },
          { "@type": "SoftwareApplication", "name": "crawl4ai" },
          { "@type": "SoftwareApplication", "name": "scrapling" },
          { "@type": "SoftwareApplication", "name": "trafilatura" },
          { "@type": "SoftwareApplication", "name": "Playwright MCP" },
          { "@type": "SoftwareApplication", "name": "Claude in Chrome" },
          { "@type": "SoftwareApplication", "name": "CloakBrowser" },
          { "@type": "SoftwareApplication", "name": "Page2AI hosted", "url": "https://page2ai-mcp-remote.vercel.app/api/mcp" }
        ]
      }
  - tag: style
    content: |
      @media (min-width: 72rem) {
        .right-sidebar-container { width: 14rem; }
        [data-has-sidebar][data-has-toc] .main-pane { width: calc(100% - 14rem); }
        .sl-container { max-width: 64rem; }
        .sl-markdown-content :is(th, td) { padding-inline: 0.5rem; }
      }
---

An AI agent or LLM that reads a web page gets whatever its web-to-Markdown tool returns. On 2026-11-13 we sent one page through 12 tools and measured what came back; on 2026-11-15 we added five more. Among them, a newer release in the scrapling line (now scrapling 0.5), three browser-automation tools that an agent reaches for when a converter fails (Claude in Chrome, Playwright MCP, Playwright Extension), and a stealth browser (CloakBrowser). We also added two cross-cutting dimensions on every row: **wall-clock latency** (how long one call takes), and **Device vs Cloud hosting** — does the tool run on the user's own machine (Chrome extension, local MCP server, Python library), or in the cloud behind an HTTP endpoint (Remote MCP, SaaS API). That axis decides which tool an agent can actually reach: an agent on `claude.ai` can only talk to Cloud tools; a Claude Desktop or Claude Code session can talk to both.

**Disclosure:** Page2AI is our project. The page, the calls and the scoring were the same for every tool.

## Key findings

- **Highest-scoring converter:** CloakBrowser, 99. A stealth Chromium build (a patched Chromium that passes Cloudflare Turnstile, reCAPTCHA v3 and 30+ bot detectors) that strips navigation, footer and the "On this page" list more aggressively than any HTML-to-Markdown converter here: 98.8% of the text with 0.2% extra, every heading, code block and table. Device-side only, and heavy: the full flow (launch + navigate + read) took **~18 s** on this page; a per-page follow-up call after the Chromium is live is **~13 s**. Best fit for sites that other converters cannot open at all (Cloudflare, SPAs) — not for a converter on a hot path.
- **Closest competitor:** Page2AI, 97. Delivered 98.9% of the text with 1.9% extra, and every heading, code block and table. Two surfaces at the same score: a Chrome extension + local MCP server (`@page2ai/mcp`), measured at **~0.4 s/page** end-to-end on this laptop; and a hosted Remote MCP at `page2ai-mcp-remote.vercel.app` (public domain `page2ai.com` is parked and will point here), measured at **~0.7 s/page** after session init. The local surface is **40–45× faster** than CloakBrowser; the hosted one is the only Page2AI surface an agent on `claude.ai` can reach.
- **Third score:** scrapling 0.5, 93. The successor to scrapling 0.4.12 (which scored 21) is a different tool: full Markdown structure, text and tables; only the site's left-nav survives into its output.
- **Most noise:** Firecrawl, Tavily, Jina Reader and the scrapling 0.4 / crawl4ai libraries returned six to seven times the page's length. About 80% of it was the site's embedded configuration: context window an LLM pays for and does not need.
- **No conversion at all:** Exa, Parallel and the MCP reference fetch server received the site's own Markdown copy instead of converting the HTML.
- **Browser fetchers aren't converters.** Claude in Chrome, Playwright MCP and the Playwright Extension recover 87% to 99% of the article's words but return plain text or an accessibility tree, not Markdown. On this page every converter works, so their value here is measured, not demonstrated.
- **Hosting decides what an agent can reach.** An agent running on `claude.ai` can only call **Cloud** tools (Remote MCP, SaaS API) — a local MCP server or a Chrome extension is not reachable from a cloud session. Claude Desktop and Claude Code reach both. We mark every row Device or Cloud so the choice is visible before latency or score.

## The page and the answer key

- **The page:** the Claude Code [plugin manifest reference](https://code.claude.com/docs/en/plugins-reference), a long reference page on a Mintlify site with 36 headings, 13 code blocks and 113 table rows. Coding agents read pages like this one.
- **The answer key:** the site publishes a Markdown version of each page (append `.md` to the URL). It is the author's own text, so we scored every output against it. Page2AI does not read it: it converts the page itself. The key was used only for scoring.
- **The calls:** each tool was called the way an agent calls it: the URL, Markdown output where the tool offers a choice, defaults for everything else. Calls went through each tool's MCP server from Claude Code, except where the table says "Python library".

Five numbers per output, a score built from them, and two cross-cutting dimensions that apply to every tool. **↑ means higher is better, ↓ means lower is better.**

- **Hosting:** **Device** if the tool runs on the user's machine (Chrome extension, local MCP server over stdio, Python library); **Cloud** if it runs on a vendor's server behind an HTTP endpoint (Remote MCP, SaaS API). An agent on `claude.ai` can only reach Cloud tools; Claude Desktop and Claude Code reach both.
- **Text ↑:** the share of the key's words that appear in the output.
- **Extra ↓:** the share of the output's words that are not in the key: navigation, page furniture and code that the page carries for its own use (on this site, its embedded configuration). The model reads all of it and needs none of it. Every point of Extra is context window spent for nothing, so the lower, the better.
- **Headings ↑:** the share of the key's headings that appear as Markdown headings.
- **Code ↑:** the share of the key's code blocks found inside code fences.
- **Tables ↑:** the share of the key's table rows found as Markdown table rows.
- **Score ↑:** Text × (100% − Extra) × the average of Headings, Code and Tables. A perfect copy of the key scores 100. A tool scores low if it loses text, adds junk or flattens the structure. The tables below are sorted by it.
- **Time ↓:** wall-clock latency of one call on this page, measured 2026-11-15 from a US residential ISP (fresh fetch, no cache). Direct HTTP and Python/Node library calls are clean wall-clock. Rows marked with ⁸ were measured via Claude Code's MCP shim, which adds about 3 s of fixed wrapping overhead per call: on those rows the tool's own latency is about 3 s less than the number shown.

## Tools that converted the page

| Tool | Hosting | Chars | Text ↑ | Extra ↓ | H ↑ | Code ↑ | Tables ↑ | Score ↑ | Time ↓ |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| **CloakBrowser** ⁷ (MCP, `cloak_read_page`) | Device | 44,052 | 98.8% | 0.2% | 100% | 100% | 100% | **99** | ~18 s ⁸ |
| **Page2AI** 0.10.1, local (MCP) ¹ | Device | 50,114 | 98.9% | 1.9% | 100% | 100% | 100% | **97** | ~0.4 s |
| **Page2AI** 0.10.1, hosted (Remote MCP) ⁶ | Cloud | 48,095 | 98.9% | 2.0% | 100% | 100% | 100% | **97** | ~0.7 s |
| scrapling 0.5 ⁴ (MCP, `make_request`) | Device | 47,131 | 98.9% | 5.5% | 100% | 100% | 100% | **93** | ~6 s ⁸ |
| Nimble (MCP, Markdown) | Cloud | 55,250 | 99.0% | 5.3% | 3% | 100% | 100% | 63 | ~16 s ⁸ |
| scrapling 0.4.12 (MCP, defaults) | Device | 26,551 | 63.6% | 2.5% | 100% | 0% | 0% | 21 | ~4.5 s ⁸ |
| trafilatura 2.2.0 (Python library) ³ | Device | 22,762 | 58.4% | 1.6% | 97% | 0% | 0% | 19 | ~0.9 s |
| Firecrawl (MCP, Markdown) | Cloud | 288,158 | 99.6% | 81.5% | 97% | 100% | 100% | 18 | ~2.7 s |
| scrapling 0.4.12 (Python library) | Device | 277,773 | 99.6% | 81.7% | 100% | 100% | 100% | 18 | ~0.7 s |
| Tavily (MCP, Markdown) | Cloud | 276,871 | 99.6% | 81.9% | 100% | 100% | 100% | 18 | ~5 s ⁸ |
| crawl4ai (MCP, `clean: true`) ² | Device | 20,000 | 43.6% | 0.3% | 44% | 46% | 0% | 13 | ~2.2 s |
| Jina Reader (MCP) | Cloud | 267,415 | 99.6% | 81.7% | 3% | 100% | 100% | 12 | ~1.2 s |
| crawl4ai 0.9.2 (Python library) | Device | 280,890 | 99.6% | 81.7% | 3% | 100% | 100% | 12 | ~2.2 s |
| crawl4ai (MCP, defaults) ² | Device | 20,000 | 30.7% | 4.4% | 3% | 15% | 0% | 2 | ~2.2 s |

Ties are ordered by the unrounded score, then by Time ascending.

¹ The local Page2AI server (`@page2ai/mcp`) runs on the user's machine over stdio: a Claude Desktop or Claude Code session can use it; an agent on `claude.ai` cannot. A long page is returned in parts (first call 30,000 characters plus a list of sections to ask for next); `max_length` raises the limit. The local server (core 0.4.4) and the hosted one (core 0.4.3) returned the same text.

² The crawl4ai MCP server we use caps a result at 20,000 characters unless the caller raises `content_limit`.

³ trafilatura with tables, links and formatting turned on.

⁴ scrapling 0.5 is the next release line after 0.4.12; it ships a different extractor and a different MCP server (`scrapling-05`) that exposes `make_request`, `browser_fetch_once` and `browser_extract` instead of `get`. Measured 2026-11-15.

⁶ The hosted Page2AI server (`page2ai-mcp-remote`) is a Remote MCP endpoint at `https://page2ai-mcp-remote.vercel.app/api/mcp`; the public domain `page2ai.com` is parked and will point here. It uses the same `page_to_markdown` tool as the local MCP and the same `@page2ai/core` engine (0.4.3). A cloud session on `claude.ai` can call this surface; the local one is unreachable from there. Latency above is one `tools/call` after the initialize handshake; a first call that includes the handshake took ~3 s.

⁷ CloakBrowser is a source-patched Chromium that bypasses Cloudflare Turnstile, reCAPTCHA v3 (0.9 score), FingerprintJS and 30+ bot detectors. It runs locally through its `cloak_*` MCP tools. The score and latency here are for one page with no proxy and no bot-check — a production run on a protected page adds a residential proxy and raises the per-page cost. The time is the one-page flow: launch (~5 s) + navigate (~9 s with humanize on) + read (~4 s). A second page on a warm browser skips launch, so the per-page cost falls to ~13 s.

⁸ Measured via Claude Code's MCP shim on 2026-11-15. The shim adds about 3 s of fixed wrapping overhead per call (Tavily's own server took 0.19 s versus the 5 s measured here). The tool's own latency is approximately 3 s less than the number shown.

**The exact calls:**

- **Page2AI (local):** the `@page2ai/mcp` server's `page_to_markdown` with the URL; or, in-process, `@page2ai/core`'s `fetchAndConvert(url)`.
- **Page2AI (hosted):** POST JSON-RPC to `https://page2ai-mcp-remote.vercel.app/api/mcp`; after `initialize` and `notifications/initialized`, a `tools/call` of `page_to_markdown` with the URL.
- **CloakBrowser:** `cloak_launch(headless=true, humanize=true, proxy=null, geoip=false)` → `cloak_navigate(page_id, URL)` → `cloak_read_page(page_id, max_length=50000)` → `cloak_close`.
- **scrapling 0.5:** the MCP tool `make_request` with the URL; `extraction_type: "markdown"` is the default.
- **Nimble:** `nimble_extract` with `output_format: "markdown"`.
- **scrapling 0.4.12:**
  - the MCP tool `get` with the URL;
  - the library's `scrapling extract get`.
- **trafilatura:** `extract(…, output_format="markdown", include_tables=True, include_links=True, include_formatting=True)`.
- **Firecrawl:** `firecrawl_scrape` with `formats: ["markdown"]`; timing above is `maxAge: 0` (fresh fetch).
- **Tavily:** `tavily_extract` with `format: "markdown"` and `extract_depth: "basic"`.
- **crawl4ai:**
  - the MCP tool `crawl_url` with the URL, then again with `clean: true`;
  - the library's `AsyncWebCrawler().arun()`.
- **Jina Reader:** `read_url` with the URL.

## Tools that received the site's own Markdown

These outputs are the key itself, or nearly, so they score close to 100 without converting anything.

| Tool | Hosting | Chars | Text ↑ | Extra ↓ | Score ↑ | Time ↓ | What came back |
|---|---|---:|---:|---:|---:|---:|---|
| MCP reference fetch server (2026.11.11) | Device | 42,654 | 100% | 0.0% | 100 | ~0.3 s | the site's Markdown; a first call returns 5,000 characters |
| Exa `web_fetch_exa` | Cloud | 38,117 | 99.1% | 0.1% | 99 | ~0.6 s | text with the Markdown source's syntax |
| Parallel `web_fetch`, `full_content: true` | Cloud | 43,205 | 99.9% | 1.4% | 99 | ~8 s ⁸ | the site's Markdown |
| Claude Code WebFetch | Cloud | not scored | | | | — | a model's answer about a `text/markdown` response |

The Markdown source has syntax that a converted page does not have:

- GitHub-style `[!NOTE]` callouts;
- code fences tagged `theme={null}`;
- links that end in `.md`.

Parallel and the fetch server returned all three, and Exa returned the callouts. The site serves this Markdown to such requests, so for these tools the site did the conversion. WebFetch passes the page to a model and returns the model's answer, so it has no raw output to score.

## Tools that fetch, but don't return Markdown

A browser-automation tool is what an agent reaches for when a Markdown converter can't open the page: Cloudflare challenges, single-page applications, bot-detection. Its native output is not Markdown — it is plain text, an accessibility tree, or raw HTML — so it is not scored on the structure columns. We report what each tool returns, how large that is, and how much of the article's words come through. On this page every converter works, so these tools' value is measured here, not demonstrated.

| Tool | Hosting | Native output | Chars | Text ↑ | Extra ↓ | Time ↓ |
|---|---|---|---:|---:|---:|---:|
| Claude in Chrome, `get_page_text` | Device | plain text, article only ⁵ | 35,245 | 98.9% | 2.0% | ~6 s ⁸ |
| Playwright Extension, `browser_evaluate` + `innerText` | Device | plain text, whole body | 37,438 | 99.2% | 5.2% | ~4 s ⁸ |
| Playwright MCP (headless), `browser_evaluate` + `innerText` | Device | plain text, whole body | 37,438 | 99.2% | 5.2% | ~1.4 s |
| Claude in Chrome, `read_page` | Device | accessibility tree with `ref_X` anchors | 85,949 | 86.8% | 51.9% | ~4.5 s ⁸ |
| Playwright MCP (headless), `browser_snapshot` | Device | accessibility YAML with bounding boxes | 160,264 | 99.2% | 61.5% | ~2 s |
| Playwright Extension, `browser_snapshot` | Device | accessibility YAML with bounding boxes | 164,129 | 99.2% | 61.5% | ~7 s ⁸ |

⁵ Claude in Chrome's `get_page_text` prioritizes the `<main>` element and drops navigation and footer — the lowest noise of any fetcher here. Its `read_page` is the opposite: an accessibility tree with every element wrapped in `[ref_X]` anchors, so the exact phrase `"claude code ignores them at load time"` does not appear as a contiguous string there, even though its words are present.

**What these numbers say.** Plain-text output recovers the article's words (87% to 99%) without any of its Markdown structure. An agent that reads them downstream has to convert them. The two Playwright surfaces (headless MCP and the Chrome extension) return the same `innerText` on this static page; their accessibility snapshots differ by about 4 KB of layout noise. These tools' real test is a page that converters cannot open at all, which is a separate benchmark.

## What the numbers say

- **CloakBrowser wins the noise race, Page2AI wins the production fit.** CloakBrowser's 99 beats Page2AI's 97 by two points because its reader-mode extractor trims the "On this page" list, "Was this page helpful?" and the prev/next links that Page2AI keeps. On this page the gap is 0.2% vs 1.9% in noise. But CloakBrowser needs a local stealth Chromium per session: **~18 s end-to-end** on a fresh launch versus **~0.4 s** for Page2AI local — a 40–45× gap. For a converter on an agent's hot path, Page2AI is the pick; for a page that refuses ordinary fetchers, CloakBrowser is.
- **Page2AI's two surfaces tied at 97.** Local (`@page2ai/mcp`, Device) and hosted (`page2ai-mcp-remote`, Cloud) both run the same `@page2ai/core` engine and return the same scores — the local one is ~0.4 s/page, the hosted one ~0.7 s/page after session init. The hosted surface is the one an agent on `claude.ai` can call; the local one is not reachable from there.
- **scrapling 0.5 came third.** It delivered nearly all the text with every heading, code block and table; only the site's left-nav survives into its output, which is why its noise is a few points higher than Page2AI's. Score 93 against Page2AI's 97.
- **The 0.4 to 0.5 jump in scrapling is a different tool.** On the same page, scrapling 0.4.12's MCP server scores 21 and 0.5's scores 93. The 0.5 release (October 2026) ships a new MCP server (`scrapling-05`) with new tools (`make_request`, `browser_fetch_once`, `browser_extract`); the two share a name and a library lineage, not an output shape.
- **Nimble is still the closest non-scrapling converter on text.** It delivered nearly all the text, little extra and every code block and table, but its headings arrive as plain lines — and it was the slowest converter on this page (~16 s via MCP shim; the Nimble server itself still runs 10+ s because it extracts the full page with no filter).
- **Extra text costs as much as missing text.** Five of the converters delivered nearly the whole page, and then six to seven times its length in total. About 80% of each of those outputs is one line of the site's embedded configuration (`{"docsConfig":{"theme":"mint",…`, 225,000 to 241,000 characters), and navigation adds more. An agent pays for every character it reads.
- **Headings are where converters differ.** Jina, Nimble and the crawl4ai library wrote the page's headings as plain lines, so the agent loses the outline.
- **Defaults decide what an agent gets.** Through their MCP servers, crawl4ai returned the first 20,000 characters of the page, and scrapling returned a short main-content extract without code blocks or tables. The same libraries called directly returned everything.
- **Three tools got the author's Markdown.** Their outputs match the key because they are the key. Page2AI converts the page itself, so it works the same way on sites that publish no Markdown copy.
- **Hosting is a hard constraint, not a preference.** An agent on `claude.ai` cannot talk to a Device tool at all: no Chrome extension, no stdio MCP, no local Python. The Device/Cloud column in each table is the first filter before score or latency.

## Page2AI's own gaps on this page

- Code blocks come without a language tag: a bare code fence instead of one tagged `json`. The site marks the language in an attribute that Page2AI does not read yet.
- Each heading keeps the site's invisible anchor link, for example `## [​](…#next-steps) Next steps`. Tavily's output has the same.
- The 1.9% of extra text is the page's "On this page" list, "Was this page helpful?" and the links to the previous and next pages.

Both defects are logged as open issues.

## Frequently asked questions

**Which web-to-Markdown tool gives an LLM the cleanest Markdown?**
On this page, CloakBrowser (score 99), then Page2AI (97, local and hosted tied), then scrapling 0.5 (93), then Nimble (63). Every other converter either lost part of the page or added several times its length in navigation and embedded code. The result holds for one documentation page; other pages can rank differently.

**Which one should I actually use?**
Depends on where your agent runs and how cost-sensitive it is. An agent on `claude.ai` can only call Cloud tools: Page2AI hosted (Remote MCP, ~0.7 s, score 97) is the top choice there. A Claude Desktop or Claude Code agent reaches Device tools too: Page2AI local (~0.4 s, score 97) is the production pick, and CloakBrowser (~18 s first page, ~13 s per follow-up, score 99) is reserved for pages ordinary converters can't open — Cloudflare challenges, SPAs, aggressive bot-detection.

**What if a Markdown converter can't open the page?**
Two layered fallbacks. For soft blocks (Cloudflare Turnstile, reCAPTCHA v3, fingerprint checks), a stealth browser like **CloakBrowser** passes them locally and returns Markdown; add a residential proxy for geo-fencing or IP-reputation challenges. For pages that only render after JavaScript, agents fall back to a browser-automation tool — Claude in Chrome, Playwright MCP or the Playwright Extension — and read the page's accessibility tree or its `innerText`. That output is not Markdown, and a page like this one does not stress the fallback: every converter opens it. A page under hostile anti-bot is a different benchmark, and this one does not run it.

**Why does extra text matter for AI agents?**
An agent reads the whole tool result into its context window. On this page, about 80% extra turned a 42,591-character page into 267,000 to 288,000 characters. That is more tokens and less room for the task. In Claude Code these results were too large to show inline, so they were saved to a file instead.

**Do Exa and Parallel convert HTML to Markdown?**
On this page they returned the site's own Markdown copy. This test does not show how they convert a page that has no such copy.

**How do I reproduce this benchmark?**
Fetch the answer key with `curl https://code.claude.com/docs/en/plugins-reference.md`. Call each tool on `https://code.claude.com/docs/en/plugins-reference`, then score the output with the rules under "How the scores were computed" below.

## Limits of this test

- **One page, one day.** Hosted services change their extraction without notice, so rerun before you rely on a number. The converters were measured 2026-11-13; scrapling 0.5, the fetchers, CloakBrowser, Page2AI hosted and all latency numbers were measured 2026-11-15 on the same page URL.
- **Default settings.** Most of these tools can be tuned with CSS selectors, content filters or higher limits. We measured what a plain call returns.
- **What the scores miss.** The key is the author's Markdown, not a judgment of what an agent needs. Word overlap does not check reading order or link targets.
- **The fetchers' real test is a page converters can't open.** Cloudflare challenges, single-page applications, bot-detection: a browser-automation tool is the way in. This page does not exercise that, so Claude in Chrome, Playwright MCP and the Playwright Extension are measured here on content every converter also handles. A separate anti-bot benchmark would rank them differently.
- **CloakBrowser was run without a proxy on this page.** The stealth Chromium passed the site's checks because the page has no bot-detection. A production run on a paywalled or Cloudflare-protected site needs a residential proxy and raises the per-page cost. We left scrapling's `browser_fetch_once` out of the single-page comparison to keep the stealth row tight; a Cloudflare/SPA benchmark would include both.
- **Latency numbers mix two measurement methods.** Direct HTTP and Python/Node library calls are a clean wall-clock. Rows marked ⁸ were measured via Claude Code's MCP shim, which adds ~3 s of fixed wrapping overhead per call — the tool's own latency is ~3 s less on those rows. Numbers are single fresh calls, not medians, from a US residential ISP (~250 Mbit/s).
- **One page, not a multi-site benchmark.** For the multi-site benchmark, see [page2ai-benchmark](https://github.com/igorsaevets/page2ai-benchmark).

We do not republish the outputs, since each one is a copy of Anthropic's page.

**How the scores were computed:**

- Words are lowercase letter-and-digit tokens, counted after link targets are removed.
- **Text** is the overlap of the two word multisets divided by the key's word count.
- **Extra** is one minus that overlap divided by the output's word count.
- A heading counts when its text matches a Markdown heading of either style, indented by up to three spaces.
- A code block counts when its longest line appears inside a fence.
- A table row counts when its first cell starts a Markdown table row.

---

*Written by [Igor Saevets](/page2ai-docs/about/) — [LinkedIn](https://www.linkedin.com/in/igorsaevets/) · [GitHub](https://github.com/igorsaevets).*
