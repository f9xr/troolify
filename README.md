# Troolify

Free, fast, 100% client-side online tools hub by the [F9XR Team](https://f9xr.github.io/).

Every tool runs entirely in your browser. Your text, files, and data never leave your device. No accounts, no uploads, no tracking.

**Live site:** https://f9xr.github.io/troolify/

## Features

- **Privacy first** - all processing happens locally in the browser tab.
- **Free forever** - no sign-ups, no paywalls, no hidden costs.
- **Lightweight** - static HTML/JS/CSS, no bundler or framework, hosted on GitHub Pages.

## Tools

| Tool | Category | Description |
|------|----------|-------------|
| [Word Counter](tools/text/word-counter.html) | Text | Live word, character, sentence and reading-time stats. |
| [Numeronym Generator](tools/text/numeronym-generator.html) | Text | Turn any phrase into an i18n-style numeronym, or decode one. |
| [JSON Formatter](tools/coding/json-formatter.html) | Coding | Format, validate, minify and copy JSON instantly. |
| [Code Beautifier](tools/coding/code-beautifier.html) | Coding | Turn source code into syntax-highlighted self-contained HTML. |
| [Schema Markup Generator](tools/seo/schema-markup-generator.html) | SEO | Create JSON-LD schema for LocalBusiness, Product, Article, FAQPage, Event and Review. |
| [YouTube Timestamp Link Generator](tools/youtube/timestamp-link-generator.html) | YouTube | Clickable timestamp links and video-description chapters. |
| [Song Length Calculator](tools/audio/song-length-calculator.html) | Audio | Calculate exact track runtime from BPM and bar repetitions. |
| [Password Generator](tools/misc/password-generator.html) | Misc | Strong random passwords or memorable passphrases with custom rules. |
| [Password Entropy Calculator](tools/misc/password-entropy-calculator.html) | Misc | Measure entropy in bits and estimate crack time across attack scenarios. |

Browse every tool and category in the [utility catalog](tools/index.html).

## Tech stack

- Hand-authored HTML5 (dark, responsive interfaces)
- Tailwind CSS (compiled `assets/css/tailwind.css`) plus custom stylesheets
- Vanilla JavaScript (no framework)
- Font Awesome icons, Plus Jakarta Sans from Google Fonts
- Schema.org JSON-LD structured data (SoftwareApplication, Article, FAQPage, BreadcrumbList, VideoObject)
- Hosted and auto-deployed on GitHub Pages

## Project structure

```
├── index.html               # Homepage
├── 404.html                 # Custom 404 page
├── tools.html               # Tools overview
├── assets/
│   ├── css/                 # Stylesheets (tailwind, tool, site-shell, seo-article, ...)
│   ├── js/                  # layout.js, tool-page.js, tools-data.js, catalog, script.js, ...
│   └── images/              # OG image, favicons, logos
├── tools/<category>/        # Tool pages (text, coding, audio, seo, youtube, misc, ...)
├── pages/                   # About, contact, privacy, terms, sitemap, ...
└── press/                   # Editorial policies, disclaimer
```

## Search engine / AI discovery files

- `sitemap.xml` - XML sitemap for Google
- `robots.txt` - crawler rules
- `llms.txt` - site summary for LLM / AI agents

## Development

The site is plain static HTML with a single Tailwind build step:

```bash
# Build Tailwind (if you edit tailwind config or src/input.css)
npx tailwindcss -i ./src/input.css -o ./assets/css/tailwind.css --minify
```

### Adding a new tool

1. Create `tools/<category>/<slug>.html` following the structure in `tools/text/word-counter.html`.
2. Add the tool entry to `assets/js/tools-data.js`.
3. Add its URL to `sitemap.xml`.
4. Add a bullet to the Tools section in `llms.txt`.
5. Add a crawler-visible card to the category page and update the homepage category count.

## Deployment

Push to the `main` branch. GitHub Pages builds and deploys automatically at
`https://f9xr.github.io/troolify/`.

## License

Code is open source under the repository license (see [LICENSE](LICENSE)). Website
content copyright (c) 2026 Troolify / F9XR Team. All rights reserved.
