/* ============================================================
   Store: unisce i dizionari incorporati (dictionaries.js) con
   quelli personalizzati salvati in localStorage. Espone Store.
   Dipende da: dictionaries.js (KEYS, BUILTIN, DICT_META)
   ============================================================ */
const Store = (function () {
  "use strict";
  const LS_DICTS = "pwdgen_custom_dicts"; // { code:{label, words:{theme:[...]}} }
  const LS_UI = "pwdgen_ui_lang";
  const LS_SEL = "pwdgen_selected_langs";

  function readJSON(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; }
    catch (e) { return fallback; }
  }
  function writeJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { return false; }
  }

  function getCustom() { return readJSON(LS_DICTS, {}); }
  function saveCustom(obj) { return writeJSON(LS_DICTS, obj); }

  /* Normalizza testo -> array di parole pulite e deduplicate. */
  function parseWords(text) {
    return [...new Set(
      String(text).split(/[\s,;\n\r\t]+/).map(w => w.trim().toLowerCase()).filter(Boolean)
    )];
  }

  /* Elenco lingue disponibili: incorporate + personalizzate. */
  function listLanguages() {
    const out = [];
    for (const code of Object.keys(BUILTIN)) out.push({ code, label: DICT_META[code] ? DICT_META[code].label : code, builtin: true });
    const custom = getCustom();
    for (const code of Object.keys(custom)) out.push({ code, label: custom[code].label || code, builtin: false });
    return out;
  }

  /* Parole di una lingua per un tema. "mixed" = unione di tutti i temi. */
  function wordsFor(code, theme) {
    const src = BUILTIN[code] ? BUILTIN[code] : (getCustom()[code] ? getCustom()[code].words : null);
    if (!src) return [];
    const toArr = v => Array.isArray(v) ? v : (typeof v === "string" ? v.split(" ") : []);
    if (theme === "mixed") {
      const all = [];
      for (const k of KEYS) { if (k !== "mixed" && src[k]) all.push(...toArr(src[k])); }
      return [...new Set(all)];
    }
    return src[theme] ? [...new Set(toArr(src[theme]))] : [];
  }

  /* Pool = unione delle parole delle lingue selezionate per il tema. */
  function buildPool(codes, theme) {
    const all = [];
    for (const code of codes) all.push(...wordsFor(code, theme));
    return [...new Set(all)];
  }

  /* CRUD dizionari personalizzati. */
  function upsertCustom(code, label, wordsByTheme) {
    const c = getCustom();
    c[code] = { label: label || code, words: wordsByTheme || {} };
    return saveCustom(c);
  }
  function deleteCustom(code) { const c = getCustom(); delete c[code]; return saveCustom(c); }

  /* Aggiunge parole a (lingua personalizzata, tema). Crea se assente. */
  function addWords(code, theme, wordsArr) {
    const c = getCustom();
    if (!c[code]) c[code] = { label: code, words: {} };
    const existing = new Set((c[code].words[theme] || []));
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
    getUiLang, setUiLang, getSelectedLangs, setSelectedLangs
  };
})();
