# Warmline — Personal CRM

A CRM built for one job: keeping you from losing touch with clients you're too
busy to follow up with. Every client shows a "cold clock" — a ring that fills
in and shifts from fresh to cold the longer it's been since you last talked.

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## Adding AI features (optional)

The AI draft/insight features call the Anthropic API directly from your
browser. To use them:

1. Get an API key at [console.anthropic.com](https://console.anthropic.com/settings/keys).
2. In the app, click **Settings** in the sidebar and paste your key in.

The app works fully without a key — you just won't be able to generate
AI drafts or insights.

### A note on how this works (read before sharing this app with anyone)

This project calls `api.anthropic.com` straight from the browser, using
whatever key you paste into Settings. That's fine for **running this on your
own machine, for yourself** — the key never leaves your browser except to go
straight to Anthropic. It is **not safe to deploy publicly as-is**: anyone
who opens their browser's dev tools while using the app could read the key
out of the network requests.

If you want to put this online for other people to use, move the call in
`src/lib/ai.js` to a small backend (even a single serverless function) that
holds the API key server-side and proxies the request. Everything else in
this app — the UI, the data model, local storage — works unchanged.

## Data storage

All client data is stored in your browser's `localStorage`, under you and
only you. There's no backend, no database, no account. Clearing your
browser's site data for this app will erase it — there's no built-in
export/import yet, so treat this as a personal tool on a machine you
control, not a permanent system of record, until you add real persistence.

## Project structure

```
warmline-crm/
├── index.html                 Vite entry HTML
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx                React root
│   ├── App.jsx                 App shell: routing state, drawers, modals
│   ├── App.css                 All component styles (design tokens live here)
│   ├── index.css               Global reset + font import
│   ├── lib/
│   │   ├── constants.js        Stages, priorities, channels, storage keys
│   │   ├── helpers.js          Date math, formatting, the "heat" logic
│   │   ├── seedData.js         Demo clients shown on first run
│   │   ├── storage.js          localStorage read/write helpers
│   │   └── ai.js                Anthropic API calls + prompt builders
│   └── components/
│       ├── Sidebar.jsx
│       ├── Dashboard.jsx
│       ├── ClientsView.jsx
│       ├── PipelineView.jsx
│       ├── ClientDrawer.jsx    Client profile: details / activity / AI tabs
│       ├── NewClientModal.jsx
│       ├── SettingsModal.jsx   API key entry
│       └── ui/
│           ├── ColdClock.jsx   The ring indicator
│           └── Badges.jsx      Heat / stage / priority pills
```

## What's deliberately out of scope

- **No real Gmail / WhatsApp / LinkedIn sending.** The AI writes the message;
  you copy it into the real app and send it yourself. Wiring up actual
  sending needs OAuth and a backend per provider — a real next project, not
  a few-file addition.
- **No multi-device sync.** Data lives in one browser's `localStorage`. If
  you want this on your phone and laptop, you'll need a real database and
  some form of auth.
- **Pipeline stages are simplified** to six (New Lead → Contacted →
  Follow-Up → Proposal Sent → Won/Lost) rather than the full 13-stage list,
  on the theory that a personal tool you'll actually use beats a
  comprehensive one you won't. Edit `src/lib/constants.js` if you want more.

## Customizing

- **Colors, fonts, spacing** — all in `src/App.css` under `.crm-root` (light)
  and `.crm-root.dark` (dark mode), as CSS custom properties.
- **Pipeline stages** — `STAGES` in `src/lib/constants.js`.
- **AI model** — `AI_MODEL` in `src/lib/constants.js`.
- **AI prompts** — `buildFollowUpPrompt` and `buildInsightPrompt` in
  `src/lib/ai.js`.
