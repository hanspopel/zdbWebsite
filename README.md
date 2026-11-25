# zerodebug website — touchAble product page

The new zerodebug landing page, designed as a single-product page in the
Apple.com style — **touchAble only** on the landing page.

## Corporate design from touchAble's design tokens

Every colour, surface and material on the site mirrors touchAble's own
design-token system
(`touchAble/source/app/src/common/BaseControls/TATokens.cpp` +
`zdb/.../zdb/Color.h`), see the token block at the top of `css/zdb.css`:

| touchAble token | Site role |
|---|---|
| `strip.base` `bar.base` `ground.module` `card` | alternating section grounds — the app's lifted-material hierarchy |
| `palette.blue` `#0098f8` | primary actions (the app's selection colour) |
| `palette.orange` `#f85700` | hover/highlight (the app's lit-key colour) |
| `palette.yellow` `#cc8f3d` | on-states: "Best value" flag, lit segment |
| greyscale ramp `244→161→142→87→69→51→33→16` | text hierarchy and hairlines |
| `state.play` / clip colours | the animated meter scale and session clips |

The iPad, mixer, faders, meters, session grid, feature illustrations and
store badges are drawn in pure CSS/SVG — no image assets, no build step.

## Pricing

Free (iOS/Android, feature-limited) · Pro monthly · Pro lifetime.
Prices auto-localize: euros for Europe, dollars for the US/UK/etc., with a
manual €/$ segmented control (styled like the app's own segments); the
choice persists in `localStorage`.

## Run it

Plain static files — open `index.html`, or:

```sh
python3 -m http.server 8080
# → http://localhost:8080
```

## Layout

```
index.html      the landing page
css/zdb.css     design tokens + corporate styles
js/zdb.js       scroll reveal, nav states, currency localization
favicon.svg     brand mark (touch dot, blue→orange gradient)
```

Deployed via GitHub Pages from `main` (`.nojekyll` included).
