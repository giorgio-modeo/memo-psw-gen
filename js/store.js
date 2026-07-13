/* ============================================================
   Store: unisce dizionari built-in + extensions + custom.
   Dipende da: js/config.js (KEYS, BUILTIN, DICT_META)
   ============================================================ */
const Store = (function () {
  "use strict";

  const LS_DICTS   = "pwdgen_custom_dicts"; // { code:{label, words:{theme:[...]}} }
  const LS_EXT     = "pwdgen_ext_dicts";    // { code:{theme:[...]} } overlay su built-in
  const LS_PINNED  = "pwdgen_pinned";       // [word, ...]
  const LS_UI      = "pwdgen_ui_lang";
  const LS_SEL     = "pwdgen_selected_langs";

  function readJSON(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; }
    catch (e) { return fallback; }
  }
  function writeJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { return false; }
  }

  /* ---- Custom dicts ---- */
  function getCustom() { return readJSON(LS_DICTS, {}); }
  function saveCustom(obj) { return writeJSON(LS_DICTS, obj); }

  function parseWords(text) {
    return [...new Set(
      String(text).split(/[\s,;\n\r\t]+/).map(w => w.trim().toLowerCase()).filter(Boolean)
    )];
  }

  function listLanguages() {
    const out = [];
    for (const code of Object.keys(BUILTIN))
      out.push({ code, label: DICT_META[code] ? DICT_META[code].label : code, builtin: true });
    const custom = getCustom();
    for (const code of Object.keys(custom))
      out.push({ code, label: custom[code].label || code, builtin: false });
    return out;
  }

  function upsertCustom(code, label, wordsByTheme) {
    const c = getCustom();
    c[code] = { label: label || code, words: wordsByTheme || {} };
    return saveCustom(c);
  }
  function deleteCustom(code) { const c = getCustom(); delete c[code]; return saveCustom(c); }

  function addWords(code, theme, wordsArr) {
    const c = getCustom();
    if (!c[code]) c[code] = { label: code, words: {} };
    const existing = new Set(c[code].words[theme] || []);
    wordsArr.forEach(w => existing.add(w));
    c[code].words[theme] = [...existing];
    return saveCustom(c);
  }
  function removeWord(code, theme, word) {
    const c = getCustom();
    if (c[code] && c[code].words[theme]) {
      c[code].words[theme] = c[code].words[theme].filter(w => w !== word);
      saveCustom(c);
    }
  }

  /* ---- Extensions (overlay su built-in) ---- */
  function getExt() { return readJSON(LS_EXT, {}); }
  function saveExt(obj) { return writeJSON(LS_EXT, obj); }

  function getExtWordsFor(code, theme) {
    const ext = getExt();
    return (ext[code] && ext[code][theme]) ? [...ext[code][theme]] : [];
  }
  function addExtWord(code, theme, word) {
    const ext = getExt();
    if (!ext[code]) ext[code] = {};
    if (!ext[code][theme]) ext[code][theme] = [];
    if (!ext[code][theme].includes(word)) ext[code][theme].push(word);
    return saveExt(ext);
  }
  function removeExtWord(code, theme, word) {
    const ext = getExt();
    if (ext[code] && ext[code][theme]) {
      ext[code][theme] = ext[code][theme].filter(w => w !== word);
      saveExt(ext);
    }
  }

  /* ---- Pinned words ---- */
  function getPinnedWords() { return readJSON(LS_PINNED, []); }
  function addPinnedWord(word) {
    const p = getPinnedWords();
    if (!p.includes(word)) { p.push(word); writeJSON(LS_PINNED, p); }
  }
  function removePinnedWord(word) {
    writeJSON(LS_PINNED, getPinnedWords().filter(w => w !== word));
  }

  /* ---- Pool building ---- */
  function wordsFor(code, theme) {
    const src = BUILTIN[code]
      ? BUILTIN[code]
      : (getCustom()[code] ? getCustom()[code].words : null);
    if (!src) return [];
    const toArr = v => Array.isArray(v) ? v : (typeof v === "string" ? v.split(" ") : []);
    if (theme === "mixed") {
      const all = [];
      for (const k of KEYS) {
        if (k === "mixed") continue;
        if (src[k]) all.push(...toArr(src[k]));
        if (BUILTIN[code]) all.push(...getExtWordsFor(code, k));
      }
      return [...new Set(all)];
    }
    const base = src[theme] ? [...new Set(toArr(src[theme]))] : [];
    const ext  = BUILTIN[code] ? getExtWordsFor(code, theme) : [];
    return [...new Set([...base, ...ext])];
  }

  function buildPool(codes, theme) {
    const all = [];
    for (const code of codes) all.push(...wordsFor(code, theme));
    return [...new Set(all)];
  }

  /* ---- Prefs ---- */
  function getUiLang() { return localStorage.getItem(LS_UI) || "it"; }
  function setUiLang(l) { try { localStorage.setItem(LS_UI, l); } catch (e) {} }
  function getSelectedLangs() {
    const s = readJSON(LS_SEL, null);
    if (Array.isArray(s) && s.length) return s;
    return ["it"];
  }
  function setSelectedLangs(arr) { writeJSON(LS_SEL, arr); }

  return {
    KEYS,
    parseWords, listLanguages, wordsFor, buildPool,
    getCustom, upsertCustom, deleteCustom, addWords, removeWord,
    getExt, getExtWordsFor, addExtWord, removeExtWord,
    getPinnedWords, addPinnedWord, removePinnedWord,
    getUiLang, setUiLang, getSelectedLangs, setSelectedLangs
  };
})();
