# open-generative-ai (submodule)

Self-hosted alternative to Higgsfield, added as a git submodule so it stays on the back
burner without vendoring a copy of someone else's codebase into this repo. Upstream:
https://github.com/Anil-matcha/Open-Generative-AI

Intended use here: generating greeting content / website assets for clients, evaluated
against per-generation API cost before turning it into an offering.

## Cloning this repo going forward

Submodules aren't checked out by a plain `git clone` — either clone with
`--recurse-submodules`, or after a normal clone run:

```bash
git submodule update --init --recursive
```

## First-time setup

```bash
cd open-generative-ai
npm run setup   # installs deps + builds workspace packages (studio, workflow, agent, design)
npm run dev     # web version at http://localhost:3000 (redirects to /studio)
```

Desktop app instead of the browser version: `npm run electron:dev`.

Verified in this session: `npm run setup` completes clean on Node 22, and `npm run dev`
serves `/studio` successfully. No API key was configured or tested.

## API key / cost — do this before quoting clients

- Generation is billed by Muapi.ai, not this repo. Get a key at https://muapi.ai/access-keys
  and enter it in the API Key modal on first load (stored in the browser's localStorage,
  sent only to Muapi.ai).
- Per-model/per-generation pricing: https://muapi.ai/pricing — varies a lot by model
  (image vs. video vs. lip sync), so check actual usage against real prices there rather
  than assuming a flat per-token rate.
- There's also a local-inference mode (bundled sd.cpp engine, desktop app only) that runs
  a handful of open image models on-device with no per-generation API cost — lower quality
  than the hosted models, but useful for a free/cheap tier.

## Updating

This is a submodule, so it doesn't auto-update:

```bash
cd open-generative-ai
git submodule update --remote
git add open-generative-ai
git commit -m "Update open-generative-ai submodule"
```

## Note on the upstream README

The upstream README/marketing copy touts "no content filters or restrictions" as a
differentiator. Keep that in mind if this ever gets exposed to clients directly —
worth adding your own guardrails around what it's used to generate.
