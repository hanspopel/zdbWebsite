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

## Previews: real captures + two live models

Product previews in the feature cards and the Session showcase are **real
screen captures** recorded from touchAble builds running a live Ableton
set (from `touchAble/docs/screenshots/`).

The **hero goes further than a capture: it is a live model of the whole
split screen** — Session view with playing clips above, mixer with live
meters below, top bar and side rails included — rebuilt clip for clip
from the capture `01_clips_and_mixer_playing_clips.png` (1 pt = 1 px)
and from the app's drawing code:

- every dimension at the app's real points (65 pt top bar, 50 pt track
  headers, 48 pt slot rows, 60 pt rails, 55 pt side bars) scaled through
  a container query, so the UI grows and shrinks with the device
- slot states as drawn by `TATokens.cpp`: washed clip colour while
  playing, the white play triangle, the bottom progress pill (played
  portion = the clip colour mixed toward white), the track-coloured loop
  bar on stopped clips, the 8 pt grey square in empty slots, the record
  dot on the armed track
- the transport clock at the set's 165 BPM: bar.beat.16th readout, an
  8-beat clip loop, scenes launching every 12 s with the app's white
  launch flash
- meters, fader caps, grooves and dB readouts per `TAVolumeView.cpp`
  (rise/0.1337 s decay, 85 % hot zone); faders get ridden occasionally
- no-JS and reduced motion show the captured frame as a still

The Low-latency showcase's mixer is a second, smaller **live model**,
also rebuilt from the app's own drawing code:

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
index.html      the landing page (hero holds the live touchAble model)
css/zdb.css     design tokens + corporate styles + the live mixer model
css/ta-ui.css   the hero's full touchAble UI replica, at app points
js/zdb.js       scroll reveal, nav states, currency localization, mixer animation
js/ta-live.js   the hero's transport clock, scene launches, meters, fader ride
assets/screens/ real screen captures from touchAble builds
assets/favicon/  the live favicon — Soft Geometry mark, black lines on transparent
assets/zerodebug-logo-favicon/  the Soft Geometry logo masters + navy favicon set
assets/brand/   the touchAble app icon (from the app's asset catalogue)
```

Deployed via GitHub Pages from `main` (`.nojekyll` included).
