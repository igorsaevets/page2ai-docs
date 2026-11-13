// Online converter (BL-62): paste or upload HTML, get Markdown. Everything happens in this tab: the file
// is read with the File API, converted in a Web Worker by '@page2ai/core/html' (the MCP server's own
// htmlToMarkdown), and shown as text, or rendered in a sandboxed frame that runs no script and loads no
// image unless asked. The conversion sends no request anywhere.
import type { ConversionResult, HtmlToMarkdownOptions } from '@page2ai/core/html';

const MAX_BYTES = 10 * 1024 * 1024; // the MCP server's response cap
const TIMEOUT_MS = 60_000;
const NO_BODY = '<!-- AI: page has no extractable body content -->';

type Outcome = { ok: true; result: ConversionResult; ms: number } | { ok: false; error: string };

const $ = <T extends HTMLElement = HTMLElement>(id: string): T => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`converter: #${id} is missing`);
  return el as T;
};

// ---- engine: a module worker, or this thread if the browser cannot start one ----------------------
let worker: Worker | null = null;
let mainThread = typeof Worker === 'undefined';
let seq = 0;
const pending = new Map<number, (o: Outcome) => void>();

const failAll = (error: string): void => {
  for (const done of pending.values()) done({ ok: false, error });
  pending.clear();
};

const startWorker = (): Worker => {
  const w = new Worker(new URL('./convert.worker.ts', import.meta.url), { type: 'module' });
  w.addEventListener('message', (e: MessageEvent<{ id: number } & Outcome>) => {
    const done = pending.get(e.data.id);
    if (done) {
      pending.delete(e.data.id);
      done(e.data);
    }
  });
  w.addEventListener('error', () => {
    w.terminate();
    if (worker === w) worker = null;
    failAll('worker-failed');
  });
  return w;
};

const convertHere = async (html: string, opts: HtmlToMarkdownOptions): Promise<Outcome> => {
  const { htmlToMarkdown } = await import('@page2ai/core/html');
  const t0 = performance.now();
  try {
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
      resolve({ ok: false, error: 'worker-failed' });
      return;
    }
    const id = ++seq;
    const timer = setTimeout(() => {
      if (!pending.has(id)) return;
      pending.delete(id);
      worker?.terminate();
      worker = null;
      resolve({ ok: false, error: 'timeout' });
    }, TIMEOUT_MS);
    pending.set(id, (o) => {
      clearTimeout(timer);
      resolve(o);
    });
    worker.postMessage({ id, html, opts });
  });

const convert = async (html: string, opts: HtmlToMarkdownOptions): Promise<Outcome> => {
  if (!mainThread) {
    const out = await convertInWorker(html, opts);
    if (out.ok || out.error !== 'worker-failed') return out;
    mainThread = true; // the worker never started: same function, this thread
  }
  return convertHere(html, opts);
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
  /<!--[\s\S]{0,400}?\burl:\s*(https?:\/\/[^\s>]+)/i,
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

// ---- UI ------------------------------------------------------------------------------------------
let lastMd = '';
let lastTitle = '';
let previewStale = true;
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
  // default-src 'none': the frame fetches nothing, and the sandbox attribute already stops every script.
  `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:${images ? ' https: http:' : ''}">` +
  '<base target="_blank"><style>' +
  'body{font:15px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif;margin:0;padding:16px 20px;color:#17181c;background:#fff;overflow-wrap:anywhere}' +
  'img{max-width:100%;height:auto}pre{overflow:auto;background:#f3f4f6;padding:10px;border-radius:6px}code{font-family:ui-monospace,Consolas,monospace;font-size:.9em}' +
  'table{border-collapse:collapse;display:block;overflow:auto}td,th{border:1px solid #d0d4da;padding:4px 8px}blockquote{margin:0;padding-left:12px;border-left:3px solid #d0d4da;color:#4b5563}' +
  'a{color:#4f46e5}@media (prefers-color-scheme:dark){body{color:#e6e7ea;background:#17181c}pre{background:#24262c}td,th{border-color:#3a3d45}blockquote{border-color:#3a3d45;color:#a7abb5}a{color:#a5b4fc}}' +
  `</style></head><body>${bodyHtml}</body></html>`;

const renderPreview = async (): Promise<void> => {
  if (!lastMd) return;
  if (!renderer) {
    const { Marked } = await import('marked');
    // Raw HTML inside the Markdown is shown as text, never as markup.
    renderer = new Marked({ gfm: true, async: false, renderer: { html: ({ text }) => esc(text) } }) as unknown as {
      parse(md: string): string;
    };
  }
  const images = ($('p2a-loadimg') as HTMLInputElement).checked;
  ($('p2a-frame') as HTMLIFrameElement).srcdoc = previewDoc(renderer.parse(stripFrontmatter(lastMd)), images);
  previewStale = false;
};

const show = (r: ConversionResult, ms: number, inBytes: number, base: string | undefined, detected: string | null): void => {
  // Without a page address core writes `source: "about:blank"` (its default base). The MCP server always has a
  // URL; here that line would only be noise in the downloaded file, so it is dropped. Nothing else changes.
  const md = base || !r.markdown.startsWith('---\n') ? r.markdown : r.markdown.replace(/^source: "about:blank"\n/m, '');
  lastMd = md;
  lastTitle = r.title;
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

const run = async (html: string, label: string): Promise<void> => {
  const inBytes = new TextEncoder().encode(html).length;
  if (!html.trim()) {
    setStatus('Nothing to convert: paste the HTML first.', 'error');
    return;
  }
  if (inBytes > MAX_BYTES) {
    setStatus(`${label} is ${fmtSize(inBytes)}; the limit is 10 MB.`, 'error');
    return;
  }
  const detected = detectSource(html);
  const opts = currentOptions(detected);
  setBusy(true);
  setStatus(`Converting ${label} (${fmtSize(inBytes)})…`);
  const out = await convert(html, opts);
  setBusy(false);
  if (!out.ok) {
    setStatus(
      out.error === 'timeout'
        ? 'The conversion took longer than 60 seconds and was stopped. A very large page can do that; the extension converts it in your tab.'
        : `The conversion failed: ${out.error}`,
      'error',
    );
    return;
  }
  show(out.result, out.ms, inBytes, opts.baseUrl, detected);
};

const onFile = async (file: File): Promise<void> => {
  if (file.size > MAX_BYTES) {
    setStatus(`${file.name} is ${fmtSize(file.size)}; the limit is 10 MB.`, 'error');
    return;
  }
  const { text } = decodeHtml(await file.arrayBuffer());
  await run(text, file.name);
};

const init = (): void => {
  const root = document.getElementById('p2a-conv');
  if (!root || root.dataset.ready) return;
  root.dataset.ready = '1';
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
// makes no request at all: the Network panel stays empty while a file converts.
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
