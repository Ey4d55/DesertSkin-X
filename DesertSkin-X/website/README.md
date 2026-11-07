# DesertSkin-X / Field lab — build 02

The browser interface has been rebuilt around an interactive 3D concept site,
following the owner's supplied reference video: an orbitable planted diorama,
component labels, a compact inspector and operational data controls.

## Run or publish

Open `dist/index.html` directly in a modern browser, or serve the `dist` folder.
Scripts and styles use content-hashed filenames so corrected builds do not reuse
stale browser assets. All runtime scripts are bundled locally. No CDN, account, API key or Python
server is required. Keep the files together.

For GitHub Pages, use the existing repository deployment. All URLs are relative
and work under a repository subpath. Upload the contents of `dist` to the chosen
Pages publishing directory if deploying elsewhere.

## 3D behavior

The original procedural scene includes a membrane-covered greenhouse, planted
beds, a service building with solar panels, a collection tank, a pond and a powered
monitoring point. It uses Three.js 0.187.0, bundled into `site.js` with its MIT
license. No model or texture is loaded from another website.

- Drag or use arrow keys to orbit; scroll, pinch or use +/− to zoom.
- Home or Reset returns to the initial camera.
- Orbit toggles automatic camera rotation; reduced motion disables it.
- Layers lifts and rejoins the membrane roof assembly.
- Hover, focus or click the component labels. Clicking a component or label
  updates the inspector, which links to its related data view.
- If WebGL2 is unavailable, the same meshes are rendered with a local software
  triangle rasterizer and per-pixel depth buffer. Rotation, zoom, layer separation,
  raycast selection and labels continue to work. This is an interactive 3D scene,
  not a static image fallback.
- A WebGL context loss switches to compatibility rendering.

All scene geometry is conceptual and not to scale. It does not predict material
response, depict a validated pilot site, or control a device.

## Data contract

The existing validated workbook snapshot remains the source for all eight
scenarios, 168 readings and 24 material rows. Original source precision and naive
workbook timestamps are retained. The selected deployment scopes metrics,
readings and alerts; material comparisons use independent matched RH conditions.
S7 remains a separate open-aperture reference. The scene is explicitly independent
of the selected dataset scope. No what-if controls alter saved data.

## Modify and verify

Requires Node.js for authoring only:

```text
npm ci
npm run build
npm run verify
```

`src/world.js` builds the model, camera controls, picking and compatibility
renderer. `src/ui.js` handles dataset views and the component inspector.
`src/entry.js` composes both. `core.js` contains the calculation contract.

To refresh the dataset from the original Python project, run the existing
`website/scripts/export_data.py` with that project's installed Python environment.

## Verification

`node scripts/verify.mjs` reconciles global/C05 summaries, unequal baselines and
zeros, every source severity, threshold boundaries, material arithmetic, empty
selections, local assets, source fingerprint and timestamp semantics.

The live GitHub Pages preview is used for browser QA because the managed local
preview relay was unavailable. The verification record is in the project's
`ROADMAP.md`. GPU rendering and compatibility rendering are separate paths;
checks establish only the path actually observed. Real hardware/OS variations
still need the normal event-laptop rehearsal.
