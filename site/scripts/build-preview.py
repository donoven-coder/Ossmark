#!/usr/bin/env python3
"""Build a single-file preview of the site for hosting as a claude.ai Artifact.

Runs the normal Vite build, then inlines the CSS, JS, fonts and logo SVGs into one
HTML file (the Artifact host only serves inline assets) and turns on preview mode,
which links out to Calendly instead of embedding it and keeps form submissions local.

Usage:  python3 scripts/build-preview.py [output.html]
"""
import base64
import pathlib
import re
import subprocess
import sys

root = pathlib.Path(__file__).resolve().parent.parent
out = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else root / "preview.html"

subprocess.run(["npm", "run", "build"], cwd=root, check=True, stdout=subprocess.DEVNULL)
dist = root / "dist"
html = (dist / "index.html").read_text()

MIME = {".woff2": "font/woff2", ".svg": "image/svg+xml"}

def data_uri(rel: str) -> str:
    path = dist / rel.lstrip("/")
    return f"data:{MIME[path.suffix]};base64,{base64.b64encode(path.read_bytes()).decode()}"

css_href = re.search(r'<link rel="stylesheet"[^>]*href="([^"]+)"', html).group(1)
js_src = re.search(r'<script type="module"[^>]*src="([^"]+)"', html).group(1)
css = (dist / css_href.lstrip("/")).read_text()
js = (dist / js_src.lstrip("/")).read_text()

# Fonts and logo masks referenced from CSS become data URIs.
css = re.sub(r'url\("?(/assets/[^")]+)"?\)', lambda m: f'url("{data_uri(m.group(1))}")', css)
title = "<title>Ossmark Media</title>"  # short name for the Artifact gallery and tab
meta = re.search(r'<meta name="description"[^>]*>', html).group(0)

js = js.replace("</script", "<\\/script")
page = f"""{title}
{meta}
<style>{css}</style>
<script>window.OSSMARK_PREVIEW = true; document.documentElement.classList.add("js", "is-preview");</script>
<div id="root"></div>
<script type="module">{js}</script>
"""
out.write_text(page)
print(f"wrote {out} ({len(page) / 1024:.0f} KB)")
