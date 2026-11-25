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
| `state.play` / clip colours | the live mixer model's meters and track fills |

## Previews: real captures + a live model

Product previews are **real screen captures** recorded from touchAble
builds running a live Ableton set (from `touchAble/docs/screenshots/`),
shown in the hero device, the six feature cards and the Session showcase.

The Low-latency showcase goes one step further: its mixer is a **live
model** — no screenshot, but HTML/CSS/JS rebuilt from the app's own
drawing code:

- groove, cap, grip and meter geometry and colours from
  `TATokens.cpp` (the "Soft Graphite" fader form: 8 pt groove at 0.6
  depth, 52 × 22 pt cap lifted 16 % toward white, 4 pt meters)
- level behaviour from `TAVolumeView.cpp`: sqrt-scaled meters, snap-and-
  decay (0.1337 s), the hot zone at 85 % (`meter.warm → meter.hot`),
  muted meters at 7 % opacity, solo/mute on-states, record-arm red

Store badges are drawn in SVG — no store-supplied images, no build step.

## Pricing

Mirrors the real offer shown in the app (`docs/screenshots/licence-2026-11-14`):
Free test version · Pro Yearly (14 days free, then €24.99 a year, credited
toward Lifetime) · Pro Monthly €3.99 · Pro Lifetime €54.99 one-time.
Prices auto-localize: euros for Europe, dollars for the US/UK/etc., with a
manual €/$ segmented control (styled like the app's own segments); the
choice persists in `localStorage`. The fine print notes the stores bill in
local currency and the free touchAble Server is required first.

## Run it

Plain static files — open `index.html`, or:

```sh
python3 -m http.server 8080
# → http://localhost:8080
```

## Layout

```
index.html      the landing page
css/zdb.css     design tokens + corporate styles + the live mixer model
js/zdb.js       scroll reveal, nav states, currency localization, mixer animation
assets/screens/ real screen captures from touchAble builds
favicon.svg     brand mark (touch dot, blue→orange gradient)
```

Deployed via GitHub Pages from `main` (`.nojekyll` included).
