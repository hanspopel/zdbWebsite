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

  /* ---- a little life in the demo mixer: re-randomise the
     fader caps every so often, like a track being ridden ---- */
  if (!reduced) {
    const caps = document.querySelectorAll('.device .cap, .big-frame .cap');
    setInterval(() => {
      caps.forEach((cap) => {
        const base = 8 + Math.random() * 30;
        const delta = 10 + Math.random() * 30;
        cap.style.setProperty("--a", base + "%");
        cap.style.setProperty("--b", Math.min(base + delta, 78) + "%");
      });
    }, 9000);
  }
})();
