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

## Previews: real captures, live models — and playable instruments

Product previews in the feature cards and the Session showcase are **real
screen captures** recorded from touchAble builds running a live Ableton
set (from `touchAble/docs/screenshots/`). The Session showcase presents
its capture full-width at the tablet's native 1334 × 750 aspect — every
clip, fader lane and scene plate stays readable, nothing is cropped into
a half-column.

Each of the six feature cards ("Every part of Live…") shows a **tight
4:3 crop** of the matching capture (`assets/screens/card-*.png`), framed
in a `4 / 3` box so the image fills its slot exactly — never stretched,
never letterboxed, never cramped. The crops are pre-computed windows
onto the 1334 × 750 originals, chosen so the module's own controls fill
the frame (`card-session.png` is 540 × 405, the rest 840 × 630 — all the
same 4:3 ratio).

The **Instruments section embeds the actual device views as live,
playable demos**: EQ Eight, Compressor, Drum Rack and Wavetable run in
iframes (`demos/*.dc.html`) at the app's native 1334 × 750 and scale to
the stage, so dragging a knob or an EQ band behaves exactly like on the
tablet. They are pinned to the **Soft Graphite** finish (`look="soft"`) —
the site's colour scheme; the mockups' other looks (backlit, satin,
glass) are deliberately not shipped. Tabs lazy-load an iframe on first
use, and the default device only once the stage scrolls into view;
without JS the stage shows the captured EQ Eight frame instead.

The **hero is a live, playable model of the whole split screen** — Session
view with clips playing above, mixer with live meters below, top bar and
side rails included. It runs `demos/Main.dc.html`, the same interactive
mockup engine as the instrument previews, in the Soft Graphite finish, at
the app's native 1334 × 750 and scaled into the device bezel by a
transform (so mouse and touch gestures land where they should). It
autoplays on load; without JS — or under reduced motion — the captured
frame `assets/screens/clips-mixer.png` stands in as a still.

The Low-latency showcase's mixer is a second, smaller **live model**,
also rebuilt from the app's own drawing code:

- groove, cap, grip and meter geometry and colours from
  `TATokens.cpp` (the "Soft Graphite" fader form: 8 pt groove at 0.6
  depth, 52 × 22 pt cap lifted 16 % toward white, 4 pt meters)
- level behaviour from `TAVolumeView.cpp`: sqrt-scaled meters, snap-and-
  decay (0.1337 s), the hot zone at 85 % (`meter.warm → meter.hot`),
  muted meters at 7 % opacity, solo/mute on-states, record-arm red

Store badges are drawn in SVG — no store-supplied images, no build step.

## Brand mark: the real touchAble app icon

The touchAble icon in the navigation bar and the product sub-nav is the
**actual shipping app icon** (`assets/brand/touchable-app-icon.png`) —
the five-colour bar mark (orange/white/blue/green/red on dark), extracted
as the highest-resolution bitmap embedded in the app's master Sketch art
(`touchAble/source/graphics/app/iOS/touchable_ios_icon_set_color2.sketch`).
It replaced an early placeholder that was still carrying a "zdb" wordmark.

## Placeholder product pages

`studiomux.html` and `soda.html` are live placeholder pages (new-GUI-in-
progress) built on the same corporate shell — global nav, footer and
`css/zdb.css` — so the nav and footer links to every product resolve.
They are stubs until each product's refreshed interface ships.

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
index.html      the landing page (hero holds the live touchAble model)
studiomux.html  placeholder product page (new GUI pending)
soda.html       placeholder product page (new GUI pending)
css/zdb.css     design tokens + corporate styles + the live mixer model
js/zdb.js       scroll reveal, nav states, currency localization, mixer animation,
                live device-view tabs, hero + device iframe scaling
demos/          live Soft Graphite interactive mockups — Main.dc.html (the hero's
                Session + mixer) and the device views (EQ Eight, Compressor, Drum
                Rack, Wavetable) + Device.dc.html + _runtime/
assets/screens/ real screen captures from touchAble builds; card-*.png are the
                exact 4:3 crops behind the six feature cards
assets/favicon/  the live favicon — Soft Geometry mark, black lines on transparent
assets/zerodebug-logo-favicon/  the Soft Geometry logo masters + navy favicon set
assets/brand/   the real touchAble app icon (extracted from the app's Sketch master)
```

Deployed via GitHub Pages from `main` (`.nojekyll` included).
