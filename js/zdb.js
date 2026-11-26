/* zerodebug — touchAble landing page
   The motion is the app's: states light up, nothing bounces. */
(() => {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- scroll reveal: cards and headlines fade up once ---- */
  const revealables = document.querySelectorAll(".reveal");
  if (reduced || !("IntersectionObserver" in window)) {
    revealables.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );
    revealables.forEach((el) => io.observe(el));
  }

  /* ---- the product sub-nav lifts off its ground when scrolled,
     the way a card lifts off the module ground in the app ---- */
  const sub = document.getElementById("nav-sub");
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      sub.classList.toggle("scrolled", window.scrollY > 10);
      ticking = false;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- flash the nav's Download key when the download
     section passes out of view — an on-state calling back ---- */
  const dl = document.getElementById("download");
  const cta = document.getElementById("nav-cta");
  if (dl && cta && "IntersectionObserver" in window) {
    let seen = false;
    new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) seen = true;
        else if (seen && !entry.isIntersecting && !cta.dataset.lit) {
          cta.dataset.lit = "1";
          cta.classList.add("lit");
        }
      },
      { threshold: 0.15 }
    ).observe(dl);
  }

  /* ---- pricing: dollars for the US, euros for Europe — and a
     segmented control that behaves like the app's own: the on
     key lights up, everything else steps back ---- */
  const amounts = document.querySelectorAll(".amount");
  const segs = document.querySelectorAll(".seg [data-cur]");
  const EU_KEYS = ["de","at","ch","fr","it","es","pt","nl","be","ie","fi","se","dk","pl","cz","sk","si","hr","hu","ro","bg","gr","lu","mt","cy"];

  const detectCurrency = () => {
    try {
      const saved = localStorage.getItem("zdb-currency");
      if (saved === "eur" || saved === "usd") return saved;
    } catch (e) { /* private mode — fall through to guessing */ }
    const lang = (navigator.language || "").toLowerCase();
    const cc = (lang.match(/-([a-z]{2})$/) || [])[1];
    if (cc === "us" || cc === "au" || cc === "nz" || cc === "ca") return "usd";
    if (cc && EU_KEYS.includes(cc)) return "eur";
    let tz = "";
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
    if (tz.startsWith("Europe/")) return "eur";
    return "usd";
  };

  const setCurrency = (cur) => {
    amounts.forEach((el) => {
      const v = el.dataset[cur];
      if (v) el.textContent = v;
    });
    segs.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.cur === cur)));
    try { localStorage.setItem("zdb-currency", cur); } catch (e) {}
  };

  segs.forEach((b) => b.addEventListener("click", () => setCurrency(b.dataset.cur)));
  setCurrency(detectCurrency());

  /* ---- live mixer model — the behaviour is the app's, copied from
     TAVolumeView.cpp: levels are sqrt-scaled like the meter value,
     rises snap and decay away in 0.1337 s, the hot zone starts at
     85 % and grows redder the harder it clips (meter.warm →
     meter.hot), a muted track stays silent, and the faders get
     ridden now and then like an engineer's thumb. The geometry and
     colours live in the CSS, straight from TATokens.cpp. ---- */
  const mixer = document.querySelector(".live-mixer");
  if (mixer) {
    /* one role per strip: beat period, level, phase — the muted bus plays 0 */
    const roles = [
      { period: 1.0, gain: 0.62 },  /* Wavetable  — four-to-the-floor pad  */
      { period: 0.5, gain: 0.78 },  /* 808 Kit    — busy, the loudest bus  */
      { period: 2.0, gain: 0.72 },  /* Lead Vox   — slow, occasionally hot */
      { period: 0,   gain: 0    },  /* Drum Bus   — muted                  */
    ];
    const strips = Array.prototype.map.call(
      mixer.querySelectorAll(".lm-strip"),
      (el, i) => ({
        el: el,
        v: parseFloat(el.style.getPropertyValue("--v")) || 0.5,
        muted: el.classList.contains("lm-muted"),
        cur: [0, 0],
        period: roles[i].period,
        gain: roles[i].gain,
        phase: (i * 1.37) % 1,
        lits: el.querySelectorAll(".lm-lit"),
        val: el.querySelector(".lm-val"),
      })
    );

    const BPM = 126;
    const WARM = [255, 189, 0];   /* meter.warm — #ffbd00 */
    const HOT = [255, 0, 0];      /* meter.hot  — #ff0000 */

    const target = (s, ch, t) => {
      if (!s.period) return 0;                          /* muted — silence */
      const beats = t / (60 / BPM) + s.phase * 4;
      const env = Math.pow(1 - (beats % s.period) / s.period, 2.2);
      const wob = 0.5 + 0.5 * Math.sin(beats * 1.7 + ch * 2.1 + s.phase * 9);
      return Math.min(1, Math.sqrt(env * s.gain * (0.55 + 0.5 * wob) + 0.02));
    };

    const paint = (s, ch, m) => {
      const lit = s.lits[ch];
      lit.style.height = (m * 100).toFixed(2) + "%";
      let hot = lit.querySelector(".lm-hot");
      if (m > 0.85) {                                   /* redPercentage in the app */
        const over = Math.min(1, (m - 0.85) / 0.15);
        if (!hot) {
          hot = document.createElement("span");
          hot.className = "lm-hot";
          lit.appendChild(hot);
        }
        hot.style.bottom = ((0.85 / m) * 100).toFixed(2) + "%";
        hot.style.height = (((m - 0.85) / m) * 100).toFixed(2) + "%";
        const c = HOT.map((h, i) => Math.round(WARM[i] + (h - WARM[i]) * over));
        hot.style.background = "linear-gradient(to top,#ffbd00,rgb(" + c.join(",") + "))";
      } else if (hot) {
        hot.remove();
      }
    };

    let raf = null;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000 || 0.016);
      last = now;
      const t = now / 1000;
      strips.forEach((s) => {
        [0, 1].forEach((ch) => {
          const tg = target(s, ch, t);
          if (tg > s.cur[ch]) s.cur[ch] = tg;                          /* rise: snap  */
          else s.cur[ch] += (tg - s.cur[ch]) * (1 - Math.exp(-dt / 0.1337)); /* fall  */
          if (s.cur[ch] < 0.004) s.cur[ch] = 0;
          paint(s, ch, s.cur[ch]);
        });
      });
      raf = requestAnimationFrame(tick);
    };

    /* ride the faders — a thumb nudge every few seconds, with the
       CSS transition (1.6 s var(--ease)) doing the travel */
    const ride = () => {
      strips.forEach((s) => {
        if (s.muted || Math.random() < 0.45) return;
        s.v = Math.min(0.88, Math.max(0.22, s.v + (Math.random() - 0.5) * 0.3));
        s.el.style.setProperty("--v", s.v.toFixed(3));
        const db = Math.round((s.v * 2 - 1) * 12 * 10) / 10;            /* ±12 dB travel */
        s.val.childNodes[0].nodeValue =
          (db >= 0 ? "+" : "−") + Math.abs(db).toFixed(1);
      });
      setTimeout(ride, 2800 + Math.random() * 2600);
    };

    if (reduced) {
      /* one honest still frame: a groove playing, one bar in the red */
      const frame = [[0.48, 0.56], [0.72, 0.8], [0.93, 0.61], [0, 0]];
      strips.forEach((s, i) => [0, 1].forEach((ch) => paint(s, ch, frame[i][ch])));
    } else {
      raf = requestAnimationFrame(tick);
      ride();
      /* no point animating what nobody sees — park the loop offscreen */
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(([e]) => {
          if (e.isIntersecting && raf === null) {
            last = performance.now();
            raf = requestAnimationFrame(tick);
          } else if (!e.isIntersecting && raf !== null) {
            cancelAnimationFrame(raf);
            raf = null;
          }
        }, { threshold: 0 }).observe(mixer);
      }
    }
  }
})();

/* ---- live device views (demos/) --------------------------------
   The instruments section embeds the real interactive device views:
   each demos/*.dc.html draws its instrument at touchAble's native
   1334 × 750. Tabs swap which iframe is shown; an iframe is only
   fetched the first time its device is asked for — and the default
   device only once the stage actually scrolls into view. The frame
   is scaled with a transform (origin top-left), so mouse and touch
   coordinates arrive at the device undistorted. */
(() => {
  "use strict";
  const stage = document.querySelector(".dev-stage");
  if (!stage) return;
  const tabs = Array.from(document.querySelectorAll(".seg--dev [data-dev]"));
  if (!tabs.length) return;

  const W = 1334;
  const fit = () => {
    const k = stage.clientWidth / W;
    stage.querySelectorAll("iframe").forEach(
      (f) => { f.style.transform = "scale(" + k + ")"; }
    );
  };
  if ("ResizeObserver" in window) new ResizeObserver(fit).observe(stage);
  else window.addEventListener("resize", fit);

  const show = (name) => {
    let f = stage.querySelector('iframe[data-dev="' + name + '"]');
    if (!f) {
      f = document.createElement("iframe");
      f.dataset.dev = name;
      f.setAttribute("title", tabs.find((b) => b.dataset.dev === name).textContent + " — live device view");
      f.setAttribute("scrolling", "no");
      stage.appendChild(f);
      fit();
      f.addEventListener("load", () => stage.classList.add("dev-ready"));
      f.src = "demos/" + name + ".dc.html";
    }
    stage.querySelectorAll("iframe").forEach((x) => x.classList.toggle("dev-on", x === f));
    tabs.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.dev === name)));
  };

  tabs.forEach((b) => b.addEventListener("click", () => show(b.dataset.dev)));

  const boot = () => {
    const on = tabs.find((b) => b.getAttribute("aria-pressed") === "true") || tabs[0];
    show(on.dataset.dev);
  };
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(([e], obs) => {
      if (e.isIntersecting) { boot(); obs.disconnect(); }
    }, { threshold: 0 });
    io.observe(stage);
  } else {
    boot();
  }
})();

/* ---- hero: scale the live mockup iframe to the device screen ---------
   The hero embeds demos/Main.dc.html — the interactive clips + mixer
   mockup, the same engine as the instrument previews. It runs at the
   app's native 1334 × 750; we scale it into whatever the .device-screen
   currently measures (it is fluid) and re-scale on resize. The iframe
   src is in the markup, so the app boots as soon as the page parses. */
(() => {
  "use strict";
  const scr = document.querySelector(".device-screen");
  const frame = scr && scr.querySelector("iframe.hero-live");
  if (!frame) return;
  /* reduced motion: don't boot the live app — keep the captured frame,
     the same courtesy the low-latency mixer extends */
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    frame.removeAttribute("src");
    frame.style.display = "none";
    const still = scr.querySelector(".hero-still");
    if (still) still.style.display = "block";
    return;
  }
  const W = 1334;
  const fit = () => { frame.style.transform = "scale(" + (scr.clientWidth / W) + ")"; };
  if ("ResizeObserver" in window) new ResizeObserver(fit).observe(scr);
  else window.addEventListener("resize", fit);
  fit();
})();
