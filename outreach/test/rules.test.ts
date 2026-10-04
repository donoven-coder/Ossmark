import { describe, it, expect } from "vitest";
import {
  assertDealHasLead,
  assertPackagePitchedAllowed,
  isCloserHandoffStatus,
  computeTouchpointPatch,
  classifyDealIntegrity,
  ValidationError,
} from "../lib/validation/rules";
import type { Deal } from "../lib/notion/mappers";

function fixtureDeal(overrides: Partial<Deal> = {}): Deal {
  return {
    id: "d1",
    url: "https://notion.so/d1",
    dealName: "AirMaster - 2026-07-20",
    leadIds: ["lead-1"],
    clientIds: [],
    outcome: "Pending",
    packagePitched: null,
    callDate: "2026-07-20",
    sourceSubAgent: "Outreach",
    objectionsLogged: "",
    siteLink: null,
    lastEditedTime: "2026-07-20T00:00:00.000Z",
    ...overrides,
  };
}

describe("assertDealHasLead — 'a Deal cannot exist without a linked Lead'", () => {
  it("passes for a real lead id", () => {
    expect(() => assertDealHasLead("lead-123")).not.toThrow();
  });
  it("rejects undefined", () => {
    expect(() => assertDealHasLead(undefined)).toThrow(ValidationError);
  });
  it("rejects empty string", () => {
    expect(() => assertDealHasLead("")).toThrow(ValidationError);
  });
  it("rejects whitespace-only string", () => {
    expect(() => assertDealHasLead("   ")).toThrow(ValidationError);
  });
});

describe("assertPackagePitchedAllowed — 'Package Pitched only after Outcome decided'", () => {
  it("rejects when outcome is null", () => {
    expect(() => assertPackagePitchedAllowed(null)).toThrow(ValidationError);
  });
  it("rejects while outcome is still Pending", () => {
    expect(() => assertPackagePitchedAllowed("Pending")).toThrow(ValidationError);
  });
  it("allows once outcome is Ads Program Yes", () => {
    expect(() => assertPackagePitchedAllowed("Ads Program Yes")).not.toThrow();
  });
  it("allows once outcome is Site Only", () => {
    expect(() => assertPackagePitchedAllowed("Site Only")).not.toThrow();
  });
  it("allows once outcome is Not Now (a decided outcome, even if not a sale)", () => {
    expect(() => assertPackagePitchedAllowed("Not Now")).not.toThrow();
  });
});

describe("isCloserHandoffStatus", () => {
  it("is true for Agreed and Booked", () => {
    expect(isCloserHandoffStatus("Agreed")).toBe(true);
    expect(isCloserHandoffStatus("Booked")).toBe(true);
  });
  it("is false for every other status, including null and Signed", () => {
    expect(isCloserHandoffStatus("Initiated")).toBe(false);
    expect(isCloserHandoffStatus("Not Interested")).toBe(false);
    expect(isCloserHandoffStatus("Signed")).toBe(false);
    expect(isCloserHandoffStatus(null)).toBe(false);
  });
});

describe("computeTouchpointPatch — the Text/Call/Email tap behavior", () => {
  it("moves a status-less lead to Initiated and stamps Messaged Date", () => {
    const patch = computeTouchpointPatch(null, "2026-07-27T12:00:00.000Z");
    expect(patch).toEqual({ messagedDate: "2026-07-27T12:00:00.000Z", leadStatus: "Initiated" });
  });
  it("only stamps Messaged Date if the lead already has a status — never regresses it", () => {
    const patch = computeTouchpointPatch("Agreed", "2026-07-27T12:00:00.000Z");
    expect(patch).toEqual({ messagedDate: "2026-07-27T12:00:00.000Z" });
    expect((patch as any).leadStatus).toBeUndefined();
  });
});

describe("classifyDealIntegrity — catches ghost/unverified rows generically", () => {
  it("is ok for a normal linked deal", () => {
    expect(classifyDealIntegrity(fixtureDeal())).toBe("ok");
  });
  it("flags an orphan deal with no linked lead (the 'flagged unverified' case)", () => {
    expect(classifyDealIntegrity(fixtureDeal({ leadIds: [] }))).toBe("orphan_no_lead");
  });
  it("flags a fully blank ghost row distinctly from an orphan with real content", () => {
    expect(classifyDealIntegrity(fixtureDeal({ dealName: "", leadIds: [], outcome: null }))).toBe("blank");
  });
});
