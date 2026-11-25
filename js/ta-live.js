/* zerodebug — the hero's live touchAble model
   The clock is the set's: 165 BPM (the SONG card's own tempo).
   Behaviour follows the app's code: clip progress is
   clip.bar.playing sweeping over the loop, a launched scene
   flashes the slots (clip.flash) and lights its launcher's
   triangle mint (scene.playing), meters are sqrt-scaled with the
   0.1337 s decay and the 85 % hot zone from TAVolumeView.cpp, and
   faders are ridden with the CSS travel the tokens define. */
(() => {
  "use strict";
  const app = document.getElementById("ta-live");
  if (!app) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;                 /* the still frame in HTML already is the captured state */

  const BPM = 165;
  const BEAT = 60 / BPM;               /* 0.3636 s — a quarter */
  const CLIP_BEATS = 8;                /* the loop of a playing clip */
  const SCENE_SECS = 12;               /* how long a scene holds before the next one launches */

  /* the set, as captured: which track has a clip on which scene row */
  const clips = [
    [1, 1, 1, 1, 1],   /* Drum Rack  */
    [1, 1, 1, 1, 1],   /* Perc Chance*/
    [0, 1, 0, 0, 0],   /* Perc Hits  — one clip: Hits A */
    [0, 1, 1, 1, 1],   /* Clap Loop  */
    [0, 0, 0, 1, 1],   /* Hihat Loop */
    [0, 0, 0, 1, 1],   /* Break Loop */
    [0, 0, 0, 0, 0],   /* Vocals     — armed, empty  */
    [1, 1, 1, 0, 0],   /* Lead       */
  ];
  const gain = [0.86, 0.74, 0.78, 0.8, 0.66, 0.62, 0, 0.7];   /* meter ceiling per track */

  const slots = {};                    /* "c,r" → element */
  app.querySelectorAll(".ta-col").forEach((col) => {
    const c = +col.dataset.col;
    col.querySelectorAll(".ta-slot[data-row]").forEach((s) => { slots[c + "," + s.dataset.row] = s; });
  });
  const sceneEls = app.querySelectorAll(".ta-scene");
  const posEl = document.getElementById("ta-pos");
  const strips = Array.prototype.map.call(app.querySelectorAll(".ta-strip"), (el) => ({
    el,
    v: parseFloat(el.style.getPropertyValue("--v")) || 0.5,
    db: el.querySelector(".ta-db"),
    lits: el.querySelectorAll(".ta-slit"),
    cur: [0, 0],
    phase: Math.random() * 4,
  }));

  /* ---- transport position: bar.beat.16th, the app's readout ---- */
  let scene = 1;                       /* Verse A — the captured moment */
  const clipStart = [0, 0, 0, 0, 0, 0, 0, 0];   /* when each track began to play */
  let sceneT = 0;                      /* live seconds of the current scene's launch */
  let playing = [];
  let running = true;

  const applyScene = (i, now, flash) => {
    scene = i;
    playing = [];
    for (let c = 0; c < 8; c++) {
      const has = clips[c][i] === 1;
      if (has) playing.push(c);
      clipStart[c] = now;
      for (let r = 0; r < 5; r++) {
        const s = slots[c + "," + r];
        if (!s) continue;
        const on = has && r === i;
        s.classList.toggle("ta-playing", on);
        s.classList.toggle("ta-stopped", !on);
        if (on && flash) {
          s.classList.add("ta-hit");
          setTimeout(() => s.classList.remove("ta-hit"), 130);
        }
      }
    }
    sceneEls.forEach((el, k) => el.classList.toggle("ta-scene-on", k === i));
    if (flash) {
      const key = sceneEls[i];
      key.classList.add("ta-sceneflash");
      setTimeout(() => key.classList.remove("ta-sceneflash"), 130);
    }
    sceneT = now;
  };
  applyScene(1, 0, false);
  /* the captured frame runs with the transport button unlit — stay faithful */

  /* ---- meters: the TAVolumeView.cpp model, per strip ---- */
  const WARM = [255, 189, 0];          /* meter.warm */
  const HOT = [255, 0, 0];             /* meter.hot  */
  const paint = (s, ch, m) => {
    const lit = s.lits[ch];
    lit.style.height = (m * 100).toFixed(1) + "%";
    let hot = lit.querySelector(".ta-shot");
    if (m > 0.85) {
      const over = Math.min(1, (m - 0.85) / 0.15);
      if (!hot) { hot = document.createElement("span"); hot.className = "ta-shot"; lit.appendChild(hot); }
      hot.style.bottom = ((0.85 / m) * 100).toFixed(1) + "%";
      hot.style.height = (((m - 0.85) / m) * 100).toFixed(1) + "%";
      const c = HOT.map((h, i) => Math.round(WARM[i] + (h - WARM[i]) * over));
      hot.style.background = "linear-gradient(to top,#ffbd00,rgb(" + c.join(",") + "))";
    } else if (hot) hot.remove();
  };
  const level = (c, ch, now) => {
    const g = gain[c];
    if (!g || playing.indexOf(c) < 0) {
      /* silence, but not a dead console: a faint blip now and then */
      return 0.016 + Math.max(0, Math.sin(now * 0.35 + c * 2.4 + ch) - 0.985) * 6;
    }
    const beats = (now - clipStart[c]) / BEAT;
    const env = Math.pow(1 - (beats % 1), 1.7);          /* every quarter, a hit */
    const wob = 0.62 + 0.38 * Math.sin(beats * 1.9 + ch * 2.3 + c);
    return Math.min(1, Math.sqrt(g * (0.3 + 0.7 * env) * wob) + (ch ? 0 : 0.04));
  };

  /* ---- the clock ---- */
  let live = 0, last = performance.now(), raf = null, painted = 0;
  const frame = (now) => {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (running) {
      live += dt;

      /* next scene: Intro → Verse A → Verse B → Breakdown → Chopped Break */
      if (live - sceneT > SCENE_SECS) applyScene((scene + 1) % 5, live, true);

      /* clip progress bars */
      if (now - painted > 60) {
        painted = now;
        for (const c of playing) {
          const s = slots[c + "," + scene];
          if (s) s.style.setProperty("--p", (((live - clipStart[c]) / (CLIP_BEATS * BEAT)) % 1 * 100).toFixed(1) + "%");
        }
        const f = live / BEAT;
        posEl.textContent = Math.floor(f / 4) + "." + (Math.floor(f) % 4) + "." + (Math.floor(f * 4) % 4);
      }

      /* meters, with the app's rise/decay */
      strips.forEach((s, c) => {
        [0, 1].forEach((ch) => {
          const tg = level(c, ch, live);
          if (tg > s.cur[ch]) s.cur[ch] = tg;
          else s.cur[ch] += (tg - s.cur[ch]) * (1 - Math.exp(-dt / 0.1337));
          if (s.cur[ch] < 0.004) s.cur[ch] = 0;
          paint(s, ch, s.cur[ch]);
        });
      });
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  /* ---- ride an occasional fader — the thumb on the console ---- */
  const ride = () => {
    const c = [1, 3, 5, 7][Math.floor(Math.random() * 4)];
    const s = strips[c];
    s.v = Math.min(0.8, Math.max(0.3, s.v + (Math.random() - 0.5) * 0.14));
    s.el.style.setProperty("--v", s.v.toFixed(3));
    const db = Math.round((s.v * 48 - 24) * 10) / 10;
    s.db.childNodes[0].nodeValue = (db >= 0 ? "+" : "−") + Math.abs(db).toFixed(1);
    setTimeout(ride, 7000 + Math.random() * 6000);
  };
  setTimeout(ride, 5200);

  /* ---- stop the show when nobody's watching the device ---- */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => { running = e.isIntersecting; }, { threshold: 0 }).observe(app);
  }
})();
