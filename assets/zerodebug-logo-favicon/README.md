# Zerodebug — Soft Geometry logo and favicon

Based on selected variation #2, Soft Geometry. The logo has been reconstructed
as smooth vector paths, retaining the rounded point-up hexagon and three
separate inset strokes. Minor raster irregularities are removed.

## Transparent white logo

- `zerodebug-logo-white-transparent.svg`: editable, scalable vector master.
- `zerodebug-logo-white-transparent.png`: 2048 × 2048 RGBA PNG.
- `zerodebug-logo-white-transparent-512.png`: 512 × 512 RGBA PNG.

The foreground is pure white. The canvas, center, and gaps are transparent,
including antialiasing at the edges. White artwork is intended for dark or
colored surfaces. The SVG contains paths, not an embedded bitmap.

## Favicon

The favicon uses slightly bolder white geometry on a solid navy `#101722`
square so it stays visible on light and dark browser tabs.

- `favicon.svg`: scalable vector favicon.
- `favicon.ico`: one ICO containing 16, 32, 48, and 64 px entries.
- `favicon-16x16.png`, `favicon-32x32.png`, `favicon-48x48.png`,
  `favicon-64x64.png`, `favicon-128x128.png`, `favicon-192x192.png`,
  `favicon-512x512.png`: individual square PNG exports.
- `apple-touch-icon.png`: 180 × 180 px.

Upload the desired favicon assets to your website and paste the contents of
`favicon-head.html` inside the page's `<head>`. Adjust the root-relative URLs
if you place the files in another directory. Existing favicons may be cached
by the browser; refresh or version the URLs when replacing an existing icon.

## Checks

The transparent PNG has real alpha, transparent center/corners, no background
matte or stray components, and four foreground components (ring + three bars).
PNG dimensions and the ICO's four embedded sizes have been verified. The
favicon has been visually reviewed at 16, 32, 48, and 64 px.

`build_assets.py` is an optional regeneration script using Python, PyMuPDF,
Pillow, NumPy, and SciPy. The supplied SVG/PNG/ICO files need no build step.
