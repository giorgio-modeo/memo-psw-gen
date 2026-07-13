/* ============================================================
   Editor dizionari. Dipende da: i18n.js (I18N), store.js (Store),
   config.js (KEYS, BUILTIN, DICT_META).
   ============================================================ */
(function () {
  "use strict";

  let uiLang = "it";
  let selDict = "it";   // dizionario selezionato
  let selTheme = "work"; // tema selezionato (non "mixed" nell'editor)

  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

  /* ---- i18n ---- */
  function T(key) {
    const T = I18N[uiLang] || I18N.it;
    return T[key] != null ? T[key] : key;
  }

  function applyLang() {
    document.documentElement.lang = uiLang;
    document.title = T("ed_title");
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const k = el.dataset.i18n;
      const v = T(k);
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const k = el.dataset.i18nPlaceholder;
      const v = T(k);
      if (v != null) el.placeholder = v;
    });
    const langSel = $("uiLang");
    if (langSel) langSel.value = uiLang;
  }

  /* ---- Toast ---- */
  let toastTimer;
  function toast(msg) {
    const el = $("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2000);
  }

  /* ================================================================
     PINNED WORDS
  ================================================================ */
  function renderPinned() {
    const list = $("pinnedList");
    const words = Store.getPinnedWords();
    if (!words.length) {
      list.innerHTML = `<span style="font-size:13px;color:var(--ink-faint)">${esc(T("pinned_empty"))}</span>`;
    } else {
      list.innerHTML = words.map(w =>
        `<span class="word-chip pinned-chip">${esc(w)}<button class="del" data-w="${esc(w)}">&#x2715;</button></span>`
      ).join("");
      list.querySelectorAll(".del").forEach(btn =>
        btn.addEventListener("click", () => {
          Store.removePinnedWord(btn.dataset.w);
          renderPinned();
        })
      );
    }
  }

  function addPinned(raw) {
    const words = Store.parseWords(raw);
    words.forEach(w => Store.addPinnedWord(w));
    if (words.length) { $("pinnedInput").value = ""; renderPinned(); toast(T("ed_saved")); }
  }

  /* ================================================================
     DICTIONARY TABS
  ================================================================ */
  function allDicts() {
    const builtins = Object.keys(DICT_META).map(code => ({
      code, label: DICT_META[code].label, builtin: true
    }));
    const customs = Store.listLanguages().filter(l => !l.builtin);
    return [...builtins, ...customs];
  }

  function renderDictTabs(showNewForm) {
    const dicts = allDicts();
    if (!dicts.some(d => d.code === selDict)) selDict = dicts[0]?.code || "it";

    const tabs = dicts.map(d =>
      `<button class="dict-tab${d.code === selDict ? " active" : ""}" data-code="${esc(d.code)}">`
      + `${esc(d.label)}${d.builtin ? "" : " &bull;"}</button>`
    ).join("") +
      `<button class="dict-tab new-tab" id="newDictBtn">${esc(T("ed_new_dict"))}</button>`;

    $("dictTabs").innerHTML = tabs;

    $("dictTabs").querySelectorAll(".dict-tab:not(.new-tab)").forEach(btn =>
      btn.addEventListener("click", () => {
        selDict = btn.dataset.code;
        selTheme = "work";
        renderDictTabs();
        renderEditor();
      })
    );

    $("newDictBtn").addEventListener("click", () => {
      renderDictTabs();
      renderNewDictForm();
    });

    if (!showNewForm) renderEditor();
  }

  /* ================================================================
     EDITOR AREA
  ================================================================ */
  function renderEditor() {
    const isBuiltin = !!BUILTIN[selDict];
    const topics = (I18N[uiLang] || I18N.it).topics || {};

    const themeTabs = KEYS
      .filter(k => k !== "mixed")
      .map(k =>
        `<button class="theme-tab${k === selTheme ? " active" : ""}" data-k="${k}">`
        + `${esc(topics[k] || k)}</button>`
      ).join("");

    const { builtinWords, extWords, customWords } = getWords(selDict, selTheme, isBuiltin);
    const wordListHtml = buildWordListHtml(isBuiltin, builtinWords, extWords, customWords);

    const targetTheme = selTheme === "mixed" ? "work" : selTheme;
    const delBtn = !isBuiltin
      ? `<button class="del-dict-btn" id="delDictBtn">${esc(T("ed_delete"))}</button>`
      : "";

    $("dictEditor").innerHTML = `
      ${isBuiltin ? `<p class="builtin-note">${esc(T("ed_builtin"))} &mdash; ${esc(T("ed_readonly"))}</p>` : ""}
      <div class="theme-tabs" id="themeTabs">${themeTabs}</div>
      <div class="word-list" id="wordList">${wordListHtml}</div>
      <div class="add-row" style="margin-bottom:10px">
        <input type="text" id="wordInput" placeholder="${esc(T("ed_add_word"))}">
        <button class="add-btn" id="wordAddBtn">${esc(T("ed_add"))}</button>
      </div>
      <div class="ed-actions">
        <label class="upload-btn">${esc(T("ed_upload"))}
          <input type="file" id="uploadFile" accept=".txt" style="display:none">
        </label>
        ${delBtn}
      </div>
    `;

    /* theme tabs */
    $("themeTabs").querySelectorAll(".theme-tab").forEach(btn =>
      btn.addEventListener("click", () => { selTheme = btn.dataset.k; renderEditor(); })
    );

    /* delete word chips */
    $("wordList").querySelectorAll(".del[data-w]").forEach(btn =>
      btn.addEventListener("click", () => {
        const w = btn.dataset.w, th = btn.dataset.t;
        if (isBuiltin) Store.removeExtWord(selDict, th, w);
        else Store.removeWord(selDict, th, w);
        renderEditor();
      })
    );

    /* add word */
    const wi = $("wordInput");
    const doAdd = () => {
      const words = Store.parseWords(wi.value);
      if (!words.length) return;
      if (isBuiltin) words.forEach(w => Store.addExtWord(selDict, targetTheme, w));
      else Store.addWords(selDict, targetTheme, words);
      wi.value = "";
      toast(T("ed_saved"));
      renderEditor();
    };
    $("wordAddBtn").addEventListener("click", doAdd);
    wi.addEventListener("keydown", e => { if (e.key === "Enter") doAdd(); });

    /* upload */
    $("uploadFile").addEventListener("change", async e => {
      const file = e.target.files[0]; if (!file) return;
      const words = Store.parseWords(await file.text());
      if (!words.length) return;
      if (isBuiltin) words.forEach(w => Store.addExtWord(selDict, targetTheme, w));
      else Store.addWords(selDict, targetTheme, words);
      toast(`${words.length} ${T("ed_added")}`);
      renderEditor();
      e.target.value = "";
    });

    /* delete dict */
    if (!isBuiltin && $("delDictBtn")) {
      $("delDictBtn").addEventListener("click", () => {
        if (!confirm(T("ed_confirm_del"))) return;
        Store.deleteCustom(selDict);
        selDict = allDicts()[0]?.code || "it";
        selTheme = "work";
        renderDictTabs();
      });
    }
  }

  /* ---- Helpers word list ---- */
  function getWords(code, theme, isBuiltin) {
    const toArr = v => Array.isArray(v) ? v : (typeof v === "string" ? v.split(" ") : []);
    if (isBuiltin) {
      const src = BUILTIN[code] || {};
      const builtinWords = src[theme] ? [...new Set(toArr(src[theme]))] : [];
      const extWords = Store.getExtWordsFor(code, theme).map(w => ({ w, theme }));
      return { builtinWords, extWords, customWords: [] };
    } else {
      const c = Store.getCustom()[code];
      const words = c && c.words && c.words[theme]
        ? (Array.isArray(c.words[theme]) ? c.words[theme] : []).map(w => ({ w, theme }))
        : [];
      return { builtinWords: [], extWords: [], customWords: words };
    }
  }

  function buildWordListHtml(isBuiltin, builtinWords, extWords, customWords) {
    const emptyMsg = `<span style="font-size:13px;color:var(--ink-faint)">${esc(T("ed_empty"))}</span>`;
    if (isBuiltin) {
      if (!builtinWords.length && !extWords.length) return emptyMsg;
      const bChips = builtinWords.map(w =>
        `<span class="word-chip builtin" title="${esc(T("ed_builtin"))}">${esc(w)}</span>`
      ).join("");
      const eChips = extWords.map(({ w, theme }) =>
        `<span class="word-chip ext">${esc(w)}<button class="del" data-w="${esc(w)}" data-t="${esc(theme)}">&#x2715;</button></span>`
      ).join("");
      return bChips + eChips;
    } else {
      if (!customWords.length) return emptyMsg;
      return customWords.map(({ w, theme }) =>
        `<span class="word-chip custom">${esc(w)}<button class="del" data-w="${esc(w)}" data-t="${esc(theme)}">&#x2715;</button></span>`
      ).join("");
    }
  }

  /* ================================================================
     NEW DICT FORM
  ================================================================ */
  function renderNewDictForm() {
    $("dictEditor").innerHTML = `
      <div class="new-dict-form">
        <div class="field">
          <label>${esc(T("ed_code"))}</label>
          <input type="text" id="newCode" placeholder="de, fr, mio..." maxlength="10">
        </div>
        <div class="field">
          <label>${esc(T("ed_name"))}</label>
          <input type="text" id="newName" placeholder="Deutsch, Français...">
        </div>
        <div class="form-btns">
          <button class="add-btn" id="createBtn">${esc(T("ed_create"))}</button>
          <button class="cancel-btn" id="cancelBtn">&#x2715;</button>
        </div>
        <p class="error" id="newDictErr"></p>
      </div>
    `;

    $("createBtn").addEventListener("click", () => {
      const code = $("newCode").value.trim().toLowerCase();
      const name = $("newName").value.trim();
      if (!code || !/^[a-z0-9_-]{1,10}$/.test(code)) {
        $("newDictErr").textContent = T("ed_badcode"); return;
      }
      if (BUILTIN[code] || Store.getCustom()[code]) {
        $("newDictErr").textContent = T("ed_exists"); return;
      }
      Store.upsertCustom(code, name || code, {});
      selDict = code; selTheme = "work";
      renderDictTabs();
    });

    $("cancelBtn").addEventListener("click", () => renderEditor());
  }

  /* ================================================================
     INIT
  ================================================================ */
  function init() {
    uiLang = Store.getUiLang();
    applyLang();

    /* lang switcher */
    const langSel = $("uiLang");
    Object.keys(I18N).forEach(code => {
      const opt = document.createElement("option");
      opt.value = code;
      opt.textContent = I18N[code]._name || code.toUpperCase();
      opt.selected = code === uiLang;
      langSel.appendChild(opt);
    });
    langSel.addEventListener("change", () => {
      uiLang = langSel.value;
      Store.setUiLang(uiLang);
      applyLang();
      renderPinned();
      renderDictTabs();
    });

    /* pinned add */
    const pi = $("pinnedInput");
    $("pinnedAdd").addEventListener("click", () => addPinned(pi.value));
    pi.addEventListener("keydown", e => { if (e.key === "Enter") addPinned(pi.value); });

    renderPinned();
    renderDictTabs();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
