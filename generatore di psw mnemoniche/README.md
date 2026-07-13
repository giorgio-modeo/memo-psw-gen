# Generatore di password mnemoniche

Genera password facili da ricordare ma difficili da indovinare, costruite come catene di parole casuali in stile *diceware* (l'approccio "correct-horse-battery-staple"). Le parole sono organizzate per **tema** e disponibili in **italiano e inglese**.

Nessuna dipendenza, nessun backend, niente tracciamento: tutto gira nel browser e nulla viene salvato o inviato.

## Componenti

Il progetto include due strumenti che condividono lo stesso dizionario e la stessa logica:

- **Web app** — una pagina statica (`index.html`) da aprire nel browser.
- **Userscript Tampermonkey** (`generatore-password-mnemoniche.user.js`) — un pannello flottante disponibile su qualsiasi sito, con copia negli appunti e inserimento diretto nel campo password.

## Caratteristiche

- Dizionari a tema: misto, lavoro, casa, natura, cibo, hobby, tech, animali, viaggio, personale.
- Interfaccia e parole in italiano o inglese, commutabili al volo.
- Parametri regolabili: numero di parole (1–8), separatore (`- . _` spazio, cifra casuale o nessuno), maiuscole (nessuna, iniziali, casuali, tutte), aggiunta di numeri e simboli.
- Caratteri extra posizionabili **in coda** oppure **dentro le parole** (es. `m9an#ub_rio`), con quantità regolabile.
- Limite di lunghezza massima opzionale (12/16/20/24 caratteri) con taglio coerente tra testo e anteprima.
- Stima dell'entropia in bit, aggiornata in tempo reale, con barra di robustezza proporzionale.
- Casualità crittografica tramite `crypto.getRandomValues`, con correzione del modulo-bias.

## Uso

### Web app

Apri `index.html` nel browser (anche con doppio clic). Regola i parametri e premi **Genera**.

I quattro file vanno tenuti nella stessa cartella:

```
pwdgen/
├── index.html      # struttura della pagina
├── styles.css      # stili
├── i18n.js         # dati localizzati: temi, dizionari (RAW), stringhe UI (I18N)
└── app.js          # logica: RNG, generazione, rendering, entropia
```

Sono usati script classici (non moduli ES), quindi la pagina funziona anche da `file://`. Per una versione a moduli ES servirebbe un server locale, ad esempio `python3 -m http.server`.

### Userscript

Con [Tampermonkey](https://www.tampermonkey.net/) installato, crea un nuovo script e incolla il contenuto di `generatore-password-mnemoniche.user.js`, oppure salva il file con estensione `.user.js` e trascinalo nel browser.

Nella pagina compare un pulsante 🔑 in basso a destra che apre il pannello. Il pulsante **Inserisci** scrive la password nell'ultimo campo messo a fuoco (o nel primo campo password della pagina) usando il setter nativo, così funziona anche con form React/Vue.

Il match di default è `*://*/*` (tutti i siti): modifica la riga `@match` o aggiungi `@exclude` per restringerlo.

## Sicurezza ed entropia

L'entropia stimata deriva dal numero di parole e dalla dimensione del dizionario in uso (il tema "misto" ha il pool più ampio; i temi singoli, più piccoli, riducono i bit per parola). Numeri, simboli e maiuscole *casuali* aumentano la robustezza; le maiuscole *iniziali* o *tutte* sono trasformazioni deterministiche e non aggiungono entropia reale.

La stima è indicativa e serve a confrontare le configurazioni, non è una garanzia. Per usi importanti conviene puntare su più parole e attivare gli extra.

## Personalizzazione

Per aggiungere o modificare parole, temi o lingue basta intervenire su `i18n.js`: `KEYS` elenca i temi, `RAW` contiene le liste di parole per lingua, `I18N` le stringhe dell'interfaccia. La logica in `app.js` non va toccata.

## Licenza

MIT.
