# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the app

No build step or package manager. Start any static file server from the repo root:

```bash
python3 -m http.server 3000
# or
npx serve
```

Then open `http://localhost:3000`.

## Architecture

Novair is a zero-dependency, local-first SPA. All state lives in `localStorage` — nothing is ever sent to a server.

**Files:**
- `index.html` — all markup; three view `<div>`s plus two modals
- `js/app.js` — all application logic (single file, ~300 lines)
- `css/style.css` — custom styles (breathing animation, card style, scrollbar); Tailwind loaded via CDN

**View state machine:**  
Three mutually exclusive views (`welcome-view`, `onboarding-view`, `dashboard-view`) are shown/hidden by toggling the `hidden` Tailwind class. On load, `app.js` checks `localStorage.getItem('novair_start_time')` to decide which view to display — if a start time exists the user goes straight to the dashboard, skipping welcome and onboarding.

**Dashboard update loop:**  
`initDashboard()` is called once when entering the dashboard. It stamps the HTML for milestones and badges via `innerHTML`, then calls `lucide.createIcons()` to hydrate icon placeholders. `updateApp()` runs every second via `setInterval` and does targeted DOM updates (`innerText`, `style.width`, `className`) without re-rendering the whole structure.

**Health milestones and badges** are defined as static arrays at the top of `app.js` (`milestones`, `badgesDef`). Each milestone has a `time` value in minutes; each badge has a `condition` callback `(totalMinutes, moneySaved, avoidedCigs) => boolean`.

**`localStorage` keys:**
- `novair_start_time` — Unix timestamp (ms) of quit moment
- `novair_motivation` — free-text motivation string
- `novair_cigsDay` — cigarettes per day
- `novair_cigsPack` — cigarettes per pack
- `novair_pricePack` — price per pack in EUR
- `novair_slipups` — count of logged slip-ups
- `novair_celebrated` — JSON array of milestone/badge IDs already celebrated
- `novair_checkins` — JSON array of daily check-ins `{ date, mood }` (max 14 entries)
- `novair_streak` — current check-in streak count
- `novair_last_checkin_date` — `Date.toDateString()` of the last check-in

**Modal functions** (`toggleCravingModal`, `toggleSettingsModal`) are exposed on `window` because they are called from inline `onclick` attributes in the HTML.

## Design conventions

- Language: German throughout (UI copy, variable names use English)
- Style: "Simple but Premium" — monochromatic black/white; color accents are used sparingly for specific motivational UI elements (e.g. green tint on the daily check-in card, orange for the streak counter)
- Active state for milestones and badges uses `text-black` / `bg-black` replacing `text-gray-*` / `bg-gray-*`; all transitions are done by swapping Tailwind utility classes directly on DOM elements
