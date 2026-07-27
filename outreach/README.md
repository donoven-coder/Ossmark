# Ossmark Command — Outreach Command Center

A production build of the SCOUT + CLOSER outreach dashboard: a thin backend that owns
all Notion access, a React PWA frontend, real file storage, an offline write queue,
and live reads/writes against your actual Leads, Deals, and Agent Registry data
sources — not a snapshot.

## 1. Architecture, and why

```
outreach/
  api/          Vercel serverless functions — the only code that ever holds
                the Notion token, R2 credentials, or Apify token
  lib/          Server-only shared logic: Notion client, mappers, validation
                rules, R2 storage, Apify integration, logging
  src/          React + TypeScript PWA frontend — talks only to /api
  test/         Vitest coverage for the sync/validation logic
```

**Backend: Vercel serverless functions.** The current frontend (the fitness app in
`../app`) already deploys to GitHub Pages, which is static-only — it cannot hold a
secret or run server code. This app needs a real backend for exactly one reason:
_the Notion integration token must never reach the browser._ Vercel functions were
chosen over an always-on Node server (Render/Fly) because the actual write volume
here is "a single rep tapping actions on a phone dozens of times a day," not
sustained traffic — serverless fits that shape and deploys straight from this repo
with zero extra infrastructure to babysit. The one place serverless's execution-time
limits matter is the FB Ad Library batch job, which is why that job is chunked into
small batches (see §2) instead of one long-running process.

**File storage: Cloudflare R2.** Zero egress fees matter for a phone app that
re-opens the same files repeatedly on cellular data, and R2 is S3-API-compatible so
none of the storage code is Cloudflare-specific. R2 is also the *only* store for the
File Bank — no separate database. Scope (`scout`/`closer`) is an object-key prefix,
and the original filename is R2 object metadata, so `ListObjectsV2` alone
reconstructs the whole file list. That's also why deletes are real: `DELETE` on R2,
not just removed from some in-memory array.

**No separate database, on purpose.** Every other piece of app state either belongs
in Notion (it's business data) or in the browser (the offline queue, the query
cache). Adding Postgres/Redis/KV here would be new infrastructure to justify for a
single-user app with no server-side session or job state that outlives one HTTP
request — see "Scaling the cache" below for the one case where that trade-off would
flip.

**Frontend stack:** React + TypeScript + Vite, TanStack Query for server-state
caching (built-in stale-while-revalidate is most of what "fast perceived response"
needs), an IndexedDB-backed write queue for the parts Query's cache can't cover
(actions taken while offline), Framer Motion for the completion/interaction polish,
Tailwind v4 for the design system, self-hosted Fraunces + Manrope (via
`@fontsource`) instead of the Google Fonts CDN link the prototype used, so typography
still renders correctly with no network at all.

## 2. Live Notion sync

Schema was pulled directly from the live workspace, not reconstructed from the
prototype's snapshot — see `lib/notion/schema.ts` for the exact data source IDs and
field names, each with a comment on how it was verified.

**Real gotcha worth knowing:** there are at least two other databases in this
workspace also named "Leads Database" with an entirely different schema (a generic
CRM board — Opt In/Manual/Cold/Hot Convo/... stages, no Score, no Niche, no Running
Meta Ads Poorly). SCOUT's own Agent Registry instructions separately warn against a
third decoy, `LeadsDatabase2.0-EXAMPLE`. This app is hardcoded to the one real data
source SCOUT and CLOSER's own instructions name as their write targets
(`266b9e70-...` for Leads, `1f2b9e70-...` for Deals, `32cb9e70-...` for Agent
Registry) — if you ever add a second Leads-like database to this workspace, don't
let this app anywhere near it without updating `schema.ts` deliberately.

**Reads:** `GET /api/leads`, `/api/deals`, `/api/agents` each page through their
whole data source (Notion's REST query endpoint) and cache the assembled result for
45s per warm serverless instance (`lib/notion/cache.ts`). That's not a hard rate-limit
guarantee across cold starts/multiple instances — see "Scaling the cache" — but it's
the right trade for "opened dozens of times a day by one person."

**Outreach Drafts are not a property — they're page content.** SCOUT writes each
lead's DM/email/call-points as a `## Outreach Drafts` section in the *body* of that
lead's Notion page, not a database column (confirmed by fetching a real lead page
live during this build). That's why `GET /api/leads/:id/scripts` is a separate,
lazy endpoint — it only fetches page blocks when a rep actually expands a lead's
script accordion, not for all 155 leads on every dashboard load. `lib/notion/scripts.ts`
parses that section defensively: if SCOUT's output format ever drifts, it returns
`null` instead of guessing, and the UI shows "no Outreach Drafts found" with a link
to open the page directly rather than fabricating a script.

**Writes go through validated, business-rule-aware endpoints**, not raw Notion
PATCHes:

- `PATCH /api/leads/:id` — validated partial update. If the patch moves
  `leadStatus` to **Agreed** or **Booked**, it automatically creates-or-updates that
  lead's Deal row (`lib/notion/repository.ts#createOrUpdateDealForLead`) — the real
  SCOUT → CLOSER handoff trigger the brief asked for, implementing CLOSER's own
  documented rule: *"one Deal per Lead, update the existing row on re-engagement
  rather than duplicating."*
- `POST /api/leads/:id/touchpoint` — the Text/Call/Email tap-through: stamps
  Messaged Date, and if the lead has no status yet, moves it to Initiated. Exactly
  the brief's own example.
- `POST /api/deals` / `PATCH /api/deals/:id` — enforces "no Deal without a linked
  Lead" and "Package Pitched only after Outcome is decided" server-side (Zod +
  `lib/validation/rules.ts`), independent of whatever the frontend does.
- `PATCH /api/agents/:id` — flips an Agent Registry Status.

**The FB Ad Library batch job is built, not run.** `POST /api/jobs/fb-ad-check` is
a dry run by default — it reports which leads would be checked and the estimated
Apify cost, and writes nothing. Pass `confirm: true` to actually execute it. Even
then, it never auto-sets **Running Meta Ads Poorly** — that's a judgment call
("are they running ads, *badly*"), and the actor only reports ad counts/dates, not
quality. Results are appended to the lead's Notes field for a human to confirm. The
actor's real input schema (pulled live from Apify, not assumed) takes Ad Library
*URLs*, not a plain business-name search — since Leads has no Facebook Page URL
field, the job constructs a keyword-search Ad Library URL from Business Name, which
is looser than an exact Page ID match. Closing that precisely means adding a
Facebook Page URL field to Leads, which is a schema change, not a code change.

## 3. File storage

`lib/storage/r2.ts` + `api/files/*`. Uploads are presigned PUTs — the client uploads
the binary straight to R2, it never transits our function. Deletes go through our
own endpoint using server-held credentials. Files are scoped per page (`scout`/
`closer`) via key prefix, matching the brief's requirement, and survive both a
reload and a lost connection because R2, not memory, is the source of truth.

## 4. PWA

`vite-plugin-pwa` with a manifest (name, icons, theme colors matching the obsidian/
gold/violet system) and a service worker that's deliberately asymmetric: GET reads
to `/api/leads|deals|agents|files` are cached network-first (so already-synced data
is readable offline), while writes never go through the SW cache at all — they go
through the IndexedDB outbox (`src/lib/offlineQueue.ts`) instead, because a stale
cached response to a POST/PATCH would be actively wrong, not just old.

**The offline queue, concretely:** every write attempts immediately; if it reaches
the server and the server rejects it (a real validation error), that surfaces
right away — queuing a request that will never succeed would just hide the problem
until later. Only a genuine network failure (offline, DNS, timeout) gets persisted
to IndexedDB and retried on the `online` event / a 30s sweep. Failed retries (a
request that reaches the server on retry but still gets rejected) show up in a
dismissible "sync issues" banner instead of disappearing into a server log —
matching the "discovered a week later" failure mode the brief called out
specifically.

## 5. Setup & deployment

### Prerequisites

1. **Notion integration.** In Notion, create an internal integration
   (Settings → Connections → Develop or manage integrations), copy its token, and
   share these three databases with it: **Leads**, **Deals**, **Agent Registry**
   (the real ones — see the decoy warning in §2). No changes needed on the Notion
   side beyond sharing access.
2. **Cloudflare R2 bucket.** Create a bucket and an API token scoped to it
   (R2 → Manage API Tokens). Note the Account ID, Access Key ID, and Secret Access
   Key.
3. **Apify token** (only needed once you intend to actually run the FB Ad Library
   job) — from your Apify account's Integrations settings.

### Environment variables (set these in the Vercel project, never in a committed file)

```
NOTION_TOKEN=secret_...
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=occ-file-bank
APIFY_TOKEN=apify_api_...        # optional until you run the FB Ad Library job
```

### Run locally

```bash
cd outreach
npm install
npm run dev
```

The dev server proxies nothing by default — for local API testing, run
`vercel dev` instead of `npm run dev` so `/api/*` routes actually execute (plain
`vite dev` only serves the frontend). Either way, set the env vars above in a local
`.env` file first (gitignored).

### Deploy

```bash
npx vercel link      # first time only — connects this directory to a Vercel project
npx vercel --prod
```

Or connect the GitHub repo to Vercel in their dashboard and set "Root Directory" to
`outreach` — same result, deploys automatically on push.

### Verify

```bash
npm run build            # frontend build
npm run typecheck:server # api/ + lib/
npm test                 # 53 tests over sync mapping, validation rules, the
                          # Outreach Drafts parser, and offline-queue resilience
```

Then hit `/api/health` on the deployed URL — it reports whether each credential is
actually configured (never the values themselves), so you can confirm a deploy is
wired correctly before opening the app.

### Install on your phone

Open the deployed URL, then "Add to Home Screen" (iOS Safari: Share → Add to Home
Screen; Android Chrome: ⋮ → Add to Home Screen / Install app).

## 6. Known gaps still open

Every one of these is surfaced in the app itself (an alert card, a flagged pipeline
card, or an honest empty state) rather than fixed quietly:

| Gap | Where it shows | What closing it takes |
|---|---|---|
| Instagram field empty on Instagram-sourced leads | Live-computed count in a SCOUT alert card | Backfill from IG handle lookup, or start capturing it at scrape time |
| FB Ad Library coverage (4 of ~146 qualified leads) | Live-computed coverage ratio in a SCOUT alert card | Run the built-but-unexecuted batch job (§2); real Apify spend |
| SCOUT's own Agent Registry notes still reference the broken `automation-lab/facebook-ads-library` actor | Not auto-corrected — see `FB_AD_CHECK.actorNameNotYetUpdatedInAgentRegistry` in `lib/notion/schema.ts` | A manual edit to that Agent Registry page's System Prompt Notes; this app doesn't touch agent instructions on its own initiative |
| "Running Meta Ads Poorly" has no precise, automatable definition | FB Ad Library job writes raw evidence to Notes, never auto-flips the checkbox | Define the actual heuristic (ad count threshold? creative age? spend estimate?) — a product decision, not a code gap |
| One flagged-unverified Deal, one blank ghost row | `classifyDealIntegrity()` — computed live, shown as ⚠ UNVERIFIED / CLEAN UP in the Deal Pipeline | Delete or fix the two rows directly in Notion; the app flags, it doesn't auto-clean |
| CLOSER's 3 sub-agents Idle | Dynamic explanation in the CLOSER panel, computed from real handoff-eligible lead counts | Resolves itself once a Lead reaches Agreed/Booked — the handoff trigger (§2) is now real |
| No Facebook Page URL field on Leads | FB Ad Library job falls back to keyword search instead of exact Page ID match | Add a Facebook Page URL property to Leads (schema change) |
| No "Call 2" script for Reconnect/Follow Up leads | Cockpit shows the one real script regardless of call number, with the gap noted below it | Draft a second script — content work, not engineering |
| Value Stack Slide | Static "not built yet" status in the Cockpit | Draft it from real package deliverables (Phase 3 of the playbook) |
| Site Link / Site Builder | Shows "Idle, no site built yet" per-lead until a real site exists | Site Builder sub-agent needs to actually run once there's a lead to build for |

## What's genuinely live vs. what needs your credentials to prove out

Everything above is real, working code against the real schema — verified by
reading the actual Leads/Deals/Agent Registry data sources and one real lead page
live during this build, and by 53 passing tests on the mapping/validation/offline
logic. What I *can't* do from here is deploy it to your Vercel account or your R2
bucket (no access to either), so "live" in the sense of "watch it read/write your
actual pipeline" only happens once you complete §5 with your own credentials.
