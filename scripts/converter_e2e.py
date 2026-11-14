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
import time

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
<p>Autolink text &lt;javascript:window.top.__pwned=6&gt; and &lt;data:text/html,x&gt; here.</p>
<p>Markdown in text: [click me](javascript:window.top.__pwned=7) and ![pic](javascript:x)</p>
<p><a href="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%2F%3E">svg data link</a>
<a href="blob:https://evil.example.net/1">blob link</a> <a href="file:///C:/x">file link</a></p>
</main></body></html>""",
    encoding="utf-8",
)
SINGLEFILE = tmp / "singlefile.html"
SINGLEFILE.write_text(
    "<!DOCTYPE html> <html><!--\n Page saved with SingleFile \n url: https://example.org/sf/page.html \n"
    " saved date: Thu Nov 13 2026 \n--><head><title>SF</title></head><body><main><h1>SingleFile page</h1>"
    '<p>See <a href="next.html">the next page</a>.</p></main></body></html>',
    encoding="utf-8",
)
FALSEURL = tmp / "falseurl.html"
FALSEURL.write_text(
    "<html><head><!-- template note: url: https://wrong.example/ --><title>F</title></head><body><main><h1>F</h1>"
    '<p>See <a href="next.html">the next page</a>.</p></main></body></html>',
    encoding="utf-8",
)
# Defined before LONG, which falls back to it when no corpus directory is given (T242: it was defined after, so the
# documented call without one died with a NameError).
SAVED = tmp / "saved.html"
SAVED.write_text(
    "<!-- saved from url=(0034)https://example.org/guide/start.html -->\n<html><head><title>Saved</title></head>"
    '<body><main><h1>Saved page</h1><p>See <a href="next.html">the next page</a>.</p></main></body></html>',
    encoding="utf-8",
)
BODY_RE = re.compile(r"<body[^>]*>([\s\S]*)</body>", re.I)
LONG = tmp / "long.html"  # ~6 MB of real page bodies: a conversion that lasts long enough to race a second one
_bodies = [f"<section>{m.group(1)}</section>" for f in (files or [SAVED])
           if (m := BODY_RE.search(f.read_text(encoding="utf-8", errors="replace")))]
_parts, _size, _i = [], 0, 0
while _bodies and _size < 6 * 1024 * 1024 and _i < 10_000:
    _b = _bodies[_i % len(_bodies)]
    _i += 1
    if _size + len(_b.encode("utf-8")) <= 8 * 1024 * 1024:
        _parts.append(_b)
        _size += len(_b.encode("utf-8"))
LONG.write_text("<html><head><title>Long page</title></head><body>" + "".join(_parts) + "</body></html>", encoding="utf-8")
ROWS = tmp / "rows90k.html"  # P2A-031: 90,000 short rows, ~4.95 MB, ~180,000 Markdown lines; core <= 0.4.5 failed it whole
ROWS.write_text("<html><head><title>dense</title></head><body><main>"
                + "<div><p>Row <b>bold</b> <a href='/x'>link</a></p></div>" * 90_000 + "</main></body></html>", encoding="utf-8")
COMMENTS = tmp / "comments32.html"  # core <= 0.4.6: each leading comment of a page without <html> doubled the time
COMMENTS.write_text("<!DOCTYPE html>" + "<!-- c -->" * 32 + "<title>Comments</title><p>Hello after comments</p>", encoding="utf-8")
BANGS = tmp / "bangs.html"  # P2A-035, core <= 0.4.7: one element's inline children cost the square of its text
BANGS.write_text("<html><head><title>Bangs</title></head><body><main><p>"
                 + ("!<a href='/x'>" + "x" * 300 + "</a>") * 5_000 + "</p></main></body></html>", encoding="utf-8")
PRES = tmp / "pres.html"  # P2A-037, core <= 0.4.8: every <pre> counted the <pre> under three of its ancestors
PRES.write_text("<html><head><title>Pres</title></head><body><main><div>"
                + "<pre>code-line</pre>" * 8_000 + "</div></main></body></html>", encoding="utf-8")
FIVE_MB = tmp / "five.html"
FIVE_MB.write_text("<p>" + "b" * (5 * 1024 * 1024) + "</p>", encoding="utf-8")
FAKE_CRASH_WORKER = (
    "self.postMessage({ ready: true });\n"
    "self.addEventListener('message', () => { setTimeout(() => { throw new Error('simulated crash'); }); });\n"
)
CP1251 = tmp / "cp1251.html"
CP1251.write_bytes(
    '<html><head><meta charset="windows-1251"><title>Тест</title></head><body><main><h1>Привет, мир</h1>'
    "<p>Кириллица в windows-1251.</p></main></body></html>".encode("cp1251")
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
    clicked: list[dict] = []
    OK_LINK = "https://example.org/ok"

    def route(r):
        u = r.request.url
        if u.startswith(ORIGIN) or u.startswith(("data:", "blob:")):
            r.continue_()
        elif u == OK_LINK and r.request.is_navigation_request():
            # The preview's link, clicked: served here, with a script that only runs if the new tab is NOT sandboxed.
            clicked.append({"referer": r.request.headers.get("referer")})
            r.fulfill(status=200, content_type="text/html", body="<title>t</title><script>document.title='scripted'</script>")
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
    check("the engine worker started and said ready", page.get_attribute("#p2a-conv", "data-engine-ready") == "1")
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
    check("the worker did the work (the page reports data-engine=worker)", page.get_attribute("#p2a-conv", "data-engine") == "worker")

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
    check("hostile file: core dropped the <a href=\"javascript:\"> link", "__pwned=3" not in md)
    check("hostile file: page text that looks like links stays in the Markdown (core keeps text)", "__pwned=6" in md and "__pwned=7" in md)
    page.click("#p2a-tab-preview")
    page.wait_for_function("document.querySelector('#p2a-frame').srcdoc.length > 0", timeout=30_000)
    page.wait_for_timeout(800)
    frame_el = page.query_selector("#p2a-frame")
    check("preview frame is sandboxed without scripts or same-origin", frame_el.get_attribute("sandbox") == "allow-popups allow-popups-to-escape-sandbox")
    srcdoc = frame_el.get_attribute("srcdoc") or ""
    csp = re.search(r'http-equiv="Content-Security-Policy" content="([^"]+)"', srcdoc)
    csp_v = csp.group(1) if csp else ""
    check("preview CSP: default-src 'none', base-uri 'none', form-action 'none', no remote images while unticked",
          all(x in csp_v for x in ("default-src 'none'", "base-uri 'none'", "form-action 'none'", "img-src data:;")) and "https:" not in csp_v, csp_v)
    check("preview sends no Referer (meta referrer no-referrer)", '<meta name="referrer" content="no-referrer">' in srcdoc)
    frame = frame_el.content_frame()
    inner = frame.evaluate("""() => ({
      scripts: document.querySelectorAll('script').length,
      handlers: document.querySelectorAll('[onerror],[onload],[onclick]').length,
      headings: [...document.querySelectorAll('h1,h2')].map(h => h.textContent),
      badLinks: [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')).filter(h => !/^(https?:|mailto:)/i.test(h)),
      badImgs: [...document.images].map(i => i.getAttribute('src')).filter(s => !/^(https?:|data:image\\/)/i.test(s)),
      text: document.body.textContent,
    })""")
    check("preview holds no script element and no event handler", inner["scripts"] == 0 and inner["handlers"] == 0,
          json.dumps({k: inner[k] for k in ("scripts", "handlers")}))
    check("preview shows the converted page (its <h1>Hostile page</h1>)", "Hostile page" in inner["headings"], json.dumps(inner["headings"][:3]))
    check("preview: only http(s)/mailto links (text like <javascript:…> or [x](javascript:…) is shown, not linked)",
          not inner["badLinks"] and "javascript:window.top.__pwned=6" in inner["text"], json.dumps(inner["badLinks"][:4]))
    check("preview: no image with a javascript: or other non-http source", not inner["badImgs"], json.dumps(inner["badImgs"][:3]))
    check("preview: raw HTML in the Markdown is escaped to text (the html renderer override)",
          '<img src=x onerror="window.top.__pwned=4">' in inner["text"], "")
    check("preview with images off fetched nothing", not foreign and page.evaluate("window.__pwned === undefined"), ", ".join(foreign[:4]))
    # A link clicked in the preview opens a normal, unsandboxed tab (allow-popups-to-escape-sandbox + <base target>)
    # and tells that site nothing about where the visitor came from.
    with ctx.expect_page(timeout=15_000) as pop_info:
        frame.click(f'a[href="{OK_LINK}"]')
    pop = pop_info.value
    pop.wait_for_load_state()
    check("a preview link opens in a new, unsandboxed tab without a Referer",
          pop.title() == "scripted" and clicked and not clicked[0]["referer"], f"title={pop.title()!r} {clicked}")
    pop.close()
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
    status, md = convert_file(SINGLEFILE, None)
    note = page.text_content("#p2a-base-note") or ""
    check("page address taken from SingleFile's header comment", "https://example.org/sf/next.html" in md and "found in the file" in note, note)
    status, md = convert_file(FALSEURL, None)
    note = page.text_content("#p2a-base-note") or ""
    check("a comment that is not SingleFile's header is not taken as the page address",
          "wrong.example" not in md and note.startswith("No page address"), note)
    status, md = convert_file(EMPTY)
    check("empty body shows the extension note", page.is_visible("#p2a-empty"), status)
    page.evaluate("document.querySelector('#p2a-status').textContent = ''")
    page.set_input_files("#p2a-file", str(BIG))
    page.wait_for_function("document.querySelector('#p2a-status').dataset.kind === 'error'", timeout=30_000)
    check("an 11 MB file is refused before conversion", "limit is 10 MB" in (page.text_content("#p2a-status") or ""))
    check("a computer gets the 10 MB limit (the hint says so)",
          page.evaluate("document.querySelector('#p2a-limit')?.textContent || ''") == "10 MB")

    # One conversion at a time: Ctrl+Enter in the paste box while a long file converts does not start a second job.
    page.fill("#p2a-base", BASE)
    page.evaluate("document.querySelector('#p2a-status').textContent = ''")
    page.set_input_files("#p2a-file", str(LONG))
    page.wait_for_function("document.querySelector('#p2a-status').textContent.startsWith('Converting')", timeout=30_000)
    during = page.evaluate("""() => {
      const t = document.querySelector('#p2a-html');
      t.value = '<html><head><title>Second</title></head><body><p>second</p></body></html>';
      t.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true }));
      return document.querySelector('#p2a-status').textContent;
    }""")
    page.wait_for_function("document.querySelector('#p2a-status').textContent.startsWith('Converted')", timeout=120_000)
    final = page.text_content("#p2a-status") or ""
    check("a second conversion while one runs is not started, and the first one's result is shown",
          during.startswith("Still converting") and "Long page" in final and "Second" not in final, f"during={during[:50]!r} final={final[:50]!r}")

    # P2A-031: a page that renders to ~120,000+ lines came back as «Page2AI extraction failed» (core <= 0.4.5).
    page.evaluate("document.querySelector('#p2a-status').textContent = ''")
    page.set_input_files("#p2a-file", str(ROWS))
    page.wait_for_function("document.querySelector('#p2a-status').textContent.startsWith('Converted')", timeout=120_000)
    final = page.text_content("#p2a-status") or ""
    rows = page.evaluate(r"""() => document.querySelector('#p2a-md').value.split('\n')
      .filter((l) => l === 'Row **bold** [link](https://example.com/x)').length""")
    check("P2A-031: a 90,000-row page (4.95 MB, ~180,000 lines) converts whole",
          "“dense”" in final and rows == 90_000, f"status={final[:60]!r} rows={rows}")

    # core 0.4.7 (T241): a page without <html> whose first 32 nodes are comments took about a minute (doubling per comment).
    page.evaluate("document.querySelector('#p2a-status').textContent = ''")
    t0 = time.monotonic()
    page.set_input_files("#p2a-file", str(COMMENTS))
    try:  # core 0.4.6 on the live site (T241 control): still converting after 300 s
        page.wait_for_function("document.querySelector('#p2a-status').textContent.startsWith('Converted')", timeout=60_000)
    except Exception:
        pass
    took = time.monotonic() - t0
    final = page.text_content("#p2a-status") or ""
    md = page.evaluate("document.querySelector('#p2a-md').value")
    check("0.4.7: a page opening with 32 comments converts in seconds, not minutes",
          "“Comments”" in final and "Hello after comments" in md and took < 10, f"took={took:.1f}s status={final[:50]!r}")
    if not final.startswith("Converted"):
        print("VERDICT: FAIL (the converter is still busy with the comments page; later checks not run)")
        sys.exit(1)

    # P2A-035 (core 0.4.8, T242): 5,000 links in one paragraph, each after a "!" the renderer escapes; core 0.4.7 re-read
    # the whole paragraph's text once per link (about 25 s in Node).
    page.evaluate("document.querySelector('#p2a-status').textContent = ''")
    t0 = time.monotonic()
    page.set_input_files("#p2a-file", str(BANGS))
    try:
        page.wait_for_function("document.querySelector('#p2a-status').textContent.startsWith('Converted')", timeout=120_000)
    except Exception:
        pass
    took = time.monotonic() - t0
    final = page.text_content("#p2a-status") or ""
    escaped = page.evaluate(r"""() => document.querySelector('#p2a-md').value
      .split('\\![' + 'x'.repeat(300) + '](https://example.com/x)').length - 1""")
    check("0.4.8: 5,000 links each after a '!' convert in seconds (P2A-035)",
          "“Bangs”" in final and escaped == 5_000 and took < 10, f"took={took:.1f}s escaped={escaped} status={final[:50]!r}")
    if not final.startswith("Converted"):
        print("VERDICT: FAIL (the converter is still busy with the P2A-035 page; later checks not run)")
        sys.exit(1)

    # P2A-037 (core 0.4.9, T243): 8,000 sibling code blocks (96 KB); core 0.4.8 searched the container for the other
    # <pre> once per <pre> (about 20 s in Node).
    page.evaluate("document.querySelector('#p2a-status').textContent = ''")
    t0 = time.monotonic()
    page.set_input_files("#p2a-file", str(PRES))
    try:
        page.wait_for_function("document.querySelector('#p2a-status').textContent.startsWith('Converted')", timeout=120_000)
    except Exception:
        pass
    took = time.monotonic() - t0
    final = page.text_content("#p2a-status") or ""
    blocks = page.evaluate(r"""() => document.querySelector('#p2a-md').value
      .split('\n').filter((l) => l === 'code-line').length""")
    check("0.4.9: 8,000 sibling code blocks convert in seconds (P2A-037)",
          "“Pres”" in final and blocks == 8_000 and took < 10, f"took={took:.1f}s blocks={blocks} status={final[:50]!r}")
    if not final.startswith("Converted"):
        print("VERDICT: FAIL (the converter is still busy with the P2A-037 page; later checks not run)")
        sys.exit(1)

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

    def fresh_page(worker_route=None, init_script: str | None = None):
        c = browser.new_context(locale="en-US")
        c.route("**/*", lambda r: r.continue_() if r.request.url.startswith(ORIGIN) else r.abort())
        if worker_route:
            c.route("**/convert.worker*.js", worker_route)
        if init_script:
            c.add_init_script(init_script)
        pg = c.new_page()
        pg.goto(PAGE, wait_until="networkidle")
        pg.wait_for_timeout(3000)
        return c, pg

    def convert_on(pg, path: pathlib.Path) -> str:
        pg.evaluate("document.querySelector('#p2a-status').textContent = ''")
        pg.set_input_files("#p2a-file", str(path))
        pg.wait_for_function(
            "(() => { const s = document.querySelector('#p2a-status'); return s.textContent.startsWith('Converted') || s.dataset.kind === 'error'; })()",
            timeout=60_000)
        return pg.text_content("#p2a-status") or ""

    # A worker that dies while converting (after it said ready): the file is NOT replayed on the page's own thread.
    c2, pg2 = fresh_page(lambda r: r.fulfill(status=200, content_type="text/javascript", body=FAKE_CRASH_WORKER))
    st = convert_on(pg2, SAVED)
    check("a worker crash on a file is reported and not retried on the page thread",
          "stopped on this file" in st and pg2.get_attribute("#p2a-conv", "data-engine") == "worker"
          and not pg2.get_attribute("#p2a-conv", "aria-busy"), st[:80])
    c2.close()
    # A browser that cannot start the worker (here: the worker file is missing) converts on the page thread.
    c3, pg3 = fresh_page(lambda r: r.fulfill(status=404, body="not found"))
    st = convert_on(pg3, SAVED)
    check("no worker: the same function converts on the page thread",
          st.startswith("Converted") and pg3.get_attribute("#p2a-conv", "data-engine") == "main", st[:80])
    c3.close()
    # A device that reports 2 GB of RAM or less (or a phone / tablet) gets a 4 MB limit.
    c4, pg4 = fresh_page(init_script="Object.defineProperty(Navigator.prototype, 'deviceMemory', { get: () => 1, configurable: true });")
    hint = pg4.evaluate("document.querySelector('#p2a-limit')?.textContent || ''")
    st = convert_on(pg4, FIVE_MB)
    check("a small device gets the 4 MB limit and refuses a 5 MB file", hint == "4 MB" and "limit is 4 MB" in st, f"hint={hint!r} {st[:60]!r}")
    c4.close()
    browser.close()

passed = sum(ok for _, ok in results)
print(f"VERDICT: {'OK' if passed == len(results) else 'FAIL'} ({passed}/{len(results)})")
sys.exit(0 if passed == len(results) else 1)
