/* Temi disponibili. "mixed" e' calcolato a runtime come unione. */
const KEYS = ["mixed","work","home","nature","food","hobby","tech","animals","travel","personal"];

/* Etichette dei dizionari incorporati (nomi delle lingue). */
const DICT_META = {
  it: { label: "Italiano" },
  en: { label: "English" }
};

/* Unisce i dizionari per lingua. Dipende da: ita_dictionary.js, eng_dictionary.js */
const BUILTIN = {
  it: ITA_DICT,
  en: ENG_DICT
};
