# Mohamed Metwalli — portfolio

A React + TypeScript site with three pages:

- **Home** — your name drawn as a scatter plot that converges into the letters, your experience on a time axis, and your skills.
- **Projects** — a project list, currently holding the MM AUTO placeholder.
- **Contact** — a validated contact form.

Built with Vite, React 19, React Router and Motion. The palette comes from viridis, matplotlib's default colormap; the typeface is Archivo, used wide for headlines.

## Run it

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm run build      # type-check and build to dist/
npm run preview    # serve the production build locally
npm run typecheck  # type-check only
```

## Edit the content

All text about you lives in two files:

| File | What it holds |
| --- | --- |
| `src/data/profile.ts` | Name, location, intro line, experience milestones, skills |
| `src/data/projects.ts` | Projects. Add an entry to add a card; remove `placeholder` once MM AUTO has details, and add `href` to link out |

The January 2023 milestone has no company on purpose. Add `org: 'Altair'` (or the right name) if you want one shown.

## Connect the contact form

Until it's connected, the form runs in preview mode: it validates and animates, then tells the visitor nothing was sent.

1. Create a free form at [formspree.io](https://formspree.io) and copy its endpoint.
2. Copy `.env.example` to `.env` and set `VITE_CONTACT_ENDPOINT` to that URL.
3. Restart `npm run dev`, or rebuild.

The form posts JSON (`name`, `email`, `subject`, `message`), so any service or serverless function that accepts a JSON POST works too. It includes a hidden `_gotcha` field that Formspree uses to filter spam.

## Deploy

`npm run build` produces a static site in `dist/`.

Clean URLs like `/projects` need the host to serve `index.html` for every path. That's already set up for the common hosts:

- **Vercel:** `vercel.json` holds the rewrite.
- **Netlify:** `public/_redirects` holds the rule.
- **Cloudflare Pages:** works as is.
- **GitHub Pages:** set `VITE_ROUTER=hash` before building so links become `/#/projects`.

## Project structure

```
src/
  data/            profile.ts, projects.ts (your content)
  pages/           Home, Projects, Contact, NotFound
  components/
    hero/          ParticleName (canvas scatter-to-name), Hero
    home/          Experience (time axis), Skills, ContactCta
    projects/      ProjectCard, AgentGraph (MM AUTO illustration)
    contact/       ContactForm, SuccessMark
    layout/        Navbar, MobileMenu, Page (route transitions), Footer, Backdrop
    ui/            Button, Magnetic, RollText, ScatterTitle, LocalTime, Monogram
  lib/             contact.ts (form submission), viridis.ts, hooks.ts
  styles/          global.css (design tokens)
```

## Motion and accessibility

- Visitors who set "reduce motion" in their OS get static versions: the name appears formed, page changes cross-fade, and looping animations stop.
- The name in the hero is a canvas, so the page also has a real `<h1>` for screen readers and search engines.
- Keyboard: a skip link, visible focus styles, and a mobile menu that traps focus and closes with Escape.
