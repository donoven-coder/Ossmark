import { describe, it, expect } from "vitest";
import { leadPatchSchema, dealCreateSchema, dealPatchSchema, agentStatusPatchSchema, touchpointSchema } from "../lib/validation/schemas";

describe("leadPatchSchema", () => {
  it("accepts a valid partial patch", () => {
    expect(leadPatchSchema.safeParse({ leadStatus: "Agreed", qualified: true }).success).toBe(true);
  });
  it("rejects an out-of-enum status (schema drift protection)", () => {
    expect(leadPatchSchema.safeParse({ leadStatus: "Made Up Status" }).success).toBe(false);
  });
  it("rejects unknown fields (.strict())", () => {
    expect(leadPatchSchema.safeParse({ notAField: true }).success).toBe(false);
  });
  it("rejects a malformed email", () => {
    expect(leadPatchSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
  });
});

describe("dealCreateSchema", () => {
  it("requires leadId — enforces 'no Deal without a Lead' at the schema layer too", () => {
    expect(dealCreateSchema.safeParse({ businessName: "AirMaster", callDate: "2026-07-27" }).success).toBe(false);
  });
  it("accepts a minimal valid create", () => {
    const result = dealCreateSchema.safeParse({ leadId: "lead-1", businessName: "AirMaster", callDate: "2026-07-27" });
    expect(result.success).toBe(true);
  });
});

describe("dealPatchSchema", () => {
  it("accepts a valid outcome+package patch", () => {
    expect(dealPatchSchema.safeParse({ outcome: "Site Only", packagePitched: "Site-Only 497" }).success).toBe(true);
  });
  it("rejects an invalid package tier (schema drift protection on real pricing)", () => {
    expect(dealPatchSchema.safeParse({ packagePitched: "Growth Engine 999" }).success).toBe(false);
  });
});

describe("agentStatusPatchSchema", () => {
  it("accepts all four real Agent Registry statuses", () => {
    for (const status of ["Not started", "In progress", "Idle", "Done"]) {
      expect(agentStatusPatchSchema.safeParse({ status }).success).toBe(true);
    }
  });
});

describe("touchpointSchema", () => {
  it("accepts the three real channels", () => {
    for (const channel of ["text", "call", "email"]) {
      expect(touchpointSchema.safeParse({ channel }).success).toBe(true);
    }
  });
  it("rejects an unsupported channel", () => {
    expect(touchpointSchema.safeParse({ channel: "carrier-pigeon" }).success).toBe(false);
  });
});
