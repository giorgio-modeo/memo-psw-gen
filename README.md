# Mnemonic Password Generator

Generate passwords that are easy to remember but hard to guess, built as random word chains in the *Diceware* style (the "correct-horse-battery-staple" approach). Words are organized by **category** and available in **Italian and English**.

No dependencies, no backend, no tracking: everything runs entirely in your browser, and nothing is stored or transmitted.

## Components

The project includes two tools that share the same dictionary and generation logic:

- **Web app** — a static page (`index.html`) that runs directly in your browser.
- **Tampermonkey userscript** (`generatore-password-mnemoniche.user.js`) — a floating panel available on any website, with clipboard copy and direct insertion into password fields.

## Features

- Category-based dictionaries: mixed, work, home, nature, food, hobbies, tech, animals, travel, personal.
- Interface and word lists available in both Italian and English, switchable on the fly.
- Configurable options: number of words (1–8), separator (`- . _` space, random digit, or none), capitalization (none, initials, random, all), optional numbers and symbols.
- Extra characters can be inserted **at the end** or **inside the words** (e.g. `m9an#ub_rio`), with configurable quantity.
- Optional maximum password length (12/16/20/24 characters), consistently applied to both the password and its preview.
- Real-time entropy estimation (in bits) with a proportional strength meter.
- Cryptographically secure randomness using `crypto.getRandomValues`, including modulo-bias correction.

## Usage

### Web App

Open `index.html` in your browser (double-clicking the file is enough). Adjust the settings and click **Generate**.

Keep these four files in the same directory:

```text
pwdgen/
├── index.html      # page structure
├── styles.css      # styles
├── i18n.js         # localized data: categories, dictionaries (RAW), UI strings (I18N)
└── app.js          # logic: RNG, generation, rendering, entropy
```

The project uses classic scripts (not ES modules), so it also works when opened via `file://`. If you convert it to ES modules, you'll need a local web server, for example:

```bash
python3 -m http.server
```

### Userscript

With Tampermonkey installed, create a new userscript and paste the contents of `generatore-password-mnemoniche.user.js`, or simply save the file with the `.user.js` extension and drag it into your browser.

A 🔑 button appears in the bottom-right corner of every page, opening the generator panel. The **Insert** button writes the generated password into the last focused input field (or the first password field on the page) using the native setter, making it compatible with React, Vue, and similar frameworks.

The default match rule is `*://*/*` (all websites). Edit the `@match` directive or add `@exclude` rules to limit where the userscript runs.

## Security and Entropy

The estimated entropy is based on the number of words and the size of the selected dictionary (the "mixed" category has the largest word pool, while individual categories are smaller and therefore provide fewer bits per word). Random capitalization, numbers, and symbols increase entropy, whereas "initial capitals" or "all capitals" are deterministic transformations and do **not** add real entropy.

The entropy estimate is intended as a comparison between configurations, not as a security guarantee. For sensitive use cases, prefer longer passphrases (more words) and enable additional random characters.

## Customization

To add or modify words, categories, or languages, simply edit `i18n.js`:

- `KEYS` defines the available categories.
- `RAW` contains the word lists for each language.
- `I18N` contains the interface translations.

The generation logic in `app.js` does not need to be modified.

## License

GPL v3.