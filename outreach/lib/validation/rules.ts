import type { DealOutcome, LeadStatus } from "../notion/schema.js";
import { CLOSER_HANDOFF_STATUSES } from "../notion/schema.js";
import type { Deal } from "../notion/mappers.js";

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

/** "Don't let a Deal be created without a linked Lead." */
export function assertDealHasLead(leadId: string | undefined | null): asserts leadId is string {
  if (!leadId || leadId.trim() === "") {
    throw new ValidationError("A Deal cannot exist without a linked Lead.", "leadId");
  }
}

/**
 * CLOSER's own rule: "Package Pitched is filled in only after the call,
 * matching what was actually quoted — never written in beforehand." In
 * practice that means Outcome must have been decided (not left at Pending,
 * and not absent) before Package Pitched can be set.
 */
export function assertPackagePitchedAllowed(outcome: DealOutcome | null | undefined): void {
  if (!outcome || outcome === "Pending") {
    throw new ValidationError(
      "Package Pitched can only be set after the call Outcome has been decided (not while Pending).",
      "packagePitched",
    );
  }
}

export function isCloserHandoffStatus(status: LeadStatus | null): boolean {
  return status !== null && (CLOSER_HANDOFF_STATUSES as readonly string[]).includes(status);
}

/**
 * The tap-to-Text/Call/Email interaction from the brief: log that a
 * touchpoint happened, and if the lead has no status yet, move it to
 * Initiated — mirrors CLOSER's own instructions about Deals being updated
 * at each stage of a call, applied to SCOUT's first-touch moment.
 */
export function computeTouchpointPatch(currentStatus: LeadStatus | null, nowIso: string) {
  const patch: { messagedDate: string; leadStatus?: LeadStatus } = { messagedDate: nowIso };
  if (currentStatus === null) {
    patch.leadStatus = "Initiated";
  }
  return patch;
}

export type DealIntegrity = "ok" | "orphan_no_lead" | "blank";

/**
 * Catches the exact two problems the prototype called out by name (one
 * flagged-unverified entry, one blank ghost row) generically, from live
 * data, instead of hardcoding which row was bad.
 */
export function classifyDealIntegrity(deal: Deal): DealIntegrity {
  const isBlank = !deal.dealName.trim() && deal.leadIds.length === 0 && !deal.outcome;
  if (isBlank) return "blank";
  if (deal.leadIds.length === 0) return "orphan_no_lead";
  return "ok";
}
