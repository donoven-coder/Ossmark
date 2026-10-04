/**
 * The only word-for-word call script that currently exists (first-call /
 * discovery call), verbatim from the source spec. There's no separate
 * "Call 2" script built yet for Reconnect or Follow Up stage leads — the
 * Cockpit flags that explicitly rather than reusing this one silently.
 */
export const CALL_SCRIPT = [
  {
    block: "0–5 min",
    title: "Rapport & Agenda",
    body: "\"Thanks for jumping on, [Name]. Quick heads up on how this'll go — I actually built you a new version of your site ahead of this call, so I want to show you that first. Then we'll talk about what it'd take to actually drive people to it. Sound good?\"",
  },
  {
    block: "5–10 min",
    title: "Live Site Reveal",
    body: "Screen-share the built site. \"So here's what I put together for [Business Name]. A couple things I changed specifically for you — [2-3 real details]. This isn't a template with your logo slapped on — I pulled your actual services and rebuilt around them.\"",
  },
  {
    block: "10–20 min",
    title: "Diagnosis",
    body: "\"Tell me — what does a slow month look like for your business?\" · \"What's a new customer worth to you over a year?\" · \"What have you tried before to get more leads? What happened?\"",
  },
  {
    block: "20–30 min",
    title: "Audit Reveal",
    body: "\"Here's what I found looking at your current presence beyond the site itself... The problem isn't just the old site — that's fixed now. The bigger problem is [specific gap]. Here's what that's costing you.\"",
  },
  {
    block: "30–45 min",
    title: "Two-Path Offer",
    body: "Path A (primary): \"The site you just saw comes included when you start the Growth Engine program — no extra charge. The real work starts with putting traffic in front of it.\" Path B (fallback): \"If ad spend isn't the move yet, you can take the site itself for $497 one-time — pixel's already installed.\"",
  },
  {
    block: "45–60 min",
    title: "Objections + Close",
    body: "\"Based on everything you've told me, the Growth Engine package makes the most sense... if we don't hit [guarantee metric], we work free until we do. Do you want to move forward?\" — then silence, don't speak first.",
  },
];

export const OUTCOME_CASCADE = [
  {
    outcome: "Ads Program Yes",
    steps: [
      "Send contract",
      "Confirm signature",
      "Trigger invoice",
      "Flip Paid — this is what actually creates the Client record, not the Won flag",
    ],
  },
  {
    outcome: "Site Only",
    steps: [
      "$497 flat invoice",
      "Schedule domain switch",
      "Auto-tag for KEEPER 60–90 day ads upsell follow-up",
    ],
  },
  {
    outcome: "Not Now",
    steps: [
      "Site stays live as a leave-behind — do not delete or unbook it",
      "Enroll in existing follow-up cadence",
    ],
  },
];

export const OBJECTIONS_NOTE =
  "Objections Logged should capture the prospect's actual words, not a paraphrased category — this is what feeds Objection Handler's future rebuttal drafts.";

export const PRICING_RULE_NOTE =
  "Package Pitched is filled in only after the call, matching what was actually quoted — never written in beforehand.";

export const VALUE_STACK_STATUS =
  "Not built yet. The playbook calls for it (Phase 3: list every deliverable with its own dollar value, totaling 2–3x the package price) but no filled-in version exists in Notion or the project docs.";
