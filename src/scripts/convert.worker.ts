// The converter's engine, off the page's main thread: @page2ai/core's htmlToMarkdown, the function the
// Page2AI MCP server runs on every page it fetches. The HTML arrives by postMessage from the converter page
// and the Markdown goes back the same way. Nothing here touches the network: '@page2ai/core/html' imports
// linkedom (a parser that loads nothing) and the renderer, and core's tests pin that import graph.
import { htmlToMarkdown, type HtmlToMarkdownOptions } from '@page2ai/core/html';

interface Job {
  id: number;
  html: string;
  opts: HtmlToMarkdownOptions;
}

self.addEventListener('message', (event: MessageEvent<Job>) => {
  const { id, html, opts } = event.data;
  const t0 = performance.now();
  try {
    const result = htmlToMarkdown(html, opts);
    self.postMessage({ id, ok: true, result, ms: performance.now() - t0 });
  } catch (err) {
    self.postMessage({ id, ok: false, error: err instanceof Error ? err.message : String(err) });
  }
});
