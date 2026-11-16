---
title: 'What AI coding agents could not open'
description: 'An audit of every web fetch that Claude Code, Claude Desktop, Codex, OpenCode, MiMo Code and Antigravity made on one Windows PC between May and November 2026: what opened, what refused, what never existed, and what the vendors say about their fetchers. Open data under CC BY 4.0.'
head:
  - tag: meta
    attrs:
      name: keywords
      content: 'AI coding agents, web fetch failures, Claude Code WebFetch, Codex, OpenCode, HTTP 403, HTTP 402, 404 not found, bot protection, open dataset'
  - tag: script
    attrs:
      type: application/ld+json
    content: |
      {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": "What AI coding agents could not open: 19,611 page fetches by six agents on one PC",
        "description": "An audit of every web fetch that Claude Code, Claude Desktop, Codex, OpenCode, MiMo Code and Antigravity made on one Windows PC between May and November 2026: what opened, what refused, what never existed, and what the vendors say about their fetchers. Open data under CC BY 4.0.",
        "url": "https://page2ai.net/research/agent-fetch-outcomes/",
        "datePublished": "2026-11-16",
        "dateModified": "2026-11-16",
        "author": {
          "@type": "Person",
          "name": "Igor Saevets",
          "url": "https://page2ai.net/about/",
          "sameAs": [
            "https://orcid.org/0009-0006-8636-1377",
            "https://github.com/igorsaevets"
          ]
        },
        "license": "https://creativecommons.org/licenses/by/4.0/",
        "isBasedOn": {
          "@id": "https://page2ai.net/research/agent-fetch-outcomes/#dataset"
        },
        "about": [
          {
            "@type": "Thing",
            "name": "AI coding agents"
          },
          {
            "@type": "Thing",
            "name": "Web page fetching by AI agents"
          }
        ],
        "mentions": [
          {
            "@type": "SoftwareApplication",
            "name": "Claude Code"
          },
          {
            "@type": "SoftwareApplication",
            "name": "Claude Desktop"
          },
          {
            "@type": "SoftwareApplication",
            "name": "Codex"
          },
          {
            "@type": "SoftwareApplication",
            "name": "OpenCode"
          },
          {
            "@type": "SoftwareApplication",
            "name": "MiMo Code"
          },
          {
            "@type": "SoftwareApplication",
            "name": "Antigravity"
          },
          {
            "@type": "SoftwareApplication",
            "name": "Jina Reader"
          },
          {
            "@type": "SoftwareApplication",
            "name": "Firecrawl"
          }
        ]
      }
  - tag: script
    attrs:
      type: application/ld+json
    content: |
      {
        "@context": "https://schema.org",
        "@type": "Dataset",
        "@id": "https://page2ai.net/research/agent-fetch-outcomes/#dataset",
        "name": "Agent fetch outcomes: 19,611 page fetches by six AI agents on one PC (2026)",
        "description": "Every call in which an AI agent on one Windows PC tried to open a web page, from 2026-05-09 to 2026-11-16 07:30 UTC, one row per call and URL, with the tool used and the outcome: content, refusal by the site, challenge page, HTTP 402, not found, redirect, network error or tool-side error. Agents: Claude Code, Claude Desktop, Codex, OpenCode, MiMo Code and Antigravity. With per-host summaries and the two scanners that read the agents' local histories.",
        "url": "https://page2ai.net/research/agent-fetch-outcomes/",
        "sameAs": "https://github.com/igorsaevets/agent-fetch-outcomes",
        "version": "1.0.0",
        "datePublished": "2026-11-16",
        "creator": {
          "@type": "Person",
          "name": "Igor Saevets",
          "url": "https://page2ai.net/about/",
          "sameAs": [
            "https://orcid.org/0009-0006-8636-1377",
            "https://github.com/igorsaevets"
          ]
        },
        "license": "https://creativecommons.org/licenses/by/4.0/",
        "isAccessibleForFree": true,
        "keywords": [
          "AI agents",
          "coding agents",
          "web fetch",
          "HTTP status codes",
          "bot protection",
          "Claude Code",
          "Codex",
          "open data"
        ],
        "temporalCoverage": "2026-05-09/2026-11-16",
        "measurementTechnique": "Local agent histories (Claude Code transcripts, Claude Desktop MCP logs, OpenCode, MiMo Code and Codex SQLite stores, Antigravity conversation databases) scanned for page-fetch tool calls; each call classified by the tool's structured status first and its error text second.",
        "variableMeasured": [
          "outcome",
          "http_status",
          "tool",
          "site_type",
          "url_in_context",
          "rescued_by"
        ],
        "distribution": [
          {
            "@type": "DataDownload",
            "name": "attempts.csv",
            "encodingFormat": "text/csv",
            "contentUrl": "https://raw.githubusercontent.com/igorsaevets/agent-fetch-outcomes/main/data/attempts.csv"
          },
          {
            "@type": "DataDownload",
            "name": "sites_by_category.csv",
            "encodingFormat": "text/csv",
            "contentUrl": "https://raw.githubusercontent.com/igorsaevets/agent-fetch-outcomes/main/data/sites_by_category.csv"
          },
          {
            "@type": "DataDownload",
            "name": "summary.json",
            "encodingFormat": "application/json",
            "contentUrl": "https://raw.githubusercontent.com/igorsaevets/agent-fetch-outcomes/main/data/summary.json"
          }
        ]
      }
---

*19,611 page fetches by six agents on one PC, May to November 2026. Published 2026-11-16.*

I use AI agents every day: Claude Code in the terminal and in the Claude Desktop app, Codex, OpenCode, MiMo Code and, for a short time, Antigravity. All of them read web pages for me, and sometimes a page does not come back. I wanted to know how often that happens, on which sites, with which tool, and what the agent did next.

Every agent keeps a history on disk. I wrote two scanners that read those histories, found every call that tried to open a URL, and classified its outcome. This article reports what they found. The data (CC BY 4.0) and the scanners (MIT) are published with it, so you can check every number here and run the same scan on your own machine.

**Disclosure.** I build Page2AI, a free tool that converts web pages to Markdown for language models. As a fetch tool it appears in this data only in two test calls (example.com) and is not compared with anything here; pages about it on other sites (its store listing, npm, directories) are in the data like any other page. My own sites were removed from the published data (see "What was removed before publication").

## Key findings

- **Most fetches worked.** Of 16,757 calls whose outcome was recorded, 14,503 (86.5%) returned content. Codex's hosted `web_search` made another 2,854 calls whose outcome is not recorded at all; counted over all 19,611 calls, the opened share lies between 74.0% (if none of those opened) and 88.5% (if all did).
- **Sites rarely refused.** A refusal by the site (HTTP 403, 429 or 999, a challenge page, a JavaScript wall) happened 328 times on 109 hosts, 2.0% of recorded calls. Claude Code's built-in WebFetch received 226 of them.
- **In Claude Code, most "404 Not Found" answers were for URLs that had not appeared earlier in the conversation.** That holds for 82% of the WebFetch calls that ended in "not found", against 38% of the WebFetch calls that opened a page. The likely source is the model writing a URL from memory or from a pattern; this check covers Claude Code only.
- **Claude Code refused 19 calls on 6 hosts by its own list** (reddit.com, old.reddit.com, web.archive.org, arstechnica.com, casetext.com, vk.com) before any request reached the site. Another tool opened the same URL later in the same session in 11 of the 19.
- **With my setup, refusals were often routed around.** When a site refused, a different tool opened the same URL later in the same session in 107 of 328 cases (33%); WebFetch followed by Jina Reader (`read_url`) accounts for 62 of them. My own instructions to the agents name that fallback order, so this describes my setup as much as the agents.
- **113 hosts were never opened** by any tool (150 failed calls). On 36 of them a site refused, on 28 the connection or the server failed, 1 needed a login, and on 48 every call asked for a page that did not exist or redirected elsewhere.
- **x.com answered HTTP 402 Payment Required** to all 9 WebFetch calls it received.

## The data

### Six agents, six storage formats

| agent | where the history lives | what a row is |
|---|---|---|
| Claude Code (CLI, the Code tab of Claude Desktop, headless `claude -p`) | JSONL transcripts in `~/.claude/projects/` | one `tool_use` block with a URL; the line's `entrypoint` says which surface |
| Claude Desktop chat | the app's MCP server logs | one MCP tool call with a URL (the chat's built-in web fetch is not on disk) |
| Codex | `thread_history` SQLite plus session rollouts | one tool call; hosted `web_search` calls record no outcome |
| OpenCode | `opencode.db` (SQLite) | one tool part with a URL |
| MiMo Code | `mimocode.db` (SQLite) | one tool part with a URL |
| Antigravity | one SQLite file per conversation, steps as protobuf | one fetch, MCP or command step |

Claude Code covers 2026-06-10 to 2026-11-16, Claude Desktop chat 2026-05-09 to 2026-11-05 (its last logged call), Codex 2026-06-28 to 2026-11-16, OpenCode 2026-09-01 to 2026-11-16, MiMo Code 2026-09-22 to 2026-11-16 and Antigravity 2026-08-09 to 2026-08-18. Everything is cut at **2026-11-16 07:30 UTC**, so the counts do not move when the scanners run again. A re-scan of the four non-Claude stores with that cut reproduced the earlier file row for row (8,187 rows before the privacy filter, no differences).

### One call, one row

A call that asks for one URL is one row; a call with several URLs (a batch reader, a shell command with three `curl`s) gives one row per URL and is flagged `multi_url_call`. Claude Code transcripts repeat earlier calls: some lines replay the whole request history, and resumed or forked sessions copy old messages. Counting every `tool_use` block would have counted many calls two or more times, so rows are keyed by the tool call's id and the earliest dated copy wins.

Calls made from a shell (`curl`, `Invoke-WebRequest`) are included because agents use them to fetch pages, but they are flagged `low_confidence` (2,665 rows): a command can mention a URL it never requests. 4,055 rows come from calls with several URLs. 686 Codex calls and 123 Antigravity calls came from automated document reviews, where the agent was asked to check a text and chose the URLs itself; Claude Code rows carry no such flag. Claude Code's WebSearch tool is not counted: it returns search results, not pages.

### How an outcome is decided

The scanner reads the structured status first: WebFetch returns 403, 429 and 402 as a normal result with a code, OpenCode and MiMo write `non 2xx status code (403 GET ...)`, Antigravity writes `failed to get URL ... status code 404`. Only when there is no status does it look at the text, and only after removing the tool's echo of its own input, stack traces and URLs. That order matters. Before it, the word "permission" inside a Go stack trace turned 81 Antigravity 403s and 404s into "permission errors", and a reader service that repeats the caller's question about bot protection made a normal page look like a bot wall.

| outcome group | what it means |
|---|---|
| opened | the tool returned the page's content (WebFetch returns a model's summary of it and may serve a copy cached for 15 minutes) |
| refused by the site | HTTP 403, 429, 451 or 999, a challenge page (whatever its status code), or a page that only says "enable JavaScript"; the answer may come from a CDN or a proxy in front of the site |
| HTTP 402 | Payment Required; the code alone does not say whether it is a paywall or a gate for bots |
| not found | HTTP 404 or 410 |
| redirect not followed | the tool reported a redirect to another host and stopped |
| refused by the agent's own policy | the agent refused before sending anything (Claude Code's domain list; MiMo Code's address guard) |
| refused by a fetch service | a scraping service declined the site |
| login or key needed | HTTP 401/407 or a sign-in page |
| network or server error | DNS, connection, timeout, TLS, HTTP 5xx |
| tool-side error | the tool failed for its own reasons: cancelled, not permitted (for example Codex's approval policy refusing an MCP call in an unattended run), out of credits, browser busy, bad arguments |
| other HTTP error, unclear | another 4xx; one answer covering several URLs |
| not recorded | Codex's hosted `web_search` stores no outcome |

### What was removed before publication

The histories are mine, and I decided to publish the sites by name, including government and legal ones, and the exact URLs without query strings. Some rows still cannot be published: links that carry tokens, my own servers and sites, addresses on private networks, pages that only exist behind a login, and pages about a particular person. A filter applied the rules below in order; the first rule that matched decided. "URL reduced to host" keeps the row, its tool and its outcome, and replaces the URL with `https://host/`.

| rule | action | rows | hosts |
|---|---|---|---|
| ip_address | row removed | 7 | 4 |
| not_a_url | row removed | 373 | 82 |
| private_network | row removed | 246 | 2 |
| own_site | row removed | 1793 | 19 |
| private_infrastructure | row removed | 39 | 4 |
| robots_file | row removed | 3 | 2 |
| login_or_capability | URL reduced to host | 885 | 60 |
| person_or_social_profile | URL reduced to host | 130 | 16 |
| court_record | URL reduced to host | 162 | 16 |
| search_query | URL reduced to host | 2 | 1 |
| email_like | URL reduced to host | 97 | 2 |
| ip_in_path | URL reduced to host | 1 | 1 |
| author_business | URL reduced to host | 30 | 6 |
| kept | kept | 18304 | 1929 |

`own_site` covers my own domains and deployments; `private_network` covers machines on my private network; `not_a_url` covers strings the scanner took from code, such as `https://example.com/${path}`; `robots_file` covers requests for `/robots.txt` files themselves rather than pages; `login_or_capability` covers sign-in pages, dashboards and consoles; `court_record` covers court dockets, filings and case-law pages whose address names the parties; `search_query` covers search services that put the query into the address. No row matched the secret, private-repository or ID-number rules; they stay in the filter. The deny list that names my hosts is not published. Of the 1,793 rows removed as my own sites, 1,577 opened, so removing them lowers the overall share of opened calls a little (86.8% with them, 86.5% without).

## Results

### By agent

| agent | period | calls (URL attempts) | opened (% of recorded) | refused by the site | HTTP 402 | not found | redirect not followed | agent's own policy | login or key | network/server | tool-side | other/unclear | outcome not recorded |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Claude Code | 2026-06-10 .. 2026-11-16 | 10880 | 9610 (88.3%) | 266 | 19 | 378 | 182 | 19 | 13 | 107 | 217 | 69 | 0 |
| Claude Desktop chat (MCP servers) | 2026-05-09 .. 2026-11-05 | 909 | 850 (93.5%) | 6 | 0 | 4 | 0 | 0 | 0 | 8 | 39 | 2 | 0 |
| Codex | 2026-06-28 .. 2026-11-16 | 4856 | 1374 (68.6%) | 8 | 0 | 4 | 0 | 0 | 5 | 15 | 583 | 13 | 2854 |
| OpenCode | 2026-09-01 .. 2026-11-16 | 1558 | 1410 (90.5%) | 21 | 0 | 79 | 0 | 0 | 4 | 17 | 24 | 3 | 0 |
| MiMo Code | 2026-09-22 .. 2026-11-16 | 1005 | 941 (93.6%) | 11 | 0 | 15 | 0 | 0 | 1 | 13 | 24 | 0 | 0 |
| Antigravity | 2026-08-09 .. 2026-08-18 | 403 | 318 (78.9%) | 16 | 0 | 53 | 0 | 0 | 4 | 3 | 6 | 3 | 0 |

Claude Code dominates the data because I use it most. Codex's low share has two causes that are not the sites: 461 of its 583 tool-side errors are MCP calls that were cancelled and 35 more were refused by its approval policy, and 2,854 of its calls have no recorded outcome. The "other/unclear" column holds other HTTP errors, unclear answers and three refusals by a fetch service.

### By tool

| agent | tool | family | calls | opened | refused by site | 402 | not found | redirect | own policy | tool-side |
|---|---|---|---|---|---|---|---|---|---|---|
| Claude Code | `WebFetch` | built-in fetch | 4215 | 79.3% | 226 | 12 | 327 | 163 | 19 | 34 |
| Codex | `web_search:open_page` | built-in fetch | 2392 | not recorded | 0 | 0 | 0 | 0 | 0 | 0 |
| Claude Code | `Bash` | shell HTTP client | 2186 | 94.1% | 1 | 0 | 12 | 17 | 0 | 84 |
| Claude Code | `jina-mcp-server:read_url` | remote reader service | 2074 | 95.5% | 26 | 7 | 0 | 0 | 0 | 28 |
| OpenCode | `webfetch` | built-in fetch | 1421 | 90.9% | 21 | 0 | 79 | 0 | 0 | 10 |
| Claude Desktop chat (MCP servers) | `playwright:browser_navigate` | local browser or scraper | 631 | 94.8% | 1 | 0 | 0 | 0 | 0 | 26 |
| Claude Code | `playwright:browser_navigate` | local browser or scraper | 625 | 97.3% | 0 | 0 | 0 | 0 | 0 | 12 |
| MiMo Code | `jina-mcp-server_read_url` | remote reader service | 575 | 97.7% | 2 | 0 | 0 | 0 | 0 | 7 |
| Codex | `exa:web_fetch_exa` | remote reader service | 546 | 95.4% | 0 | 0 | 0 | 0 | 0 | 13 |
| Claude Code | `jina-mcp-server:parallel_read_url` | remote reader service | 522 | 97.9% | 0 | 0 | 0 | 0 | 0 | 3 |
| Claude Code | `PowerShell` | shell HTTP client | 479 | 88.1% | 3 | 0 | 7 | 2 | 0 | 23 |
| Codex | `web_search:find_in_page` | built-in fetch | 462 | not recorded | 0 | 0 | 0 | 0 | 0 | 0 |
| Antigravity | `read_url_content` | built-in fetch | 391 | 79.3% | 16 | 0 | 53 | 0 | 0 | 2 |
| Codex | `jina-mcp-server:read_url` | remote reader service | 369 | 53.9% | 3 | 0 | 0 | 0 | 0 | 157 |
| Codex | `jina-mcp-server:parallel_read_url` | remote reader service | 364 | 24.5% | 0 | 0 | 0 | 0 | 0 | 275 |
| MiMo Code | `webfetch` | built-in fetch | 304 | 86.5% | 9 | 0 | 13 | 0 | 0 | 13 |
| Codex | `codex_apps:tavily_ai.tavily_extract` | remote reader service | 274 | 86.1% | 1 | 0 | 0 | 0 | 0 | 37 |
| Claude Code | `firecrawl:firecrawl_scrape` | remote reader service | 157 | 68.8% | 0 | 0 | 21 | 0 | 0 | 21 |
| Claude Code | `playwright-ext:browser_navigate` | local browser or scraper | 153 | 97.4% | 1 | 0 | 0 | 0 | 0 | 1 |
| Claude Code | `scrapling:fetch` | local browser or scraper | 108 | 88.0% | 1 | 0 | 7 | 0 | 0 | 2 |
| OpenCode | `curl(shell)` | shell HTTP client | 105 | 84.8% | 0 | 0 | 0 | 0 | 0 | 11 |
| Claude Code | `claude-in-chrome:navigate` | local browser or scraper | 88 | 97.7% | 0 | 0 | 0 | 0 | 0 | 2 |

WebFetch opens fewer pages than the reader services next to it, but the comparison is not fair to it. It is the tool the agent tries first, on every kind of URL, including the ones the model wrote itself; in my setup Jina Reader is usually the second attempt.

Grouped by family:

| tool family | calls | with an outcome | opened (% of those) | refused by the site | network/server | not found | tool-side |
|---|---|---|---|---|---|---|---|
| built-in fetch | 9185 | 6331 | 82.2% | 272 (4.3%) | 109 | 472 | 59 |
| local browser or scraper | 2255 | 2255 | 91.0% | 17 (0.8%) | 23 | 17 | 136 |
| other MCP tool | 2 | 2 | 100.0% | 0 (0.0%) | 0 | 0 | 0 |
| remote reader service | 5292 | 5292 | 86.5% | 33 (0.6%) | 28 | 25 | 572 |
| shell HTTP client | 2877 | 2877 | 92.7% | 6 (0.2%) | 3 | 19 | 126 |

A "built-in fetch" runs inside the agent (WebFetch, OpenCode's and MiMo Code's `webfetch`, Antigravity's `read_url_content`, Codex's `web_search`). A "remote reader service" fetches from its own servers (Jina, Firecrawl, Exa, Tavily). A "local browser or scraper" runs on this PC (Playwright, Claude in Chrome, CloakBrowser, Scrapling, crawl4ai). A "shell HTTP client" is `curl` or PowerShell. Pages behind my own sign-in (Gmail, Google Ads, store dashboards and the like) are in the data reduced to their host: 761 browser rows of this kind, 732 of them opened, so the browser numbers look better than they would for public pages.

### By kind of site

The site type comes from a simple rule set on the host name (`.gov`, known code hosts, known AI vendors and so on); 1,312 hosts fall into "other". The percentages leave out calls with no recorded outcome and tool-side errors, so they describe what the sites answered.

| site type (heuristic) | hosts | calls | tool-side errors | calls the site answered | opened | refused by the site | HTTP 402 | not found |
|---|---|---|---|---|---|---|---|---|
| other | 1312 | 5395 | 149 | 4735 | 92.4% | 65 (1.4%) | 3 | 156 (3.3%) |
| AI vendor | 92 | 3416 | 77 | 2840 | 90.8% | 40 (1.4%) | 0 | 97 (3.4%) |
| government | 168 | 3344 | 383 | 1976 | 89.5% | 96 (4.9%) | 1 | 38 (1.9%) |
| documentation | 221 | 2632 | 62 | 2283 | 91.4% | 31 (1.4%) | 0 | 119 (5.2%) |
| code and packages | 16 | 2514 | 133 | 2071 | 93.9% | 17 (0.8%) | 0 | 90 (4.3%) |
| store or directory | 17 | 790 | 30 | 738 | 92.5% | 25 (3.4%) | 0 | 17 (2.3%) |
| academic | 64 | 554 | 28 | 398 | 94.7% | 9 (2.3%) | 3 | 2 (0.5%) |
| social or forum | 23 | 339 | 10 | 319 | 89.3% | 5 (1.6%) | 9 | 2 (0.6%) |
| legal | 29 | 307 | 7 | 217 | 81.6% | 20 (9.2%) | 3 | 8 (3.7%) |
| search or reader proxy | 6 | 136 | 8 | 127 | 92.1% | 2 (1.6%) | 0 | 3 (2.4%) |
| archive | 6 | 120 | 5 | 102 | 73.5% | 2 (2.0%) | 0 | 0 (0.0%) |
| news and media | 22 | 64 | 1 | 58 | 63.8% | 16 (27.6%) | 0 | 1 (1.7%) |

Legal sites refused 9.2% of the calls they answered and government sites 4.9%, and in both the refusals concentrate on a few hosts (law.justia.com and courtlistener.com; uscis.gov, federalregister.gov and ecfr.gov). News sites refused 27.6%, but only 58 such calls got an answer. Counted over all recorded calls, government sites look worse (74.9% opened), but that gap comes from 383 tool-side errors, not from the sites.

## Sites that refused

328 calls on 109 hosts. The 30 hosts with the most refusals:

| host | type | failed | days | first .. last | answers (top 3) | failed with (top 2) | opened on host (any tool; top 2 tools) |
|---|---|---|---|---|---|---|---|
| uscis.gov | government | 34 | 10 | 2026-07-26 .. 2026-09-01 | blocked 403 x33; blocked 429 x1 | WebFetch x33; codex_apps:tavily_ai.tavily_extract x1 | 599 of 1032 (jina-mcp-server:read_url x156; exa:web_fetch_exa x150) |
| openai.com | AI vendor | 15 | 8 | 2026-07-28 .. 2026-11-04 | blocked 403 x15 | WebFetch x14; curl(shell) x1 | 47 of 72 (jina-mcp-server:read_url x14; Bash x13) |
| federalregister.gov | government | 14 | 3 | 2026-07-27 .. 2026-08-22 | challenge x10; blocked x4 | WebFetch x10; jina-mcp-server:read_url x4 | 63 of 166 (WebFetch x20; Bash x12) |
| ecfr.gov | government | 12 | 5 | 2026-07-27 .. 2026-08-22 | challenge x8; blocked x4 | WebFetch x8; jina-mcp-server:read_url x4 | 143 of 422 (read_url_content x26; webfetch x21) |
| npmjs.com | code and packages | 12 | 9 | 2026-07-26 .. 2026-11-15 | blocked 403 x11; challenge x1 | WebFetch x8; read_url_content x2 | 37 of 54 (playwright:browser_navigate x9; Bash x9) |
| law.justia.com | legal | 11 | 7 | 2026-07-29 .. 2026-11-16 | blocked 403 x9; challenge x2 | read_url_content x5; webfetch x3 | 5 of 40 (jina-mcp-server:read_url x2; jina-mcp-server:parallel_read_url x2) |
| help.openai.com | AI vendor | 10 | 5 | 2026-10-05 .. 2026-11-13 | blocked 403 x10 | WebFetch x10 | 32 of 60 (webfetch x11; jina-mcp-server:read_url x9) |
| support.read.ai | documentation | 10 | 3 | 2026-09-28 .. 2026-10-12 | blocked 403 x9; challenge x1 | WebFetch x9; jina-mcp-server:read_url x1 | 7 of 18 (jina-mcp-server:read_url x6; webfetch x1) |
| help.otter.ai | documentation | 9 | 4 | 2026-10-04 .. 2026-10-14 | blocked 403 x9 | WebFetch x9 | 25 of 38 (jina-mcp-server:read_url x13; jina-mcp-server:parallel_read_url x6) |
| courtlistener.com | legal | 7 | 5 | 2026-07-28 .. 2026-08-20 | blocked 403 x7 | WebFetch x7 | 26 of 46 (jina-mcp-server:read_url x10; scrapling:fetch x6) |
| justice.gov | government | 7 | 5 | 2026-07-27 .. 2026-08-17 | blocked 403 x7 | WebFetch x7 | 68 of 204 (jina-mcp-server:read_url x21; read_url_content x19) |
| travel.state.gov | government | 7 | 4 | 2026-07-28 .. 2026-08-18 | blocked 403 x5; challenge x2 | WebFetch x2; jina-mcp-server:read_url x2 | 24 of 91 (exa:web_fetch_exa x14; scrapling:stealthy_fetch x6) |
| cursor.directory | store or directory | 6 | 3 | 2026-08-31 .. 2026-10-24 | blocked 429 x6 | WebFetch x5; Bash x1 | 8 of 15 (Bash x3; playwright:browser_navigate x2) |
| g2.com | store or directory | 6 | 3 | 2026-07-18 .. 2026-11-13 | blocked 403 x6 | scrapling:bulk_stealthy_fetch x3; webfetch x1 | 17 of 26 (jina-mcp-server:read_url x4; crawl4ai:crawl_clean x3) |
| leginfo.legislature.ca.gov | government | 6 | 3 | 2026-10-09 .. 2026-11-16 | blocked 403 x5; challenge x1 | WebFetch x4; webfetch x1 | 71 of 109 (jina-mcp-server:read_url x26; webfetch x21) |
| supernormal.com | other | 6 | 3 | 2026-07-29 .. 2026-10-12 | blocked 403 x6 | WebFetch x6 | 1 of 7 (jina-mcp-server:read_url x1) |
| arena.ai | other | 5 | 3 | 2026-10-25 .. 2026-11-12 | blocked 403 x4; challenge x1 | WebFetch x3; jina-mcp-server_read_url x1 | 13 of 20 (jina-mcp-server:read_url x7; claude-in-chrome:navigate x3) |
| searchengineland.com | news and media | 5 | 2 | 2026-11-10 .. 2026-11-14 | challenge x3; blocked 403 x2 | webfetch x2; jina-mcp-server:read_url x2 | 3 of 11 (playwright-ext:browser_navigate x2; webfetch x1) |
| chrome-stats.com | other | 4 | 1 | 2026-10-24 .. 2026-10-24 | challenge x4 | jina-mcp-server:read_url x4 | 0 of 4 |
| forum.utorrent.com | other | 4 | 1 | 2026-10-06 .. 2026-10-06 | blocked 403 x4 | webfetch x4 | 0 of 4 |
| onlinelibrary.wiley.com | academic | 4 | 2 | 2026-10-28 .. 2026-11-06 | challenge x3; blocked 403 x1 | jina-mcp-server:read_url x3; WebFetch x1 | 2 of 7 (crawl4ai:crawl_url x1; crawl4ai:crawl_with_js x1) |
| platform.openai.com | AI vendor | 4 | 2 | 2026-08-17 .. 2026-09-14 | blocked 403 x4 | WebFetch x3; read_url_content x1 | 27 of 51 (read_url_content x4; playwright:browser_navigate x4) |
| stackoverflow.com | code and packages | 4 | 3 | 2026-08-18 .. 2026-11-12 | blocked 403 x3; challenge x1 | webfetch x3; jina-mcp-server:read_url x1 | 5 of 9 (Bash x2; jina-mcp-server:parallel_read_url x1) |
| x.ai | AI vendor | 4 | 4 | 2026-07-28 .. 2026-10-13 | blocked 403 x4 | WebFetch x3; webfetch x1 | 21 of 25 (jina-mcp-server:read_url x8; webfetch x4) |
| alternativeto.net | store or directory | 3 | 1 | 2026-08-09 .. 2026-08-09 | blocked 403 x3 | read_url_content x3 | 12 of 20 (playwright:browser_navigate x10; scrapling:fetch x1) |
| api.vercel.com | other | 3 | 1 | 2026-08-31 .. 2026-08-31 | blocked 403 x3 | PowerShell x3 | 19 of 24 (PowerShell x19) |
| eurasianet.org | news and media | 3 | 1 | 2026-08-16 .. 2026-08-16 | blocked 403 x3 | WebFetch x3 | 0 of 4 |
| help.krisp.ai | documentation | 3 | 2 | 2026-09-28 .. 2026-10-11 | blocked 403 x3 | WebFetch x3 | 3 of 6 (jina-mcp-server:read_url x2; jina-mcp-server:parallel_read_url x1) |
| mcp.so | store or directory | 3 | 2 | 2026-07-24 .. 2026-08-31 | blocked 403 x3 | WebFetch x3 | 9 of 18 (Bash x5; playwright:browser_navigate x2) |
| mcpservers.org | store or directory | 3 | 2 | 2026-10-17 .. 2026-10-24 | blocked 403 x3 | WebFetch x3 | 0 of 4 |

Three patterns stand out.

**Refused one tool, opened by others.** uscis.gov answered 403 to WebFetch 33 times between 2026-07-26 and 2026-09-01, while 599 other calls opened pages on it, led by Jina Reader (156) and Exa (150). openai.com, help.openai.com, platform.openai.com, help.otter.ai and support.read.ai show the same shape: WebFetch refused, other tools opened the same host. The data cannot say why. It does not record the User-Agent, the network address or the TLS fingerprint of each call, and those are what a site decides on. In an informal WebFetch re-test on 2026-11-16, outside this dataset, uscis.gov, justice.gov, arena.ai and rferl.org opened, so at least some of these refusals did not last.

**Challenge pages on US federal regulation sites.** federalregister.gov and ecfr.gov answered with challenge pages (10 and 8) and refusals (4 each) between July and August 2026, to WebFetch and Jina Reader. For WebFetch a challenge often arrives as a redirect to `unblock.federalregister.gov`, which this scan counts as a challenge.

**Rate limits.** cursor.directory answered 429 six times. 13 of the 15 HTTP 429s in the data are counted as refusals by the site; the other two came back in batch calls whose single answer covered several URLs.

### Challenge pages

46 calls on 20 hosts:

| host | challenge pages |
|---|---|
| federalregister.gov | 10 |
| ecfr.gov | 8 |
| chrome-stats.com | 4 |
| onlinelibrary.wiley.com | 3 |
| searchengineland.com | 3 |
| travel.state.gov | 2 |
| yandex.cloud | 2 |
| law.justia.com | 2 |
| h1bgrader.com | 1 |
| admission.princeton.edu | 1 |
| pmc.ncbi.nlm.nih.gov | 1 |
| stackoverflow.com | 1 |
| support.read.ai | 1 |
| census.gov | 1 |
| pub.towardsai.net | 1 |
| arena.ai | 1 |
| journals.sagepub.com | 1 |
| npmjs.com | 1 |
| leginfo.legislature.ca.gov | 1 |
| themeforest.net | 1 |

## Refused by Claude Code itself

Claude Code's WebFetch refused 19 calls on 6 hosts with `Claude Code is unable to fetch from <host>`. By Anthropic's description of the check, a refused call sends no request to the site.

| host | type | calls | first .. last | tools | agents | opened on host (any tool; top 2 tools) |
|---|---|---|---|---|---|---|
| old.reddit.com | social or forum | 7 | 2026-10-17 .. 2026-10-17 | WebFetch x7 | claude-code x7 | 17 of 24 (jina-mcp-server:read_url x6; playwright:browser_navigate x4) |
| reddit.com | social or forum | 6 | 2026-10-17 .. 2026-10-31 | WebFetch x6 | claude-code x6 | 85 of 103 (jina-mcp-server:parallel_read_url x38; jina-mcp-server:read_url x12) |
| web.archive.org | archive | 3 | 2026-09-18 .. 2026-10-02 | WebFetch x3 | claude-code x3 | 48 of 82 (PowerShell x18; Bash x16) |
| arstechnica.com | news and media | 1 | 2026-09-18 .. 2026-09-18 | WebFetch x1 | claude-code x1 | 2 of 3 (jina-mcp-server:read_url x2) |
| casetext.com | legal | 1 | 2026-10-02 .. 2026-10-02 | WebFetch x1 | claude-code x1 | 1 of 4 (jina-mcp-server:read_url x1) |
| vk.com | social or forum | 1 | 2026-08-02 .. 2026-08-02 | WebFetch x1 | claude-code x1 | 1 of 2 (jina-mcp-server:parallel_read_url x1) |

Anthropic documents the mechanism. Before fetching from a host it has not cleared in the last five minutes, WebFetch sends the hostname, and only the hostname, to `api.anthropic.com` and checks it against a safety blocklist that Anthropic maintains; the check runs whichever model provider is configured and is not switched off by `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`; the setting `skipWebFetchPreflight: true` turns it off ([data usage](https://code.claude.com/docs/en/data-usage.md), section "WebFetch domain safety check"). When the check itself fails, the message is "Unable to verify if domain ... is safe to fetch", or, from version 2.1.285, a rate-limit message ([errors](https://code.claude.com/docs/en/errors.md)). That happened once here (support.claude.com) and is counted as a tool-side error, not as a refusal. I found no published copy of the list, and the errors page does not show the message for a listed host.

The refusals came from versions 2.1.170 (web.archive.org, arstechnica.com, vk.com), 2.1.285 (web.archive.org, casetext.com), 2.1.296 (reddit.com, old.reddit.com) and 2.1.311 (reddit.com). None of the six hosts was opened by WebFetch afterwards, and a re-test on 2026-11-16 with version 2.1.325 was refused on all six. Other people report the same message for web.archive.org ([anthropics/claude-code#107827](https://github.com/anthropics/claude-code/issues/107827)), www.theguardian.com ([#108080](https://github.com/anthropics/claude-code/issues/108080)), agents.stackoverflow.com ([#101552](https://github.com/anthropics/claude-code/issues/101552)) and naver.com ([#95539](https://github.com/anthropics/claude-code/issues/95539)). A search of the issue tracker on 2026-11-16 found no report for arstechnica.com, casetext.com or vk.com. An older report about academic sites ([#19287](https://github.com/anthropics/claude-code/issues/19287)) quotes the other message, "Unable to verify", a failed check rather than the list; it was closed in February 2026 as not planned. Here WebFetch opened arxiv.org 108 times.

The refusal did not stop the work. In 11 of the 19 cases the agent opened the same URL with another tool later in the same session, usually Jina Reader.

## HTTP 402 Payment Required

19 calls on 8 hosts:

| host | type | calls | first .. last | tools | agents | opened on host (any tool; top 2 tools) |
|---|---|---|---|---|---|---|
| x.com | social or forum | 9 | 2026-09-03 .. 2026-10-25 | WebFetch x9 | claude-code x9 | 14 of 23 (jina-mcp-server:read_url x5; PowerShell x5) |
| nolo.com | legal | 3 | 2026-08-16 .. 2026-08-16 | WebFetch x3 | claude-code x3 | 2 of 5 (jina-mcp-server:read_url x2) |
| groups.inf.ed.ac.uk | academic | 2 | 2026-07-27 .. 2026-07-27 | jina-mcp-server:read_url x2 | claude-code x2 | 22 of 54 (WebFetch x8; crawl4ai:crawl_url x3) |
| arxiv.org | academic | 1 | 2026-07-27 .. 2026-07-27 | jina-mcp-server:read_url x1 | claude-code x1 | 223 of 285 (WebFetch x108; jina-mcp-server:read_url x40) |
| gwern.net | other | 1 | 2026-07-27 .. 2026-07-27 | jina-mcp-server:read_url x1 | claude-code x1 | 1 of 2 (WebFetch x1) |
| happyscribe.com | other | 1 | 2026-07-27 .. 2026-07-27 | jina-mcp-server:read_url x1 | claude-code x1 | 13 of 14 (WebFetch x7; jina-mcp-server:parallel_read_url x5) |
| tldv.io | other | 1 | 2026-07-27 .. 2026-07-27 | jina-mcp-server:read_url x1 | claude-code x1 | 48 of 57 (jina-mcp-server:read_url x13; WebFetch x12) |
| uscis.gov | government | 1 | 2026-07-27 .. 2026-07-27 | jina-mcp-server:read_url x1 | claude-code x1 | 599 of 1032 (jina-mcp-server:read_url x156; exa:web_fetch_exa x150) |

Two different things share this code. x.com answered 402 to every one of the 9 WebFetch calls it received between 2026-09-03 and 2026-10-25, from the CLI and from the Desktop Code tab; nolo.com did the same three times on one day. The seven 402s through Jina Reader all fell on 2026-07-27, on six unrelated sites, among them arxiv.org and uscis.gov, which opened hundreds of times otherwise. That pattern fits a problem on the reader service's side (its account, its quota or its network) better than six sites changing on the same day, but the record does not say which, and the tables count them as the sites' answers. Without them, 12 calls on two hosts got a 402, all from WebFetch: x.com 9 and nolo.com 3.

## Not found, and who wrote the URL

| host | not found |
|---|---|
| raw.githubusercontent.com | 44 |
| github.com | 29 |
| openrouter.ai | 24 |
| soniox.com | 17 |
| docs.gladia.io | 12 |
| opencode.ai | 12 |
| modelcontextprotocol.io | 11 |
| assemblyai.com | 10 |
| antigravity.google | 9 |
| developers.openai.com | 9 |
| docs.dokploy.com | 8 |

Hosts with eight or more; 5 more hosts had 7 each.

A 404 can mean a dead link, a page the site hides from bots, or a URL that never existed. To tell them apart I checked, for every Claude Code call, whether its URL had appeared earlier in the same conversation: in a message from me, in a file the agent read, in a search result or in a fetched page. A URL that appears nowhere before the call was most likely written by the model itself, from memory or from a pattern (one host in the never-opened table below, cheatseetseries.owasp.org, is a misspelling of cheatsheetseries.owasp.org).

| tool | outcome | calls | URL was in the context before | URL not in the context | share not in context |
|---|---|---|---|---|---|
| WebFetch | opened | 3342 | 2070 | 1272 | 38.1% |
| WebFetch | not found | 327 | 59 | 268 | 82.0% |
| WebFetch | refused by the site | 226 | 148 | 78 | 34.5% |
| WebFetch | redirect not followed | 163 | 66 | 97 | 59.5% |
| WebFetch | refused by the agent's own policy | 19 | 2 | 17 | 89.5% |
| WebFetch | network or server error | 86 | 40 | 46 | 53.5% |
| WebFetch | HTTP 402 | 12 | 12 | 0 | 0.0% |
| Claude Code's other tools | opened | 6268 | 3367 | 2901 | 46.3% |
| Claude Code's other tools | not found | 51 | 6 | 45 | 88.2% |
| Claude Code's other tools | refused by the site | 40 | 26 | 14 | 35.0% |
| Claude Code's other tools | redirect not followed | 19 | 13 | 6 | 31.6% |
| Claude Code's other tools | network or server error | 21 | 14 | 7 | 33.3% |
| Claude Code's other tools | HTTP 402 | 7 | 7 | 0 | 0.0% |

82% of the WebFetch calls that ended in "not found" asked for a URL that was not in the conversation, against 38% of the calls that opened a page. Claude Code's other tools show the same gap (88% against 46%). Typical cases are a documentation path, a GitHub file location or a versioned API page that the model wrote and that did not exist.

Whether some 404s were bot blocks in disguise, the data can only partly say. The agents rarely tried a not-found URL again with another tool: 17 of 533 times. When they did, 12 of the 17 opened, so those 404s were an answer to one tool rather than a missing page. For refusals by the site, 129 of 328 URLs were tried again with another tool, and 107 opened.

How the check works and where it errs: the URLs are compared without scheme, `www.`, query string and trailing slash. A URL counts as "in the conversation" if it appears in any user message or tool result before the call. Text that the agent receives outside the transcript (the system prompt, project instructions) is invisible to this check, and so are relative links inside fetched pages. Both push URLs into "not in the conversation". An error in the other direction exists too: a URL the model wrote can come back in a tool's error message and count as seen when the model asks for it again. So the 82% is an estimate, not a bound, and the gap between 82% and 38% is the finding. URLs are compared as recorded, before the privacy filter. The check follows the same idea as the web fetch tool of the Claude API, a different product, which can only fetch URLs that have already appeared in user messages or tool results and answers `url_not_in_prior_context` otherwise ([web fetch tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-fetch-tool.md)). Claude Code's WebFetch has no such rule: 1,272 of its calls that opened a page asked for a URL this check did not find earlier.

## Redirects

WebFetch does not follow a redirect to another host. It returns a text naming both URLs and leaves the next step to the model ([tools reference](https://code.claude.com/docs/en/tools-reference.md), "WebFetch tool behavior"). That happened 163 times (HTTP 301 86, 302 38, 308 16, 307 8, no code 15). It is not a failure of the site; the model usually fetched the target next, which is a new URL and does not appear as a rescue in the tables below.

## What the agent did next

When a call failed, did a later call in the same session open the same URL with a different tool? The third column shows how often the same URL was tried again with another tool at all.

| outcome of the failed call | failed calls | same URL tried again later by another tool | opened by it (% of failed; % of tried again) |
|---|---|---|---|
| refused by the site | 328 | 129 | 107 (32.6%; 82.9%) |
| HTTP 402 | 19 | 10 | 10 (52.6%; 100.0%) |
| refused by the agent's own policy | 19 | 11 | 11 (57.9%; 100.0%) |
| refused by a fetch service | 3 | 1 | 1 (33.3%; 100.0%) |
| login or key needed | 27 | 4 | 4 (14.8%; 100.0%) |
| network or server error | 163 | 42 | 38 (23.3%; 90.5%) |
| redirect not followed | 182 | 8 | 8 (4.4%; 100.0%) |
| other HTTP error | 23 | 4 | 3 (13.0%; 75.0%) |
| not found | 533 | 17 | 12 (2.3%; 70.6%) |

The pairs seen three or more times:

| failed with | then opened by | times |
|---|---|---|
| `WebFetch` | `jina-mcp-server:read_url` | 102 |
| `WebFetch` | `jina-mcp-server:parallel_read_url` | 14 |
| `WebFetch` | `Bash` | 13 |
| `WebFetch` | `scrapling:fetch` | 8 |
| `WebFetch` | `playwright:browser_navigate` | 5 |
| `jina-mcp-server:read_url` | `crawl4ai:crawl_url` | 5 |
| `WebFetch` | `crawl4ai:crawl_url` | 5 |
| `Bash` | `PowerShell` | 3 |
| `WebFetch` | `scrapling:stealthy_fetch` | 3 |
| `jina-mcp-server:read_url` | `WebFetch` | 3 |
| `playwright:browser_navigate` | `crawl4ai:crawl_url` | 3 |

23 more pairs, each seen once or twice, account for the other 30 of the 194 rescues.

By family:

| failed with (family) | then opened by (family) | times |
|---|---|---|
| built-in fetch | remote reader service | 120 |
| built-in fetch | local browser or scraper | 24 |
| built-in fetch | shell HTTP client | 14 |
| remote reader service | local browser or scraper | 10 |
| local browser or scraper | remote reader service | 6 |
| shell HTTP client | shell HTTP client | 5 |
| remote reader service | built-in fetch | 5 |
| local browser or scraper | local browser or scraper | 5 |
| remote reader service | remote reader service | 4 |
| remote reader service | shell HTTP client | 1 |

The usual move is from the built-in fetcher to a remote reader service (120 times). A reader service fetches from its own network with its own client, and may answer from its cache. This is also the order my own instructions to the agents give (the built-in fetch first, then a reader service, then a local scraper or browser), so these chains describe my setup, not a habit every agent has.

## Never opened

113 hosts were tried and never opened by any tool, with 150 failed calls; calls that ended in a tool-side error or with no recorded outcome are not counted. On 48 of them every call asked for a page that did not exist or redirected elsewhere, which says more about the URL than about the site. The table covers the hosts where a site refused or the connection or the server failed: 85 calls on 64 hosts. The first 30:

| host | failed calls | answers (top 2) | tools tried (top 3) |
|---|---|---|---|
| chrome-stats.com | 4 | challenge x4 | jina-mcp-server:read_url x4 |
| forum.utorrent.com | 4 | blocked 403 x4 | webfetch x4 |
| eurasianet.org | 3 | blocked 403 x3 | WebFetch x3 |
| mcpservers.org | 3 | blocked 403 x3 | WebFetch x3 |
| rferl.org | 3 | blocked 403 x3 | WebFetch x3 |
| webcache.allorigins.win | 3 | network x3 | exa:web_fetch_exa x3 |
| api.meetgeek.ai | 2 | server_error 520 x2 | WebFetch x2 |
| dl.acm.org | 2 | blocked 403 x2 | WebFetch x1; webfetch x1 |
| journals.sagepub.com | 2 | challenge x1; blocked 403 x1 | jina-mcp-server:read_url x1; webfetch x1 |
| openjurist.org | 2 | blocked 403 x2 | WebFetch x2 |
| phonearena.com | 2 | blocked 403 x2 | webfetch x2 |
| s.jina.ai | 2 | needs_auth 401 x2 | scrapling:fetch x1; read_url_content x1 |
| service.betterregulation.com | 2 | blocked 403 x2 | WebFetch x2 |
| academia.edu | 1 | blocked 403 x1 | WebFetch x1 |
| admission.princeton.edu | 1 | challenge x1 | playwright:browser_navigate x1 |
| alfdesigngroup.com | 1 | network x1 | WebFetch x1 |
| aspe.hhs.gov | 1 | blocked x1 | jina-mcp-server:read_url x1 |
| azattyqasia.org | 1 | blocked 403 x1 | WebFetch x1 |
| blog.devgenius.io | 1 | blocked 403 x1 | WebFetch x1 |
| blog.modelcontextprotocol.io | 1 | network x1 | WebFetch x1 |
| changelog.assemblyai.com | 1 | network x1 | WebFetch x1 |
| cheatseetseries.owasp.org | 1 | network x1 | webfetch x1 |
| cis.org | 1 | blocked 403 x1 | WebFetch x1 |
| cliniclegal.org | 1 | blocked 403 x1 | WebFetch x1 |
| customhouseintegration.com | 1 | network x1 | playwright:browser_navigate x1 |
| developer.meetgeek.ai | 1 | network x1 | WebFetch x1 |
| developer.windsurf.com | 1 | network x1 | WebFetch x1 |
| developers.zoom.com | 1 | network x1 | webfetch x1 |
| docs.sembly.ai | 1 | network x1 | WebFetch x1 |
| dynamsoft.com | 1 | network x1 | WebFetch x1 |

Most of these hosts were tried once or twice and dropped. A host here is not proof that it blocks agents; it means nothing that ran on this PC got a page from it.

## The other agents

**OpenCode** has a `webfetch` tool that returns one URL as Markdown, text or HTML and checks its permission rules against the requested URL ([docs](https://opencode.ai/docs/tools/)). Its source sends the User-Agent `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OpenCode-User/1.0; +https://opencode.ai` and, after a 403 that carries `cf-mitigated: challenge`, retries as `opencode` (`packages/core/src/tool/plugin/webfetch.ts`; version 2.3.0 installed here contains the same string). The fetch runs on the user's machine. Here: 1,421 `webfetch` calls, 1,292 opened, 21 refused by the site, 79 not found.

**MiMo Code** has its own `webfetch`. Its source sends a desktop Chrome 143 User-Agent, retries as `mimocode` after a Cloudflare challenge, and checks the requested address, and the final address after redirects, against private networks (`XiaomiMiMo/MiMo-Code`, `packages/cli/src/tool/webfetch.ts`). Here: 304 `webfetch` calls, 263 opened, 9 refused by the site, 13 not found. The address guard refused two calls to a machine on my private network; those rows are not in the published data.

**Codex** searches and opens pages through a hosted `web_search` tool. OpenAI documents that local Codex uses cached results from an index OpenAI maintains by default, that `live`, `indexed` and `disabled` modes exist, and that full access makes search live by default ([web search](https://learn.chatgpt.com/docs/web-search)). The local history records 2,392 `open_page` and 462 `find_in_page` calls with no outcome, so Codex appears here mostly through MCP readers (Exa, Jina, Tavily) and `curl`.

**Antigravity** documents a built-in `read_url_content` tool and per-domain permissions `read_url(domain)` ([tools](https://antigravity.google/docs/sdk/tools/), [permissions](https://antigravity.google/docs/permissions)). Neither page says where the fetch runs. A third-party proxy project describes the client calling a Google endpoint named `fetchFromTrawlerCache` ([CLIProxyAPI#6656](https://github.com/router-for-me/CLIProxyAPI/issues/6656)); one conversation here holds a Windows-style resolver error for the fetched host, which suggests that at least that fetch ran on this PC; the two accounts may describe different paths. Here: 391 `read_url_content` calls in August 2026, 310 opened, 16 refused, 53 not found.

**Claude Desktop chat** appears only through its MCP servers (909 calls, mostly Playwright and Jina). The chat's built-in web fetch runs on Anthropic's side and leaves nothing in these logs; I have not checked whether the account export holds it, and it is not in this study.

## What the vendors say about their fetchers

These are the vendors' own statements, quoted or closely paraphrased, with the page they come from.

- **Anthropic.** "Claude-User" is the agent Claude uses to access websites when people ask it questions; Anthropic's page on its bots says its bots respect "do not crawl" signals by "honoring industry standard directives in robots.txt" ([support article 8896518](https://support.claude.com/en/articles/8896518)). Claude Code's WebFetch sends a User-Agent that begins with `Claude-User` and an Accept header that prefers Markdown ([tools reference](https://code.claude.com/docs/en/tools-reference.md)). The web fetch tool of the Claude API, a different product, refuses with `url_not_allowed` for blocked domains, private addresses, robots.txt rules and URLs that appear to contain a credential the user did not supply, and with `url_not_accessible` for HTTP errors ([web fetch tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-fetch-tool.md)).
- **OpenAI.** ChatGPT-User acts on user requests, and OpenAI writes that robots.txt rules may not apply to it; the page lists no user agent for Codex ([bots](https://developers.openai.com/api/docs/bots)). Codex search modes are above.
- **Google (Antigravity), OpenCode, Xiaomi (MiMo Code).** Their documentation and source describe the tools, identities and permissions quoted in the previous section.

## Why robots.txt surveys measure something else

Several studies count how sites declare rules for AI crawlers, and one also probes what sites serve:

- Cloudflare Radar, data of 2025-06-06: of 3,816 top-10,000 domains with a robots.txt, 546 (about 14%) name AI bots; GPTBot is disallowed by 312 (250 fully) and allowed by 61 ([Cloudflare blog](https://blog.cloudflare.com/from-googlebot-to-gptbot-whos-crawling-your-site-in-2025/)).
- Reuters Institute: by the end of 2023, 48% of the most used news sites in ten countries blocked OpenAI's crawlers and 24% Google's; in the USA, 79% blocked OpenAI's ([factsheet](https://reutersinstitute.politics.ox.ac.uk/how-many-news-websites-block-ai-crawlers)).
- "Consent in Crisis" (Data Provenance Initiative, arXiv 2407.14933): about 5% or more of C4's tokens and 28% or more of its most actively maintained, critical sources were fully restricted by robots.txt; 45% of C4 was restricted by terms of service.
- TechnologyChecker, on a Cloudflare Radar snapshot of 2026-09-28 with 4,242 robots.txt files: GPTBot disallowed by 520 and allowed by 326, ClaudeBot 446 and 283, CCBot 430 and 165 ([report](https://technologychecker.io/blog/robots-txt-ai-crawlers-blocking-report)); the report calls its September data provisional and its counts "not a share of the web".
- HasData AI Crawler Block Index (CC BY 4.0; 10,894 domains, waves of 2026-07-10 and 2026-09-16): news sites ban AI crawlers at 50.5% against 7.9% on the open web; from one datacenter address a browser User-Agent got the page from 83.8% of publishers and a GPTBot string from 54.2% ([repository](https://github.com/HasData/ai-crawler-block-index)).
- The [ai.robots.txt](https://github.com/ai-robots-txt/ai.robots.txt) project is a list rather than a survey: on 2026-11-16 its `robots.json` had 208 entries, one of them a policy entry rather than an agent.

These numbers describe declarations aimed mostly at training and search crawlers, or probes of home pages with chosen User-Agents from datacenters. This study counts what happened when agents fetched specific deep URLs on a user's request, with tools started on one PC (some of them fetch from their own servers). A share of sites that disallow GPTBot cannot tell whether a coding agent got a given page, and a 403 in this data cannot by itself tell anything about the site's robots.txt. The two kinds of numbers should not be put side by side as if they measured the same thing.

## Two other measurements

Two preprints from 2026 look at the same kind of traffic from other sides. Zhang fetched 10,307 URLs with a static client and a rendered browser and labelled what each 200 response contained: by the automatic labels, 20.9% of the pages that the static client received with status 200 did not contain the page's main content (app shells, bot challenges, block pages, error and placeholder pages, partial content), and 13.1% of the sites that answered a request for a random, non-existent path returned 200 ([arXiv:2611.00884](https://arxiv.org/abs/2611.00884)). Borysenko recorded the HTTP signatures of nine coding agents, Claude Code, OpenCode and Antigravity among them, and of six assistant services on the server of a live documentation site ([arXiv:2604.02544](https://arxiv.org/abs/2604.02544); short version in AgenticDev '26, [doi:10.1145/3843282.3844445](https://doi.org/10.1145/3843282.3844445)). The first shows how much an "opened" outcome can overstate what an agent actually got, the second what a site sees of these agents; the data here records only what each agent's tool reported.

## Limitations

- **One person, one PC, one home connection in the US.** The sites are the ones my work needed: AI tools, developer documentation, US government and legal pages, app stores. Rates here are observations about this sample, not rates for the web.
- **The agents chose the URLs, and my instructions chose the order of tools.** A tool that is tried first on every URL collects the ones the model wrote itself; a tool tried second gets URLs that are more likely to exist. Open rates between tools are not a ranking, and the fallback chains reflect my setup.
- **What a site saw is not recorded:** no User-Agent, address or TLS fingerprint per call, so the data cannot say why a site refused.
- **Classification is heuristic.** It reads statuses first and text second; 893 tool-side errors and 87 unclear or other HTTP errors are set apart, and some rows are surely misclassified. The seven Jina 402s of 2026-07-27 more likely came from the reader service's side than from the sites; the record does not say.
- **Missing surfaces:** the Claude Desktop chat's built-in fetch, claude.ai, Cowork and cloud sessions; the outcome of Codex's hosted search; Antigravity outside August 2026.
- **Provenance is checked for Claude Code only**, and only against the transcript (see above).
- **Site types are a rule set on host names**, and 1,312 hosts are "other"; pmc.ncbi.nlm.nih.gov, for example, counts as government by its domain.
- **"Opened" means the tool returned content.** WebFetch returns a model's summary and caches pages for 15 minutes, a reader service may answer from its cache, and a page that answers 200 with a login form or an error text counts as opened. Pages behind my own sign-in count as opened too.
- **Calls are not independent.** Failures cluster by host, day and session (34 refusals of uscis.gov on ten days), so the percentages describe this history, not independent trials.
- **No control fetch was made.** Fetching each refused URL once more with a plain client would separate a site's policy from the client's identity; this study did not do that, and its informal re-tests are not part of the data.
- **The filter removed 2,461 rows** (my own sites, private network, malformed URLs) and reduced 1,307 URLs to their host. Removed rows are not in any table.
- **Vendors change their tools.** Claude Code went from 2.1.170 to 2.1.325 during this period; the answer for a given host may differ between versions.

## Data, code and how to repeat this

The repository [github.com/igorsaevets/agent-fetch-outcomes](https://github.com/igorsaevets/agent-fetch-outcomes) holds:

- `data/attempts.csv`: one row per call and URL, 19,611 rows, with date, agent, surface, tool, tool family, host, site type, URL, outcome, HTTP status, a cleaned error text, whether the URL was in the conversation, and which tool opened it later. Session and project names are replaced by keys.
- `data/sites_by_category.csv`: per host and outcome group, with failed calls, days, first and last date, the answers, the tools that failed and the tools that opened the host.
- `data/summary.json`: the aggregates behind the tables and the counts in the text (Claude Code version numbers and the informal re-tests come from the transcripts and are not in it).
- in `scanners/`, the scanners `fetch_failures.py` (Claude Code transcripts and Claude Desktop logs) and `other_clis_t265.py` (OpenCode, Codex, Antigravity, MiMo Code), standard-library Python with self-tests. The exporter that built the public files is not published, because its configuration names my private hosts; its rules are described in the dataset's README.

To run them on your own machine:

```
cd scanners
python fetch_failures.py --selftest
python fetch_failures.py --until 2026-11-16T07:30:00Z --out report
python other_clis_t265.py --selftest
python other_clis_t265.py --until 2026-11-16T07:30:00Z --out report-other
```

They read the history files of the agents installed for the current user and never send anything over the network. Read their output before you publish it: your history holds your URLs too. MiMo Code keeps its database where it was installed, so the second scanner reads it only when given `--mimo-db <path>`.

## License and citation

Data and text: CC BY 4.0. Code: MIT. Please cite as: Igor Saevets, "What AI coding agents could not open: 19,611 page fetches by six agents on one PC", page2ai.net, 2026, https://page2ai.net/research/agent-fetch-outcomes/. Data and scanners: https://github.com/igorsaevets/agent-fetch-outcomes.
