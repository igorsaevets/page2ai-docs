---
title: 'Case study: 12 tools on one docs page'
description: We fetched the Claude Code plugin manifest reference with 12 web-to-Markdown tools and scored each output against the site's own Markdown. Measured 2026-11-13. By Igor Saevets.
head:
  - tag: script
    attrs:
      type: application/ld+json
    content: |
      {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": "Case study: 12 web-to-Markdown tools on one docs page",
        "datePublished": "2026-11-13",
        "author": { "@type": "Person", "name": "Igor Saevets", "url": "https://igorsaevets.github.io/page2ai-docs/about/" }
      }
---

An agent that reads a web page gets whatever its fetch tool returns. On 2026-11-13 we sent one page through 12 tools and measured what came back. We checked how much of the page's text arrived, how much else arrived with it, and whether headings, code blocks and tables survived as Markdown.

**Disclosure:** Page2AI is our project. The page, the calls and the scoring were the same for every tool.

## The page and the answer key

- **The page:** the Claude Code [plugin manifest reference](https://code.claude.com/docs/en/plugins-reference), a long reference page on a Mintlify site with 36 headings, 13 code blocks and 113 table rows. Coding agents read pages like this one.
- **The answer key:** the site publishes a Markdown version of each page (append `.md` to the URL). It is the author's own text, so we scored every output against it. Page2AI does not read it: it converts the page itself. The key was used only for scoring.
- **The calls:** each tool was called the way an agent calls it: the URL, Markdown output where the tool offers a choice, defaults for everything else. Calls went through each tool's MCP server from Claude Code, except where the table says "Python library".

Five numbers per output:

- **Text:** the share of the key's words that appear in the output.
- **Extra:** the share of the output's words that are not in the key, such as navigation, page furniture and embedded data.
- **Headings:** the share of the key's headings that appear as Markdown headings.
- **Code:** the share of the key's code blocks found inside code fences.
- **Tables:** the share of the key's table rows found as Markdown table rows.

## Tools that converted the page

| Tool | How it was called | Characters | Text | Extra | Headings | Code | Tables |
|---|---|---:|---:|---:|---:|---:|---:|
| **Page2AI** (MCP 0.10.1) | `page_to_markdown`, whole page ¹ | 50,114 | 98.9% | 1.9% | 100% | 100% | 100% |
| Firecrawl | `firecrawl_scrape`, `formats: ["markdown"]` | 288,158 | 99.6% | 81.5% | 97% | 100% | 100% |
| Tavily | `tavily_extract`, `format: "markdown"` | 276,871 | 99.6% | 81.9% | 100% | 100% | 100% |
| Jina Reader | `read_url` | 267,415 | 99.6% | 81.7% | 3% | 100% | 100% |
| Nimble | `nimble_extract`, `output_format: "markdown"` | 55,250 | 99.0% | 5.3% | 3% | 100% | 100% |
| scrapling 0.4.12 | Python library, defaults | 277,773 | 99.6% | 81.7% | 100% | 100% | 100% |
| scrapling 0.4.12 | MCP `get`, defaults | 26,551 | 63.6% | 2.5% | 100% | 0% | 0% |
| crawl4ai 0.9.2 | Python library, defaults | 280,890 | 99.6% | 81.7% | 3% | 100% | 100% |
| crawl4ai | MCP `crawl_url`, defaults ² | 20,000 | 30.7% | 4.4% | 3% | 15% | 0% |
| crawl4ai | MCP `crawl_url`, `clean: true` ² | 20,000 | 43.6% | 0.3% | 44% | 46% | 0% |
| trafilatura 2.2.0 | Python library, tables and formatting on | 22,762 | 58.4% | 1.6% | 97% | 0% | 0% |

¹ A local Page2AI server returns a long page in parts. The first call brings 30,000 characters and a list of sections to ask for next, and `max_length` raises the limit. The hosted endpoint returns the whole page at once. The local server (core 0.4.4) and the hosted one (core 0.4.3) returned the same text.

² The crawl4ai MCP server we use caps a result at 20,000 characters unless the caller raises `content_limit`.

## Tools that received the site's own Markdown

| Tool | Characters | Text | Extra | What came back |
|---|---:|---:|---:|---|
| Parallel `web_fetch`, `full_content: true` | 43,205 | 99.9% | 1.4% | the site's Markdown |
| MCP reference fetch server (2026.11.11) | 42,654 | 100% | 0% | the site's Markdown; a first call returns 5,000 characters |
| Exa `web_fetch_exa` | 38,117 | 99.1% | 0.1% | text with the Markdown source's syntax |
| Claude Code WebFetch | not scored | | | a model's answer about a `text/markdown` response |

The Markdown source has syntax that a converted page does not have:

- GitHub-style `[!NOTE]` callouts;
- code fences tagged `theme={null}`;
- links that end in `.md`.

Parallel and the fetch server returned all three, and Exa returned the callouts. The site serves this Markdown to such requests, so for these tools the site did the conversion. WebFetch passes the page to a model and returns the model's answer, so it has no raw output to score.

## What the numbers say

- **Extra text costs as much as missing text.** Five of the converters delivered nearly the whole page, and then six to seven times its length in total. About 80% of each of those outputs is one line of the site's embedded configuration (`{"docsConfig":{"theme":"mint",…`, 225,000 to 241,000 characters), and navigation adds more. An agent pays for every character it reads.
- **Headings are where converters differ.** Jina, Nimble and the crawl4ai library wrote the page's headings as plain lines, so the agent loses the outline.
- **Defaults decide what an agent gets.** Through their MCP servers, crawl4ai returned the first 20,000 characters of the page, and scrapling returned a short main-content extract without code blocks or tables. The same libraries called directly returned everything.
- **Three tools got the author's Markdown.** Their outputs match the key because they are the key. Page2AI converts the page itself, so it works the same way on sites that publish no Markdown copy.

## Page2AI's own gaps on this page

- Code blocks come without a language tag: a bare code fence instead of one tagged `json`. The site marks the language in an attribute that Page2AI does not read yet.
- Each heading keeps the site's invisible anchor link, for example `## [​](…#next-steps) Next steps`. Tavily's output has the same.
- The 1.9% of extra text is the page's "On this page" list, "Was this page helpful?" and the links to the previous and next pages.

Both defects are logged as open issues.

## Limits of this test

- **One page, one day.** Hosted services change their extraction without notice, so rerun before you rely on a number.
- **Default settings.** Most of these tools can be tuned with CSS selectors, content filters or higher limits. We measured what a plain call returns.
- **What the scores miss.** The key is the author's Markdown, not a judgment of what an agent needs. Word overlap does not check reading order or link targets.
- **A case study, not a benchmark.** For a multi-site benchmark, see [page2ai-benchmark](https://github.com/igorsaevets/page2ai-benchmark).

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
