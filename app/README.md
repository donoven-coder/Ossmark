# Fitness Command Center

A merged, rebuilt version of two prototypes — `daily-checklist.html` and
`workout-schedule.html` — into one installable app with two views: **Today**
(daily checklist) and **Program** (n-Suns 531 LP tracker with live TM-based
weight calculation).

## Setup & run

Requires Node 18+.

```bash
cd app
npm install
npm run dev
```

Open the printed `http://localhost:5173` URL. On your phone, open the same
URL (use `npm run dev -- --host` to expose it on your LAN) and use
"Add to Home Screen" — it's a PWA, so it installs like a native app icon and
works offline after the first load.

```bash
npm run build      # production build to dist/
npm run preview    # serve the production build locally
```

No backend, no accounts, no env vars — it's a fully static, single-user app.

## UI/UX tooling used, and why

- **React + TypeScript + Vite** — the app outgrew a single HTML file (two
  merged views, shared state, live-recalculating derived data), so it's
  structured as real components/modules instead of one big render() function.
- **Tailwind CSS v4** (`@tailwindcss/vite`) — implements the existing design
  system (navy/blue/mint, Georgia + Courier New) as reusable utility classes
  instead of the ~400 lines of hand-written CSS in each prototype, without
  pulling in a generic component kit that would fight that design system.
- **Framer Motion** — this was the actual ask ("feel it, not just correct").
  Used for the progress ring's animated fill/glow, the checkbox check-mark
  morph, the TM-edit recalculation pulse on affected weight numbers, macro
  progress bars, water-cup fills, and view/tab transitions — all
  transform/opacity-based so they stay smooth on a phone.
- **Zustand + `persist` middleware** — the two prototypes reset all state on
  reload by design (artifact sandbox constraint). This is a real app now, so
  state needed real persistence; Zustand's persist middleware writes to
  `localStorage` with minimal boilerplate compared to hand-rolling
  `useEffect`/`localStorage` sync in every component.
- **lucide-react** — swaps the prototypes' inline SVG icon strings for a
  proper SVG icon set (no emoji, consistent stroke width), per the icon
  guidance in this environment's UI/UX skill reference.
- **vite-plugin-pwa** — makes "an app I open daily on my phone" literal:
  installable manifest + offline service worker, so it behaves like a
  shipped product icon, not a bookmark.

## What's where

```
src/
  data/            # verbatim content extracted from the two prototypes
    checklistData.ts   # PPL rotation, checklist items, macro/water defaults
    programData.ts     # full n-Suns program JSON + TM% formula constants
  lib/             # date/weekday helpers, TM percentage formula, cn()
  store/           # Zustand stores (Today: checklist/macros/water;
                   #                  Program: TM values, set completion)
  components/
    layout/        # AppShell-level pieces: bottom nav, hero/ring, ring svg
    today/         # Morning/Supplements/Training/Diet/Water panels
    program/       # TM chips, week/day tabs, lift blocks, assistance
    ui/            # shared primitives: Panel, ItemRow, SetChip, TabButton...
```

## Design decisions worth knowing about

- **State persistence + daily rollover.** TM values are a real setting and
  persist indefinitely. Checklist completion, macro/water values, and
  workout-set checkmarks are also persisted (so a mid-day phone refresh
  doesn't wipe your progress) but auto-clear when the calendar date changes,
  since a *daily* checklist and *today's* sets shouldn't stay checked off
  forever. This replaces the prototypes' "resets on every reload" behavior
  with "resets once a day," which is what that behavior was actually standing
  in for.
- **Macro and water targets are editable in the UI.** The prototypes hardcoded
  1,800 cal / 160g protein / 150g carbs / 55g fat and an 8-cup water target,
  with a comment telling you to edit the source code to change them. Both
  panels now have a pencil toggle that turns the target labels into editable
  fields, so those assumptions are adjustable without touching code.
- **TM-edit highlight** is scoped precisely: editing a Training Max flashes
  only the 3 computed T1 sets that actually changed, for ~0.9s, keyed off the
  specific lift key. Tab-switching or checking off sets never triggers it.

## Anything that didn't parse cleanly

Everything did. Both source files' data (checklist items, PPL rotation,
macro/water defaults, the full n-Suns program across all 4 weeks × 6 days,
and the verified TM percentage formula) is extracted directly into
`src/data/` — nothing here was re-derived, guessed at, or replaced with
placeholder content. Two things are worth flagging as inherited assumptions,
not parsing failures:

- The Mon-Sat PPL order and the 8-cup water/macro targets were already
  labeled "assumption" / "placeholder" in the prototype's own comments —
  carried forward as defaults, with water/macro targets now editable in-app
  (see above).
- The original spreadsheet had Friday/Saturday inconsistencies in the T1
  formula (frozen weights on Friday, inconsistent reps on Saturday) that the
  prototype's own code comment says its formula already corrects by applying
  the same %-of-TM rule to all six days. That correction is preserved exactly
  as documented in `src/data/programData.ts`.
