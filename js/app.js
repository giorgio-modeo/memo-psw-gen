/* ============================================================
   Generatore. Dipende da: i18n/i18n.js (I18N), js/store.js (Store).
   ============================================================ */
(function () {
  "use strict";

  const DIGITS = "0123456789".split("");
  const SYMBOLS = "!?@#$%&*+=_".split("");

  function randInt(max) {
    const limit = Math.floor(0x100000000 / max) * max;
    const buf = new Uint32Array(1);
    let x;
    do { crypto.getRandomValues(buf); x = buf[0]; } while (x >= limit);
    return x % max;
  }
  const pick = (a) => a[randInt(a.length)];

  function applyCaps(word, mode) {
    switch (mode) {
      case "first":  return word[0].toUpperCase() + word.slice(1);
      case "all":    return word.toUpperCase();
      case "random": return [...word].map(c => randInt(2) ? c.toUpperCase() : c).join("");
      default:       return word;
    }
  }

  /* Tempo medio di crack a GUESSES/s (attaccante offline, hash veloce). */
  const GUESSES = 1e11;
  function crackTime(bits, T) {
    if (bits <= 0) return T.ct_instant;
    const seconds = Math.pow(2, bits - 1) / GUESSES;
    if (!isFinite(seconds) || seconds > 4.4e17) return T.ct_over;
    if (seconds < 1) return T.ct_instant;
    const U = T.ct_units, MIN = 60, H = 3600, D = 86400, Y = 31557600;
    const fmt = (n, u) => `${n < 10 ? Math.round(n * 10) / 10 : Math.round(n)} ${u}`;
    if (seconds < MIN) return fmt(seconds, U.s);
    if (seconds < H) return fmt(seconds / MIN, U.m);
    if (seconds < D) return fmt(seconds / H, U.h);
    if (seconds < Y) return fmt(seconds / D, U.d);
    const years = seconds / Y;
    if (years < 1e3) return fmt(years, U.y);
    if (years < 1e6) return fmt(years / 1e3, U.K);
    if (years < 1e9) return fmt(years / 1e6, U.M);
    return fmt(years / 1e9, U.B);
  }

  const cfg = { uiLang: "it", langs: ["it"], sep: "-", caps: "none", pos: "end", topic: "mixed", maxlen: 0 };
  let lastPlain = "";

  const $ = (id) => document.getElementById(id);

  function generate() {
    const n = +$("words").value;
    const addNum = $("addNum").checked;
    const addSym = $("addSym").checked;
    const amount = +$("amount").value;
    const pool = Store.buildPool(cfg.langs, cfg.topic);
    const charset = [...(addNum ? DIGITS : []), ...(addSym ? SYMBOLS : [])];

    if (!pool.length) {
      lastPlain = "";
      $("pwd").textContent = "—";
      resetMeters();
      $("poolInfo").textContent = "0";
      return;
    }

    const parts = [];
    for (let i = 0; i < n; i++) {
      const w = applyCaps(pick(pool), cfg.caps);
      parts.push({ t: "word", chars: [...w].map(ch => ({ t: "w", v: ch })) });
      if (i < n - 1) {
        const sv = cfg.sep === "num" ? String(randInt(10)) : cfg.sep;
        if (sv !== "") parts.push({ t: cfg.sep === "num" ? "n" : "sep", v: sv });
      }
    }

    let insideCount = 0;
    if (charset.length) {
      if (cfg.pos === "inside") {
        const words = parts.filter(p => p.t === "word");
        for (let k = 0; k < amount; k++) {
          const wp = pick(words);
          const useNum = (addNum && addSym) ? randInt(2) === 0 : addNum;
          const ch = useNum ? pick(DIGITS) : pick(SYMBOLS);
          const idx = 1 + randInt(Math.max(1, wp.chars.length - 1));
          wp.chars.splice(idx, 0, { t: useNum ? "n" : "s", v: ch });
          insideCount++;
        }
      } else {
        if (addNum) parts.push({ t: "n", v: String(randInt(90) + 10) });
        if (addSym) parts.push({ t: "s", v: pick(SYMBOLS) });
      }
    }

    /* Inietta le parole fisse in posizioni casuali tra le parole random */
    for (const pw of Store.getPinnedWords()) {
      const wordIdx = parts.reduce((a, p, i) => p.t === "word" ? [...a, i] : a, []);
      const sv = cfg.sep === "num" ? String(randInt(10)) : cfg.sep;
      if (!wordIdx.length) {
        parts.push({ t: "pinned", v: pw });
      } else {
        const after = wordIdx[randInt(wordIdx.length)];
        const ins = [{ t: "pinned", v: pw }];
        if (sv !== "") ins.unshift({ t: cfg.sep === "num" ? "n" : "sep", v: sv });
        parts.splice(after + 1, 0, ...ins);
      }
    }

    if (cfg.maxlen > 0) truncateParts(parts, cfg.maxlen);
    lastPlain = plainText(parts);
    render(parts);
    updateMeters({ n, pool, addNum, addSym, charset, insideCount });
  }

  function truncateParts(parts, max) {
    let used = 0;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (p.t === "word") {
        const room = max - used;
        if (room <= 0) { parts.splice(i); return; }
        if (p.chars.length > room) p.chars.splice(room);
        used += p.chars.length;
      } else {
        if (used + p.v.length > max) { parts.splice(i); return; }
        used += p.v.length;
      }
    }
  }

  function plainText(parts) {
    let s = "";
    for (const p of parts) s += (p.t === "word") ? p.chars.map(c => c.v).join("") : p.v;
    return s;
  }
  const esc = (s) => s.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

  function render(parts) {
    let html = "";
    for (const p of parts) {
      if (p.t === "sep") { html += `<span class="sep">${esc(p.v)}</span>`; continue; }
      if (p.t === "n") { html += `<span class="n">${esc(p.v)}</span>`; continue; }
      if (p.t === "s") { html += `<span class="s">${esc(p.v)}</span>`; continue; }
      if (p.t === "pinned") { html += `<span class="pinned">${esc(p.v)}</span>`; continue; }
      let buf = "", cur = null;
      const flush = () => { if (buf) { html += `<span class="${cur}">${esc(buf)}</span>`; buf = ""; } };
      for (const c of p.chars) {
        if (c.t !== cur) { flush(); cur = c.t; }
        buf += (c.t === "w") ? c.v.replace(/[A-ZÀ-Ý]/g, m => `${m}`) : c.v;
      }
      flush();
    }
    html = html.replace(/(.)/g, '<span class="cap">$1</span>');
    $("pwd").innerHTML = html;
  }

  /* ---- Doppia barra ---- */
  function dictBits({ n, pool, addNum, addSym, charset, insideCount }) {
    let bits = n * Math.log2(pool.length);
    if (cfg.sep === "num") bits += (n - 1) * Math.log2(10);
    if (cfg.caps === "random") bits += lastPlain.replace(/[^a-zà-ÿ]/gi, "").length;
    if (charset.length) {
      if (cfg.pos === "inside") bits += insideCount * (Math.log2(charset.length) + Math.log2(5));
      else { if (addNum) bits += Math.log2(90); if (addSym) bits += Math.log2(SYMBOLS.length); }
    }
    /* Le parole pinnate sono sconosciute all'attaccante → contributo brute-force */
    const pinnedStr = Store.getPinnedWords().join("");
    if (pinnedStr.length) {
      let pc = 0;
      if (/[a-zà-ÿ]/.test(pinnedStr)) pc += 26;
      if (/[A-ZÀ-Ý]/.test(pinnedStr)) pc += 26;
      if (/[0-9]/.test(pinnedStr)) pc += 10;
      if (/[^a-z0-9à-ÿ]/i.test(pinnedStr)) pc += 33;
      if (pc > 0) bits += pinnedStr.length * Math.log2(pc);
    }
    bits = Math.round(bits);
    if (cfg.maxlen > 0) {
      const alpha = 26 + (cfg.caps !== "none" ? 26 : 0) + (/[0-9]/.test(lastPlain) ? 10 : 0) + (/[^a-z0-9]/i.test(lastPlain) ? 12 : 0);
      bits = Math.min(bits, Math.round(lastPlain.length * Math.log2(alpha)));
    }
    return bits;
  }

  /* Stima "stile NordPass": lunghezza x classi di caratteri presenti. */
  function bruteBits() {
    const s = lastPlain;
    let charset = 0;
    if (/[a-zà-ÿ]/.test(s)) charset += 26;
    if (/[A-ZÀ-Ý]/.test(s)) charset += 26;
    if (/[0-9]/.test(s)) charset += 10;
    if (/[^a-z0-9à-ÿ]/i.test(s)) charset += 33;
    if (charset === 0) return 0;
    return Math.round(s.length * Math.log2(charset));
  }

  function paintMeter(prefix, bits, T) {
    let color, label;
    if (bits < 45) { color = "var(--weak)"; label = T.weak; }
    else if (bits < 70) { color = "var(--ok)"; label = T.good; }
    else { color = "var(--strong)"; label = T.strong; }
    $("bar-" + prefix).style.width = Math.max(4, Math.min(100, bits)) + "%";
    $("bar-" + prefix).style.background = color;
    const v = $("v-" + prefix); v.textContent = label; v.style.color = color;
    $("bits-" + prefix).textContent = bits;
    $("ct-" + prefix).textContent = crackTime(bits, T);
  }

  function resetMeters() {
    ["dict", "brute"].forEach(p => {
      $("bar-" + p).style.width = "0%";
      $("v-" + p).textContent = "—";
      $("bits-" + p).textContent = "0";
      $("ct-" + p).textContent = "—";
    });
    $("chars").textContent = "0";
  }

  function updateMeters(info) {
    const T = I18N[cfg.uiLang];
    $("chars").textContent = lastPlain.length;
    paintMeter("dict", dictBits(info), T);
    paintMeter("brute", bruteBits(), T);
    $("poolInfo").textContent = String(info.pool.length);
  }

  /* ---------- Lingua UI ---------- */
  function applyLang() {
    const T = I18N[cfg.uiLang];
    document.documentElement.lang = cfg.uiLang;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const k = el.dataset.i18n; if (T[k] != null) el.textContent = T[k];
    });
    document.querySelectorAll("[data-i18n-title]").forEach(el => {
      const k = el.dataset.i18nTitle; if (T[k] != null) el.title = T[k];
    });
    document.title = T.title;
    $("topics") && $("topics").querySelectorAll("button").forEach(b => { b.textContent = T.topics[b.dataset.v]; });
  }

  /* ---------- Multi-select lingue (tag) ---------- */
  function renderLangTags() {
    const box = $("langs");
    box.innerHTML = "";
    const available = Store.listLanguages();
    cfg.langs = cfg.langs.filter(c => available.some(l => l.code === c));
    if (!cfg.langs.length && available.length) cfg.langs = [available[0].code];

    available.forEach(l => {
      const b = document.createElement("button");
      b.className = "tag";
      b.dataset.v = l.code;
      const on = cfg.langs.includes(l.code);
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.innerHTML = `<span class="tag-dot"></span>${esc(l.label)}` + (l.builtin ? "" : " •");
      b.addEventListener("click", () => {
        const i = cfg.langs.indexOf(l.code);
        if (i >= 0) { if (cfg.langs.length > 1) cfg.langs.splice(i, 1); }
        else cfg.langs.push(l.code);
        b.setAttribute("aria-pressed", cfg.langs.includes(l.code) ? "true" : "false");
        Store.setSelectedLangs(cfg.langs);
        generate();
      });
      box.appendChild(b);
    });
  }

  /* ---------- Wiring ---------- */
  function wireSeg(id, key, after) {
    const box = $(id);
    box.querySelectorAll("button").forEach(b => {
      b.addEventListener("click", () => {
        box.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", "false"));
        b.setAttribute("aria-pressed", "true");
        cfg[key] = (key === "maxlen") ? +b.dataset.v : b.dataset.v;
        if (after) after();
        generate();
      });
    });
  }

  function init() {
    cfg.uiLang = Store.getUiLang();
    cfg.langs = Store.getSelectedLangs();

    const topicsBox = $("topics");
    Store.KEYS.forEach(key => {
      const b = document.createElement("button");
      b.dataset.v = key;
      b.setAttribute("aria-pressed", key === "mixed" ? "true" : "false");
      b.addEventListener("click", () => {
        topicsBox.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", "false"));
        b.setAttribute("aria-pressed", "true"); cfg.topic = key; generate();
      });
      topicsBox.appendChild(b);
    });

    renderLangTags();

    const wordsEl = $("words");
    wordsEl.addEventListener("input", () => { $("wordsVal").textContent = wordsEl.value; generate(); });
    const amountEl = $("amount");
    amountEl.addEventListener("input", () => { $("amountVal").textContent = amountEl.value; generate(); });

    wireSeg("sep", "sep");
    wireSeg("caps", "caps");
    wireSeg("maxlen", "maxlen");
    wireSeg("pos", "pos", () => { $("amountRow").classList.toggle("hidden", cfg.pos !== "inside"); });

    const langSel = $("uiLang");
    Object.keys(I18N).forEach(code => {
      const opt = document.createElement("option");
      opt.value = code;
      opt.textContent = I18N[code]._name || code.toUpperCase();
      opt.selected = code === cfg.uiLang;
      langSel.appendChild(opt);
    });
    langSel.addEventListener("change", () => {
      cfg.uiLang = langSel.value;
      Store.setUiLang(cfg.uiLang);
      applyLang();
      generate();
    });

    $("addNum").addEventListener("change", generate);
    $("addSym").addEventListener("change", generate);
    $("gen").addEventListener("click", generate);

    const copyBtn = $("copy");
    copyBtn.addEventListener("click", async () => {
      if (!lastPlain) return;
      try { await navigator.clipboard.writeText(lastPlain); }
      catch (e) {
        const ta = document.createElement("textarea");
        ta.value = lastPlain; document.body.appendChild(ta); ta.select();
        document.execCommand("copy"); ta.remove();
      }
      copyBtn.classList.add("copied"); copyBtn.innerHTML = "&#10003;";
      setTimeout(() => { copyBtn.classList.remove("copied"); copyBtn.innerHTML = "&#10697;"; }, 1200);
    });

    window.addEventListener("pageshow", () => { renderLangTags(); generate(); });

    applyLang();
    generate();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
