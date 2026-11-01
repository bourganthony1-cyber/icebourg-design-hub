# Photo Globe — reusable template

An interactive sphere of photo tiles that turns to follow a **webcam-tracked hand**.
Pointer movement and drag work as fallbacks for anyone who denies the camera.

Used on [stableafdesigns.com/photo-globe](https://stableafdesigns.com/photo-globe/) as a
showpiece. It is a **showpiece, not a sales page** — camera permission, ~20 MB of lazy
model weights, and heavy GPU work do not belong on a page where someone's pipe just burst.

## Reuse it in three steps

1. **Copy this folder** anywhere static files are served.
2. **Replace `photos/*.jpg`** with your own, square, ~640 px on the long side. Any count
   works from 1 to 88+; more unique photos means less visible repetition. Keep the
   filenames in sync with the `PHOTOS` array near the top of `index.html`.
3. **Serve over http(s), never `file://`.** `getUserMedia` needs a secure context, so a
   plain double-click on `index.html` gives you the globe but no hand tracking.

## Tuning, all at the top of `index.html`

| Constant | What it does |
|---|---|
| `TILE_COUNT` | Tiles on the sphere. 88 reads dense; below ~40 the gaps become obvious. |
| `TILE_SIZE` | Tile edge in world units. Shrink it as `TILE_COUNT` rises or tiles overlap. |
| `POINTER_YAW` / `POINTER_PITCH` | How far a full left-to-right hand sweep turns it. |
| `IDLE_SPIN` | Drift per frame when untouched, so it never looks frozen. |
| `EASE` | Smoothing. Higher is snappier, lower is heavier. |

## Two things that will bite you

- **`three.module.js` is a shim, not the library.** Since r165 the ESM entry re-exports
  from a sibling `three.core.js`. On a CDN that resolves invisibly; vendored on its own the
  page silently never executes, and the only clue is the canvas sitting at its default
  300x150. **Vendor both files.** `vendor/` here has the pair for r186.
- **MediaPipe is still CDN-loaded, deliberately.** `vision_bundle.mjs`, an 11.8 MB wasm
  build and a 7.8 MB hand model are fetched **only after the visitor clicks** to enable the
  camera — roughly 20 MB that a visitor who never opts in never pays for. If you need
  offline operation, vendor all three.

## Verified numbers

Served from a build, measured in headless Chrome over CDP: 88 tiles, 88 textures resolved,
live WebGL context, rotation advancing frame-to-frame, a simulated drag moving it, zero
console errors, zero uncaught exceptions. Photo payload trimmed from 48 MB to **365 KB**
(131×) by square-cropping to 640 px through `optimize_photos.py`.

## Provenance

The sample photographs are AI-generated placeholders (Higgsfield `z_image`), so nothing
here depends on a real client's work. Swap them out.
