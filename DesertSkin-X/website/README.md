# DesertSkin-X — browser edition

A self-contained HTML/CSS/JavaScript dashboard for GitHub Pages. No Python
server, package installation, build step, CDN, API key or remote font is required
at runtime. The original Streamlit demo remains available in the parent project.

## Open locally

Open `dist/index.html` in a modern browser. Keep the files in `dist` together.
The snapshot is loaded through a local script asset, so opening the extracted
site directly also works without a web server or network connection.

## Publish with GitHub Pages

1. Create or choose a GitHub repository.
2. Upload the **contents of `dist`**, including `index.html`, to its root.
   Upload the extracted files, not the ZIP itself. Keep the `.nojekyll` file.
3. Open the repository's **Settings → Pages**.
4. Choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then Save.
5. Open the deployment URL GitHub supplies after publishing finishes.

If using an existing Python repository, copy these website files into a `docs`
folder and choose `/docs` as the publishing folder instead. Do not replace the
Python files. All asset URLs are relative, so repository subpaths are supported.

Only the static website assets need publication. The original workbook and
Python project are not required on the website. The synthetic snapshot embedded
in `data.js` is readable by website visitors.

## Interaction

- Drag the 3D membrane or focus it and press the arrow keys; Home resets rotation.
- Separate/join the two layers and select illustrative humidity. This geometry
  is conceptual and does not predict material response or alter the data.
- Hover a chart reading, focus it with the keyboard, or tap it to inspect details.
  Press Escape to dismiss the tooltip. The same readings appear in the table.
- Select a deployment to update metrics, charts, readings and alerts. Reset returns
  to the complete dataset. C05 Storage has 21 readings, 16.39% average savings,
  4.30 L modeled water saved and five critical events.
- Inspect T0005 in Alerts: 38.59 °C exceeds the 38 °C threshold despite risk zero.
- Compare S0–S6 at matched RH. S7 is a separate open-aperture reference.
- Motion is reduced when the operating system requests reduced motion. WebGL
  failure falls back to a conceptual two-layer study; the dashboard still works.

## Refresh and verify

From the parent project, using its installed Python environment:

```text
.venv/bin/python website/scripts/export_data.py
node website/scripts/verify.mjs
```

On Windows, use `.venv\Scripts\python.exe` for the Python command. The exporter
uses the existing validated workbook loader and preserves source precision and
the supplied timestamps without assigning a timezone. Refreshing the snapshot
is an authoring operation, never a visitor upload or formula evaluation.

## Verification boundary

Calculation checks reconcile all-data and filtered results, every severity,
threshold equality, material arithmetic, empty states, local asset references
and dataset provenance. JavaScript syntax is checked separately. Browser visual
and interaction rehearsal was blocked by an unavailable preview relay in the
creation environment. WebGL rendering, actual mobile layout and browser keyboard
interaction therefore still need a browser rehearsal before judging.

GetLayers MCP was requested but was not exposed to this conversation. The design
is an original implementation and does not claim to use GetLayers references.
No GitHub repository was uploaded or published by this task.
