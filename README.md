# Bilal Adam — Portfolio

A small personal portfolio site built for COMP 494 at the University of San Diego.
It serves as a public facing introduction (about, résumé, projects, contact) and
demonstrates a working web application component built with vanilla JavaScript.

**Live site:** _https://bilal-portfolio.beezee1113.workers.dev_

---

## Stack

- **HTML5** — hand-authored, semantic markup (`<main>`, `<article>`, `<section>`, `<nav>`, `<header>`, `<footer>`)
- **CSS** — hand authored, no framework. Uses custom properties for theming, CSS Grid and Flexbox for layout, `clamp()` and relative units (`rem`, `ch`, `vw`) for fluid sizing, and `prefers-color-scheme` for automatic dark mode.
- **JavaScript** — vanilla ES modules. No framework, no bundler, no build step. JavaScript is layered on as a progressive enhancement — the site is fully usable without it.
- **Web component** — the API demo is a custom element (`<weather-card>`) using Light DOM.

No frameworks (React, Vue, Svelte, Angular) are used anywhere in the project.

## Pages

| Route | Purpose |
|---|---|
| `/` (index.html) | Home / About |
| `/resume.html` | Résumé as a routed page (not just a PDF) |
| `/projects.html` | Project list, including the live weather demo |
| `/contact.html` | Working contact form |

## Application demo

The Projects page includes `<weather-card>`, a custom element written in vanilla
JavaScript. It:

- Fetches current conditions for San Diego from the
  [Open-Meteo API](https://open-meteo.com/) (`https://api.open-meteo.com/v1/forecast`)
- Parses the JSON response
- Renders temperature, "feels like", humidity, wind, and a human-readable
  description (mapped from WMO weather codes)
- Shows a loading state while fetching
- Handles errors gracefully (network failure, unexpected response shape)
- Exposes `city`, `lat`, and `lon` as observed attributes so the component is reusable

The API was chosen because it requires no key, is free for non-commercial use,
and returns clean JSON.

## Additional web components (extra credit)

The site uses a coordinated set of custom elements across multiple pages, all
sharing design tokens:

- **`<weather-card>`** — the primary API demo described above (Projects page).
- **`<github-stats>`** — a second API widget on the Projects page that fetches
  live profile stats (public repos, followers, following, account age) from the
  [GitHub REST API](https://docs.github.com/en/rest/users/users).
  Same architecture as the weather card: real fetch, JSON parsing, loading and
  error states, defensive shape checking.
- **`<theme-toggle>`** — a button in the site header on every page that flips
  between dark and light themes. Persists the user's choice in `localStorage`
  and falls back to `prefers-color-scheme` when no choice is saved. Without
  JavaScript the toggle isn't visible and the OS preference continues to drive
  the theme via the existing `@media` rule.
- **`<copy-button>`** — on the contact page, wraps the email address so visitors
  can copy it to the clipboard with one click. Without JavaScript, the
  underlying `mailto:` link remains visible and functional.

## Running locally

This is a static site with no build step. Open `index.html` in a browser, or
serve the folder with any static server:

```bash
# Option 1 — VS Code Live Server extension
# Right-click index.html → "Open with Live Server"

# Option 2 — Python (already installed on macOS)
python3 -m http.server 8000
# then open http://localhost:8000

# Option 3 — Node.js
npx serve .
```

## Deploying

The site is deployed to **Cloudflare Pages**. To deploy your own copy:

1. Push this repo to GitHub
2. Sign in at [pages.cloudflare.com](https://pages.cloudflare.com)
3. "Create a project" → connect the GitHub repo
4. Framework preset: **None**
5. Build command: _(leave blank)_
6. Build output directory: `/`
7. Save and deploy

## Contact form

The contact form posts to [Formspree](https://formspree.io). Replace
`YOUR_FORMSPREE_ID` in `contact.html` with the form ID from your Formspree dashboard
before deploying. The form works without JavaScript (standard POST submission); if
JavaScript is available, `main.js` intercepts the submit and uses `fetch()` for a
smoother UX.

## Accessibility

- Skip link for keyboard users
- Semantic landmarks and heading order
- All form inputs have associated `<label>` elements
- Native HTML5 validation (`required`, `type="email"`, `minlength`)
- `aria-live` regions for the weather widget and form status
- `prefers-reduced-motion` respected
- Colors meet WCAG AA contrast in both light and dark modes

## File structure

```
.
├── index.html          # Home / About
├── resume.html         # Résumé page
├── projects.html       # Projects + weather demo + github-stats demo
├── contact.html        # Contact form
├── styles/
│   └── main.css        # All styles
├── scripts/
│   ├── main.js         # Progressive enhancements (nav, form)
│   ├── weather-card.js # <weather-card> custom element
│   ├── github-stats.js # <github-stats> custom element
│   ├── theme-toggle.js # <theme-toggle> custom element
│   └── copy-button.js  # <copy-button> custom element
└── README.md
```

---

Built by [Bilal Adam](https://www.linkedin.com/in/bilal-adam1/) for COMP 494, Spring 2026.
