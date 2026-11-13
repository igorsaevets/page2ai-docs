// Online converter (BL-62): paste or upload HTML, get Markdown. Everything happens in this tab: the file
// is read with the File API, converted in a Web Worker by '@page2ai/core/html' (the MCP server's own
// htmlToMarkdown), and shown as text, or rendered in a sandboxed frame that runs no script and loads no
// image unless asked. No request carries the file or its text.
import type { ConversionResult, HtmlToMarkdownOptions } from '@page2ai/core/html';

// Converting takes memory: in Chrome 18-36 MB per MB of HTML for real saved pages and ~58 MB for a dense synthetic
// one (T239, measured on the live page), and an out-of-memory in the worker closes the whole tab, not just the
// worker. A computer gets the MCP server's 10 MB; a touch-only device (phone, tablet) or one that reports 2 GB of
// RAM or less gets 4 MB, which still takes every page of our 38-page corpus (the largest saved page is 3 MB).
const MB = 1024 * 1024;
const smallDevice = (): boolean => {
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return (typeof mem === 'number' && mem <= 2) || !matchMedia('(any-pointer: fine)').matches;
};
const MAX_BYTES = (smallDevice() ? 4 : 10) * MB;
const LIMIT_TEXT = `${MAX_BYTES / MB} MB`;
const MAIN_THREAD_MAX_BYTES = 2 * MB; // this thread cannot be stopped: a long run would freeze the tab
const TIMEOUT_MS = 60_000;
const NO_BODY = '<!-- AI: page has no extractable body content -->';

type Outcome = { ok: true; result: ConversionResult; ms: number } | { ok: false; error: string };
type Engine = 'worker' | 'main';

const $ = <T extends HTMLElement = HTMLElement>(id: string): T => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`converter: #${id} is missing`);
  return el as T;
};

// ---- engine: a module worker, or this thread if the browser cannot start one ----------------------
// The worker posts {ready} once its module has loaded. An error before that means this browser cannot run it,
// so the same function runs on this thread (small files only). An error after it means the worker died on a
// file: that file is NOT replayed on this thread, where it would freeze or crash the tab; the next file gets a
// fresh worker. A timeout ends the worker and every job it held.
let worker: Worker | null = null;
let workerReady = false;
let mainThread = typeof Worker === 'undefined';
let seq = 0;
const pending = new Map<number, (o: Outcome) => void>();

const failAll = (error: string): void => {
  const waiting = [...pending.values()];
  pending.clear();
  for (const done of waiting) done({ ok: false, error });
};

const stopWorker = (error: string): void => {
  worker?.terminate();
  worker = null;
  workerReady = false;
  failAll(error);
};

const startWorker = (): Worker => {
  const w = new Worker(new URL('./convert.worker.ts', import.meta.url), { type: 'module' });
  w.addEventListener('message', (e: MessageEvent<({ id: number } & Outcome) | { ready: true }>) => {
    if (w !== worker) return;
    if ('ready' in e.data) {
      workerReady = true;
      document.getElementById('p2a-conv')?.setAttribute('data-engine-ready', '1');
      return;
    }
    const done = pending.get(e.data.id);
    if (done) {
      pending.delete(e.data.id);
      done(e.data);
    }
  });
  w.addEventListener('error', () => {
    if (w !== worker) return;
    const started = workerReady;
    if (!started) mainThread = true; // it never started here: the same function runs on this thread
    stopWorker(started ? 'worker-crashed' : 'worker-failed');
  });
  return w;
};

const convertHere = async (html: string, opts: HtmlToMarkdownOptions): Promise<Outcome> => {
  try {
    const { htmlToMarkdown } = await import('@page2ai/core/html');
    const t0 = performance.now();
    return { ok: true, result: htmlToMarkdown(html, opts), ms: performance.now() - t0 };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
};

const convertInWorker = (html: string, opts: HtmlToMarkdownOptions): Promise<Outcome> =>
  new Promise((resolve) => {
    try {
      worker ??= startWorker();
    } catch {
      mainThread = true;
      resolve({ ok: false, error: 'worker-failed' });
      return;
    }
    const id = ++seq;
    const timer = setTimeout(() => {
      if (pending.has(id)) stopWorker('timeout');
    }, TIMEOUT_MS);
    pending.set(id, (o) => {
      clearTimeout(timer);
      resolve(o);
    });
    worker.postMessage({ id, html, opts });
  });

const convert = async (html: string, opts: HtmlToMarkdownOptions, inBytes: number): Promise<{ out: Outcome; engine: Engine }> => {
  if (!mainThread) {
    const out = await convertInWorker(html, opts);
    if (out.ok || out.error !== 'worker-failed') return { out, engine: 'worker' };
  }
  if (inBytes > MAIN_THREAD_MAX_BYTES) return { out: { ok: false, error: 'main-too-big' }, engine: 'main' };
  return { out: await convertHere(html, opts), engine: 'main' };
};

// ---- reading a file: BOM, then <meta charset>, then UTF-8 ------------------------------------------
const sniffCharset = (b: Uint8Array): string => {
  if (b[0] === 0xef && b[1] === 0xbb && b[2] === 0xbf) return 'utf-8';
  if (b[0] === 0xff && b[1] === 0xfe) return 'utf-16le';
  if (b[0] === 0xfe && b[1] === 0xff) return 'utf-16be';
  const head = new TextDecoder('windows-1252').decode(b.subarray(0, 4096));
  const m = head.match(/<meta[^>]+charset\s*=\s*["']?\s*([\w:.-]+)/i);
  return m ? m[1]!.toLowerCase() : 'utf-8';
};

export const decodeHtml = (buf: ArrayBuffer): { text: string; charset: string } => {
  const bytes = new Uint8Array(buf);
  const charset = sniffCharset(bytes);
  try {
    return { text: new TextDecoder(charset).decode(bytes), charset };
  } catch {
    return { text: new TextDecoder('utf-8').decode(bytes), charset: 'utf-8' };
  }
};

// The page's own address, when the file names it: Chrome's «Save page as» comment, SingleFile's header,
// a canonical link or og:url. Relative links are resolved against it.
const SOURCE_PATTERNS = [
  /<!--\s*saved from url=\(\d+\)(https?:\/\/[^\s>]+?)\s*-->/i,
  // SingleFile's header comment only: any other comment with «url: https://…» in it is not the page's address.
  /<!--[^>]{0,200}?\bSingleFile\b[\s\S]{0,400}?\burl:\s*(https?:\/\/[^\s>]+)/i,
  /<link\b[^>]*\brel=["']?canonical["']?[^>]*\bhref=["']?(https?:\/\/[^"'\s>]+)/i,
  /<link\b[^>]*\bhref=["']?(https?:\/\/[^"'\s>]+)["']?[^>]*\brel=["']?canonical\b/i,
  /<meta\b[^>]*\bproperty=["']?og:url["']?[^>]*\bcontent=["']?(https?:\/\/[^"'\s>]+)/i,
];

export const detectSource = (html: string): string | null => {
  const head = html.slice(0, 300_000);
  for (const re of SOURCE_PATTERNS) {
    const m = head.match(re);
    if (!m) continue;
    try {
      return new URL(m[1]!.replace(/&amp;/g, '&')).href;
    } catch {
      /* not a URL: try the next source */
    }
  }
  return null;
};

const httpUrl = (s: string): string | null => {
  try {
    const u = new URL(s.trim());
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null;
  } catch {
    return null;
  }
};

// ---- small helpers -------------------------------------------------------------------------------
const fmtSize = (n: number): string =>
  n < 1024 ? `${n} B` : n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 / 1024).toFixed(2)} MB`;

const fileSlug = (t: string): string =>
  t.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 80);

const esc = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const stripFrontmatter = (md: string): string => md.replace(/^---\n[\s\S]*?\n---\n+/, '');

// Only absolute http(s) and mailto links stay links in the preview, and only http(s) and data:image images load;
// anything else (javascript:, data:, blob:, file:, or a relative path, which would resolve against this site)
// shows as its text. Core drops javascript: hrefs, but page TEXT such as «<javascript:…>» or «[x](javascript:…)»
// reaches the Markdown as written, and Markdown makes it a link.
const LINK_SCHEMES = new Set(['http:', 'https:', 'mailto:']);
const safeUrl = (href: string, image: boolean): string | null => {
  try {
    const u = new URL(href); // throws on a relative href
    const ok = image
      ? u.protocol === 'http:' || u.protocol === 'https:' || /^data:image\//i.test(u.href)
      : LINK_SCHEMES.has(u.protocol);
    return ok ? u.href : null;
  } catch {
    return null;
  }
};

// ---- UI ------------------------------------------------------------------------------------------
let lastMd = '';
let lastTitle = '';
let lastFm = true; // whether lastMd starts with core's frontmatter
let previewStale = true;
let running = false;
let renderer: { parse(md: string): string } | null = null;

const setStatus = (text: string, kind: 'info' | 'error' = 'info'): void => {
  const el = $('p2a-status');
  el.textContent = text;
  el.dataset.kind = kind;
};

const setBusy = (busy: boolean): void => {
  for (const id of ['p2a-convert-paste', 'p2a-file']) ($(id) as HTMLButtonElement | HTMLInputElement).disabled = busy;
  $('p2a-conv').toggleAttribute('aria-busy', busy);
};

const currentOptions = (detected: string | null): HtmlToMarkdownOptions => {
  const typed = httpUrl(($('p2a-base') as HTMLInputElement).value);
  const baseUrl = typed ?? detected ?? undefined;
  return {
    ...(baseUrl ? { baseUrl } : {}),
    includeFrontmatter: ($('p2a-fm') as HTMLInputElement).checked,
    includeImages: ($('p2a-img') as HTMLInputElement).checked,
  };
};

const selectTab = (list: HTMLElement, tab: HTMLElement): void => {
  for (const t of list.querySelectorAll<HTMLElement>('[role="tab"]')) {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    const panel = document.getElementById(t.getAttribute('aria-controls') ?? '');
    if (panel) panel.hidden = !on;
  }
  if (tab.id === 'p2a-tab-preview' && previewStale) void renderPreview();
};

const wireTabs = (list: HTMLElement): void => {
  const tabs = [...list.querySelectorAll<HTMLElement>('[role="tab"]')];
  for (const t of tabs) {
    t.addEventListener('click', () => selectTab(list, t));
    t.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(t);
      const next = e.key === 'ArrowRight' ? tabs[(i + 1) % tabs.length] : e.key === 'ArrowLeft' ? tabs[(i - 1 + tabs.length) % tabs.length] : null;
      if (next) {
        e.preventDefault();
        next.focus();
        selectTab(list, next);
      }
    });
  }
};

const previewDoc = (bodyHtml: string, images: boolean): string =>
  '<!doctype html><html><head><meta charset="utf-8">' +
  // default-src 'none': the frame fetches nothing (images only once ticked), and the sandbox attribute already
  // stops every script and form; base-uri and form-action are not covered by default-src, so they are named.
  // no-referrer: an image host or a clicked link's site is not told the visitor came from this converter.
  `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:${images ? ' https: http:' : ''}; base-uri 'none'; form-action 'none'">` +
  '<meta name="referrer" content="no-referrer"><base target="_blank"><style>' +
  'body{font:15px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif;margin:0;padding:16px 20px;color:#17181c;background:#fff;overflow-wrap:anywhere}' +
  'img{max-width:100%;height:auto}pre{overflow:auto;background:#f3f4f6;padding:10px;border-radius:6px}code{font-family:ui-monospace,Consolas,monospace;font-size:.9em}' +
  'table{border-collapse:collapse;display:block;overflow:auto}td,th{border:1px solid #d0d4da;padding:4px 8px}blockquote{margin:0;padding-left:12px;border-left:3px solid #d0d4da;color:#4b5563}' +
  'a{color:#4f46e5}@media (prefers-color-scheme:dark){body{color:#e6e7ea;background:#17181c}pre{background:#24262c}td,th{border-color:#3a3d45}blockquote{border-color:#3a3d45;color:#a7abb5}a{color:#a5b4fc}}' +
  `</style></head><body>${bodyHtml}</body></html>`;

const renderPreview = async (): Promise<void> => {
  if (!lastMd) return;
  try {
    if (!renderer) {
      const { Marked } = await import('marked');
      renderer = new Marked({
        gfm: true,
        async: false,
        renderer: {
          // Raw HTML inside the Markdown is shown as text, never as markup.
          html: ({ text }) => esc(text),
          link(token) {
            const inner = this.parser.parseInline(token.tokens);
            const href = safeUrl(token.href, false);
            if (!href) return inner;
            const title = token.title ? ` title="${esc(token.title)}"` : '';
            return `<a href="${esc(href)}"${title} rel="noopener noreferrer">${inner}</a>`;
          },
          image(token) {
            const src = safeUrl(token.href, true);
            if (!src) return esc(token.text);
            const title = token.title ? ` title="${esc(token.title)}"` : '';
            return `<img src="${esc(src)}" alt="${esc(token.text)}"${title}>`;
          },
        },
      }) as unknown as { parse(md: string): string };
    }
    const images = ($('p2a-loadimg') as HTMLInputElement).checked;
    const body = renderer.parse(lastFm ? stripFrontmatter(lastMd) : lastMd);
    ($('p2a-frame') as HTMLIFrameElement).srcdoc = previewDoc(body, images);
    previewStale = false;
  } catch {
    setStatus('The preview could not load. Reload the page and try again; the Markdown tab still has the result.', 'error');
  }
};

const show = (r: ConversionResult, ms: number, inBytes: number, opts: HtmlToMarkdownOptions, detected: string | null): void => {
  // Without a page address core writes `source: "about:blank"` (its default base). The MCP server always has a
  // URL; here that line would only be noise in the downloaded file, so it is dropped. Nothing else changes.
  const base = opts.baseUrl;
  const fm = opts.includeFrontmatter !== false;
  const md = base || !fm ? r.markdown : r.markdown.replace(/^source: "about:blank"\n/m, '');
  lastMd = md;
  lastTitle = r.title;
  lastFm = fm;
  previewStale = true;
  $('p2a-out').hidden = false;
  ($('p2a-md') as HTMLTextAreaElement).value = md;
  const outBytes = new TextEncoder().encode(md).length;
  const ratio = inBytes ? Math.max(1, Math.round((outBytes / inBytes) * 100)) : 0;
  $('p2a-stats').textContent =
    `${md.length.toLocaleString('en-US')} characters · ≈${Math.round(md.length / 4).toLocaleString('en-US')} tokens` +
    ` · ${fmtSize(inBytes)} of HTML → ${fmtSize(outBytes)} of Markdown (${ratio}%) · ${(ms / 1000).toFixed(2)} s`;
  $('p2a-base-note').textContent = base
    ? `Links resolved against ${base}${detected && base === detected ? ' (the address found in the file).' : '.'}`
    : 'No page address: relative links stay relative. You can add one under Options.';
  const empty = r.markdown.includes(NO_BODY);
  $('p2a-empty').hidden = !empty;
  const previewTab = $('p2a-tab-preview');
  if (previewTab.getAttribute('aria-selected') === 'true') void renderPreview();
  setStatus(empty ? 'Converted, but the file holds no readable body text.' : `Converted “${r.title || 'untitled page'}”.`);
};

const FAILURES: Record<string, string> = {
  timeout:
    'The conversion took longer than 60 seconds and was stopped. A very large page can do that; the extension converts it in your tab.',
  'worker-crashed':
    'The converter stopped on this file, most likely out of memory, and it was not retried. A smaller file may work; the Chrome extension converts the page in your own tab.',
  'main-too-big': `This browser cannot run the converter in the background, so it converts files up to ${MAIN_THREAD_MAX_BYTES / MB} MB here. A current Chrome, Edge, Firefox or Safari converts up to ${LIMIT_TEXT}.`,
};

const run = async (html: string, label: string): Promise<void> => {
  if (running) {
    setStatus(`Still converting; ${label} was not started. Try again when this one is done.`);
    return;
  }
  const inBytes = new TextEncoder().encode(html).length;
  if (!html.trim()) {
    setStatus('Nothing to convert: paste the HTML first.', 'error');
    return;
  }
  if (inBytes > MAX_BYTES) {
    setStatus(`${label} is ${fmtSize(inBytes)}; the limit is ${LIMIT_TEXT} on this device.`, 'error');
    return;
  }
  const detected = detectSource(html);
  const opts = currentOptions(detected);
  running = true;
  setBusy(true);
  setStatus(`Converting ${label} (${fmtSize(inBytes)})…`);
  let res: { out: Outcome; engine: Engine };
  try {
    res = await convert(html, opts, inBytes);
  } catch (err) {
    res = { out: { ok: false, error: err instanceof Error ? err.message : String(err) }, engine: mainThread ? 'main' : 'worker' };
  } finally {
    running = false;
    setBusy(false);
  }
  $('p2a-conv').dataset.engine = res.engine;
  const { out } = res;
  if (!out.ok) {
    setStatus(FAILURES[out.error] ?? `The conversion failed: ${out.error}`, 'error');
    return;
  }
  show(out.result, out.ms, inBytes, opts, detected);
};

const onFile = async (file: File): Promise<void> => {
  if (file.size > MAX_BYTES) {
    setStatus(`${file.name} is ${fmtSize(file.size)}; the limit is ${LIMIT_TEXT} on this device.`, 'error');
    return;
  }
  const { text } = decodeHtml(await file.arrayBuffer());
  await run(text, file.name);
};

const init = (): void => {
  const root = document.getElementById('p2a-conv');
  if (!root || root.dataset.ready) return;
  root.dataset.ready = '1';
  root.dataset.limit = String(MAX_BYTES);
  // A fresh copy of the page (a client-side navigation back to it) starts with no result of an earlier visit.
  lastMd = '';
  lastTitle = '';
  previewStale = true;
  $('p2a-limit').textContent = LIMIT_TEXT;
  for (const list of root.querySelectorAll<HTMLElement>('[role="tablist"]')) wireTabs(list);

  const file = $('p2a-file') as HTMLInputElement;
  file.addEventListener('change', () => {
    const f = file.files?.[0];
    if (f) void onFile(f);
    file.value = '';
  });
  const drop = $('p2a-drop');
  drop.addEventListener('dragover', (e) => {
    e.preventDefault();
    drop.dataset.over = '1';
  });
  drop.addEventListener('dragleave', () => delete drop.dataset.over);
  drop.addEventListener('drop', (e) => {
    e.preventDefault();
    delete drop.dataset.over;
    const f = e.dataTransfer?.files?.[0];
    if (f) void onFile(f);
  });

  const area = $('p2a-html') as HTMLTextAreaElement;
  $('p2a-convert-paste').addEventListener('click', () => void run(area.value, 'the pasted HTML'));
  area.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) void run(area.value, 'the pasted HTML');
  });

  const urlIn = $('p2a-url') as HTMLInputElement;
  const open = $('p2a-url-open') as HTMLAnchorElement;
  const syncUrl = (): void => {
    const u = httpUrl(urlIn.value);
    open.toggleAttribute('aria-disabled', !u);
    if (u) open.href = u;
    else open.removeAttribute('href');
  };
  urlIn.addEventListener('input', syncUrl);
  $('p2a-url-base').addEventListener('click', () => {
    const u = httpUrl(urlIn.value);
    if (!u) return;
    ($('p2a-base') as HTMLInputElement).value = u;
    ($('p2a-opts') as HTMLDetailsElement).open = true;
    selectTab($('p2a-in-tabs'), $('p2a-tab-upload'));
    setStatus(`Page address set to ${u}. Now upload the page saved from it.`);
  });
  syncUrl();

  ($('p2a-loadimg') as HTMLInputElement).addEventListener('change', () => void renderPreview());
  $('p2a-copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(lastMd);
      setStatus('Markdown copied to the clipboard.');
    } catch {
      ($('p2a-md') as HTMLTextAreaElement).select();
      setStatus('Select-all done: press Ctrl+C (Cmd+C) to copy.');
    }
  });
  $('p2a-download').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([lastMd], { type: 'text/markdown;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `${fileSlug(lastTitle) || 'page'}.md` });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  });
};

// The engine (~400 KB) and the Markdown renderer load once the page is idle, so a conversion itself
// makes no request at all: once the page has loaded, the Network panel stays empty while a file converts.
const warmUp = (): void => {
  if (!mainThread) {
    try {
      worker ??= startWorker();
    } catch {
      mainThread = true;
    }
  }
  void import('marked').catch(() => undefined);
};

init();
document.addEventListener('astro:page-load', init);
if ('requestIdleCallback' in window) requestIdleCallback(warmUp, { timeout: 2000 });
else setTimeout(warmUp, 1000);
