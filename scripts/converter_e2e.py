"""End-to-end check of the online converter page (src/content/docs/convert.mdx) in Chromium.

Usage:
  python scripts/converter_e2e.py <page-url> [corpus-dir ...]
  e.g. python scripts/converter_e2e.py http://localhost:4329/page2ai-docs/convert/ ../page2ai-benchmark/corpus

Each check prints PASS/FAIL; the last line is VERDICT: OK (n/n) or VERDICT: FAIL (n/m).
Parity: every corpus file goes through the page (upload) and through scripts/core_convert.mjs (Node, the
same @page2ai/core/html), with the same page address; the Markdown must match except captured_at.
Every request that leaves the page's origin is aborted and recorded, so a hostile file that made the
browser fetch anything would show up here.
"""
import json
import pathlib
import re
import subprocess
import sys
import tempfile

from playwright.sync_api import sync_playwright

PAGE = sys.argv[1]
CORPUS_DIRS = [pathlib.Path(d) for d in sys.argv[2:]]
REPO = pathlib.Path(__file__).resolve().parent.parent
BASE = "https://example.com/docs/page"
ORIGIN = re.match(r"^https?://[^/]+", PAGE).group(0)
results: list[tuple[str, bool]] = []


def check(name: str, ok: bool, detail: str = "") -> None:
    results.append((name, bool(ok)))
    print(("PASS " if ok else "FAIL ") + name + (f" - {detail}" if detail else ""), flush=True)


def mask(md: str) -> str:
    return re.sub(r"^captured_at: .*$", "captured_at: <masked>", md, count=1, flags=re.M)


tmp = pathlib.Path(tempfile.mkdtemp(prefix="p2a-conv-e2e-"))
files = sorted({p.resolve() for d in CORPUS_DIRS for p in d.rglob("*") if p.suffix.lower() in (".html", ".htm")})[:40]

HOSTILE = tmp / "hostile.html"
HOSTILE.write_text(
    """<!doctype html><html><head><title>Hostile</title>
<link rel="stylesheet" href="https://evil.example.net/s.css">
<style>@import url(https://evil.example.net/i.css); body{background:url(https://evil.example.net/bg.png)}</style>
<meta http-equiv="refresh" content="0;url=https://evil.example.net/refresh">
<script>window.top.__pwned = 1; fetch('https://evil.example.net/fetch'); alert('script ran');</script>
</head><body><main><h1>Hostile page</h1>
<p>Text with <img src="https://evil.example.net/img.png" onerror="window.top.__pwned=2" alt="pic"> an image.</p>
<p><a href="javascript:window.top.__pwned=3">js link</a> and <a href="https://example.org/ok">ok link</a></p>
<p>&lt;img src=x onerror="window.top.__pwned=4"&gt; written as text</p>
<iframe src="https://evil.example.net/frame"></iframe><object data="https://evil.example.net/obj"></object>
<video src="https://evil.example.net/v.mp4" autoplay></video><svg><script>window.top.__pwned=5</script></svg>
<p><img src="https://img.example.net/photo.png" alt="photo"></p>
</main></body></html>""",
    encoding="utf-8",
)
CP1251 = tmp / "cp1251.html"
CP1251.write_bytes(
    '<html><head><meta charset="windows-1251"><title>Тест</title></head><body><main><h1>Привет, мир</h1>'
    "<p>Кириллица в windows-1251.</p></main></body></html>".encode("cp1251")
)
SAVED = tmp / "saved.html"
SAVED.write_text(
    "<!-- saved from url=(0034)https://example.org/guide/start.html -->\n<html><head><title>Saved</title></head>"
    '<body><main><h1>Saved page</h1><p>See <a href="next.html">the next page</a>.</p></main></body></html>',
    encoding="utf-8",
)
EMPTY = tmp / "empty.html"
EMPTY.write_text('<html><head><title>App</title></head><body><div id="root"></div><script src="app.js"></script></body></html>', encoding="utf-8")
BIG = tmp / "big.html"
BIG.write_text("<p>" + "a" * (11 * 1024 * 1024) + "</p>", encoding="utf-8")

# Node arm: the same package from this repo's node_modules.
jobs = [{"file": str(f), "baseUrl": BASE} for f in files]
jobs_file, node_out = tmp / "jobs.json", tmp / "node.json"
jobs_file.write_text(json.dumps(jobs), encoding="utf-8")
subprocess.run(["node", str(REPO / "scripts" / "core_convert.mjs"), str(jobs_file), str(node_out)], check=True, cwd=REPO)
node_md = json.loads(node_out.read_text(encoding="utf-8"))

with sync_playwright() as p:
    try:
        browser = p.chromium.launch(args=["--lang=en-US"])
    except Exception:  # Playwright's own Chromium is not installed: use the installed Google Chrome
        browser = p.chromium.launch(channel="chrome", args=["--lang=en-US"])
    ctx = browser.new_context(locale="en-US", accept_downloads=True)
    foreign: list[str] = []
    seen: list[str] = []

    def route(r):
        u = r.request.url
        if u.startswith(ORIGIN) or u.startswith(("data:", "blob:")):
            r.continue_()
        else:
            foreign.append(u)
            r.abort()

    ctx.route("**/*", route)
    ctx.on("request", lambda r: seen.append(r.url))
    page = ctx.new_page()
    dialogs: list[str] = []
    page.on("dialog", lambda d: (dialogs.append(d.message), d.dismiss()))
    page.goto(PAGE, wait_until="networkidle")
    page.wait_for_timeout(3000)  # the idle warm-up loads the worker and the Markdown renderer
    check("page loaded nothing from another origin", not foreign, ", ".join(foreign[:3]))
    # Control: the conversion runs in a dedicated worker, so a request made INSIDE a worker must reach the route
    # and the request log, or every "no request" check below is blind to the place the engine runs.
    n0 = len(seen)
    page.evaluate(
        """() => new Promise((done) => {
          const src = "fetch('https://evil.example.net/worker-probe').catch(() => 0).finally(() => postMessage(1));";
          const w = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
          w.onmessage = () => { w.terminate(); done(); };
          setTimeout(done, 5000);
        })"""
    )
    check("control: a fetch made inside a worker is caught by the route and the log",
          any("worker-probe" in u for u in foreign) and any("worker-probe" in u for u in seen[n0:]), ", ".join(foreign[:3]))
    foreign.clear()
    loaded = page.evaluate("performance.getEntriesByType('resource').map(e => e.name)")
    check("the engine worker was preloaded", any("convert.worker" in u for u in loaded))
    page.click("#p2a-opts summary")

    def convert_file(path: pathlib.Path, base: str | None = BASE) -> tuple[str, str]:
        page.fill("#p2a-base", base or "")
        page.evaluate("document.querySelector('#p2a-status').textContent = ''")
        page.set_input_files("#p2a-file", str(path))
        page.wait_for_function(
            "(() => { const s = document.querySelector('#p2a-status'); return s.textContent.startsWith('Converted') || s.dataset.kind === 'error'; })()",
            timeout=120_000,
        )
        return page.text_content("#p2a-status") or "", page.input_value("#p2a-md")

    n_before = len(seen)
    same = 0
    diffs = []
    for f in files:
        status, md = convert_file(f)
        if status.startswith("Converted") and mask(md) == mask(node_md[str(f)]):
            same += 1
        else:
            diffs.append(f.name)
    check(f"parity with Node on {len(files)} saved pages", files and same == len(files), f"{same}/{len(files)} identical; differ: {diffs[:5]}")
    check("converting sent no request at all", len(seen) == n_before, f"{len(seen) - n_before} new: {seen[n_before:n_before + 3]}")
    loaded = page.evaluate("performance.getEntriesByType('resource').map(e => e.name)")
    fallback = [u for u in loaded if re.search(r"/_astro/convert\.(?!worker)[\w-]+\.js$", u)]
    check("the main-thread fallback chunk never loaded (the worker did the work)", not fallback, ", ".join(fallback))

    # Paste
    page.click("#p2a-tab-paste")
    sample = files[0] if files else SAVED
    page.fill("#p2a-html", sample.read_text(encoding="utf-8", errors="replace"))
    page.evaluate("document.querySelector('#p2a-status').textContent = ''")
    page.click("#p2a-convert-paste")
    page.wait_for_function("document.querySelector('#p2a-status').textContent.startsWith('Converted')", timeout=120_000)
    if files:
        check("paste gives the same Markdown as upload", mask(page.input_value("#p2a-md")) == mask(node_md[str(sample)]))
    page.click("#p2a-tab-upload")

    # Hostile file
    foreign.clear()
    status, md = convert_file(HOSTILE)
    check("hostile file converted", status.startswith("Converted"), status)
    check("hostile file: no request left the page", not foreign, ", ".join(foreign[:4]))
    check("hostile file: no script ran, no dialog", page.evaluate("window.__pwned === undefined") and not dialogs, f"dialogs={dialogs}")
    check("hostile file: no javascript: link in the Markdown", "javascript:" not in md.lower())
    page.click("#p2a-tab-preview")
    page.wait_for_function("document.querySelector('#p2a-frame').srcdoc.length > 0", timeout=30_000)
    page.wait_for_timeout(800)
    frame_el = page.query_selector("#p2a-frame")
    check("preview frame is sandboxed without scripts or same-origin", frame_el.get_attribute("sandbox") == "allow-popups allow-popups-to-escape-sandbox")
    frame = frame_el.content_frame()
    inner = frame.evaluate("({scripts: document.querySelectorAll('script').length, handlers: document.querySelectorAll('[onerror],[onload],[onclick]').length, imgs: document.images.length})")
    check("preview holds no script element and no event handler", inner["scripts"] == 0 and inner["handlers"] == 0, json.dumps(inner))
    check("preview with images off fetched nothing", not foreign and page.evaluate("window.__pwned === undefined"), ", ".join(foreign[:4]))
    page.check("#p2a-loadimg")
    page.wait_for_timeout(1500)
    check("control: images on does fetch the image (so 'off' was a real block)", any("img.example.net" in u for u in foreign), ", ".join(foreign[:4]))
    page.uncheck("#p2a-loadimg")
    page.click("#p2a-tab-md")
    foreign.clear()

    # Charset, page address found in the file, empty body, size cap
    status, md = convert_file(CP1251)
    check("windows-1251 file decoded by its meta charset", "Привет, мир" in md and 'title: "Тест"' in md, ascii(md[:60]))
    status, md = convert_file(SAVED, None)
    note = page.text_content("#p2a-base-note") or ""
    check("page address taken from Chrome's 'saved from url' comment", "https://example.org/guide/next.html" in md and "found in the file" in note, note)
    status, md = convert_file(EMPTY)
    check("empty body shows the extension note", page.is_visible("#p2a-empty"), status)
    page.evaluate("document.querySelector('#p2a-status').textContent = ''")
    page.set_input_files("#p2a-file", str(BIG))
    page.wait_for_function("document.querySelector('#p2a-status').dataset.kind === 'error'", timeout=30_000)
    check("an 11 MB file is refused before conversion", "limit is 10 MB" in (page.text_content("#p2a-status") or ""))

    # Download
    convert_file(SAVED, None)
    with page.expect_download() as dl:
        page.click("#p2a-download")
    d = dl.value
    body = pathlib.Path(d.path()).read_text(encoding="utf-8")
    check("download is named after the page title (<title>Saved</title>)", d.suggested_filename == "saved.md", d.suggested_filename)
    check("download holds exactly the Markdown shown", body == page.input_value("#p2a-md"))

    status, md = convert_file(CP1251, None)
    check("no page address: no 'source: \"about:blank\"' line in the frontmatter", md.startswith("---\n") and "about:blank" not in md, ascii(md[:80]))

    # From a link
    page.click("#p2a-tab-url")
    page.fill("#p2a-url", "https://example.org/article")
    check("'Open the page' points at the link", page.get_attribute("#p2a-url-open", "href") == "https://example.org/article")
    page.click("#p2a-url-base")
    check("'Use as page address' fills the address and returns to upload",
          page.input_value("#p2a-base") == "https://example.org/article" and page.get_attribute("#p2a-tab-upload", "aria-selected") == "true")
    check("no request left the page during the checks after the hostile file", not foreign, ", ".join(foreign[:4]))
    browser.close()

passed = sum(ok for _, ok in results)
print(f"VERDICT: {'OK' if passed == len(results) else 'FAIL'} ({passed}/{len(results)})")
sys.exit(0 if passed == len(results) else 1)
