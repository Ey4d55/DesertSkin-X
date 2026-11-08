# DesertSkin-X / Membrane explorer — build 03

An original interactive material specimen, developed from the project profile.
The supplied videos inform spatial presentation, cutaway exploration and camera
movement; their biological subjects, geometry and interfaces are not reproduced.
The earlier garden diorama has been replaced by a hydrogel/aerogel membrane.

## Explore

- Rotate by dragging or with arrow keys; zoom by scroll, pinch or +/−.
- Use Overview, Surface and Cross-section camera presets. Home resets the view.
- Switch between Assembled, Cutaway and Exploded presentations.
- Select hydrogel, aerogel, interface or hydration to inspect composition and role.
- Select 30%, 50% or 80% illustrative RH to change visual hydration and thickness.
  This is not a calibrated swelling curve and never alters the workbook KPIs.
- Open the existing readings, material comparison and alert views from navigation
  or the material inspector. S7 is a separate open-aperture reference.

## Composition and evidence

The project profile proposes a PVA/alginate/CMC/CNC hydrogel, with PSBMA investigated
at 0.5% and 1.0%, and a CNF/GO/silica aerogel support. The model is a schematic
explanation of that bilayer architecture, not microscopy or a molecular model.
Pore geometry, water particles, separation distance and deformation are illustrative.
The magnitude/direction of permeability response requires experimental verification;
net vapor flow depends on the vapor partial-pressure gradient.

## Run or build

Open `dist/index.html` in a modern browser, or use the existing GitHub Pages site.
All runtime assets are local, with content-hashed scripts/styles. No CDN, account,
remote model, texture, font or Python server is required.

For authoring, run these in `website`:

```text
npm ci
npm run build
npm run verify
```

Three.js 0.187.0 and esbuild 0.25.12 are pinned. The engine’s MIT license ships
with the site. `src/world.js` builds the original specimen and controls;
`src/software.js` provides real 3D triangle rendering when WebGL2 is unavailable;
`src/ui.js` preserves the workbook views and renders the material inspector.

Both renderers use the same meshes, transforms and camera. The compatibility
path includes depth testing, translucency, lighting and raycast selection;
it is not a static-image fallback. The WebGL path uses studio environment
lighting. Reduced motion is respected, and the model pauses when hidden.

## Data and checks

The fixed synthetic workbook snapshot, precision, timestamps and rules are
unchanged. The exporter uses the existing validated Python loader. `npm run verify`
checks exact global/C05 metrics, unequal baselines and zeros, every source alert,
threshold edges, material arithmetic, empty data, local assets and provenance.
Browser verification covers the path actually observed; GPU-specific rendering,
physical touch devices and the presentation laptop need their own rehearsal.
