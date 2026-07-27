import { describe, it, expect } from "vitest";
import { toLead, toDeal, toAgent, buildLeadPatch, buildDealPatch, buildDealLeadRelation, buildAgentStatusPatch } from "../lib/notion/mappers";
import type { NotionPage } from "../lib/notion/client";

// Shaped after the real "Superior Comfort Heating & Cooling" lead page
// fetched live from the workspace during this build.
const leadPage: NotionPage = {
  id: "3a9b9e70-03ea-8147-8d0c-fe75581a0854",
  url: "https://app.notion.com/p/3a9b9e7003ea81478d0cfe75581a0854",
  created_time: "2026-07-26T03:26:39.990Z",
  last_edited_time: "2026-07-26T19:26:15.180Z",
  properties: {
    "Business Name": { title: [{ plain_text: "Superior Comfort Heating & Cooling" }] },
    Niche: { select: { name: "HVAC" } },
    Score: { number: 7 },
    "Running Meta Ads Poorly": { checkbox: true },
    "Lead Status": { select: { name: "Initiated" } },
    "Lead Source": { select: { name: "Cold Call" } },
    "Source Sub-Agent": { select: { name: "Enrichment" } },
    Qualified: { checkbox: true },
    Booked: { checkbox: false },
    Instagram: { rich_text: [] },
    Email: { email: "1superiorcomfortllc@gmail.com" },
    Phone: { phone_number: "215-416-6557" },
    Website: { url: null },
    City: { rich_text: [{ plain_text: "Philadelphia, PA" }] },
    Notes: { rich_text: [{ plain_text: "Score 7/10." }] },
    "Opt In Word": { rich_text: [] },
    "Messaged Date": { date: null },
    "Follow Up Date": { date: null },
    "Date Booked": { date: null },
    "Date Signed": { date: null },
    Deal: { relation: [] },
    Status: { status: { name: "In progress" } },
  },
};

describe("toLead", () => {
  it("maps every field from a real-shaped Notion page", () => {
    const lead = toLead(leadPage);
    expect(lead.businessName).toBe("Superior Comfort Heating & Cooling");
    expect(lead.niche).toBe("HVAC");
    expect(lead.score).toBe(7);
    expect(lead.runningMetaAdsPoorly).toBe(true);
    expect(lead.leadStatus).toBe("Initiated");
    expect(lead.qualified).toBe(true);
    expect(lead.booked).toBe(false);
    expect(lead.instagram).toBe(""); // the real Instagram-field-empty gap
    expect(lead.email).toBe("1superiorcomfortllc@gmail.com");
    expect(lead.internalStatus).toBe("In progress");
  });
});

describe("buildLeadPatch", () => {
  it("only includes explicitly provided fields", () => {
    const patch = buildLeadPatch({ leadStatus: "Agreed" });
    expect(Object.keys(patch)).toEqual(["Lead Status"]);
  });
  it("allows explicitly clearing a field to null", () => {
    const patch = buildLeadPatch({ niche: null });
    expect((patch as any)["Niche"]).toEqual({ select: null });
  });
});

const dealPage: NotionPage = {
  id: "d1",
  url: "https://notion.so/d1",
  created_time: "2026-07-20T00:00:00.000Z",
  last_edited_time: "2026-07-20T00:00:00.000Z",
  properties: {
    "Deal Name": { title: [{ plain_text: "AirMaster - 2026-07-20" }] },
    Lead: { relation: [] },
    Client: { relation: [] },
    Outcome: { select: { name: "Ads Program Yes" } },
    "Package Pitched": { select: { name: "Growth Engine 1497" } },
    "Call Date": { date: { start: "2026-07-20" } },
    "Source Sub-Agent": { select: { name: "Outreach" } },
    "Objections Logged": { rich_text: [] },
    "Site Link": { url: null },
  },
};

describe("toDeal", () => {
  it("maps fields and surfaces the empty Lead relation (the flagged-unverified case)", () => {
    const deal = toDeal(dealPage);
    expect(deal.dealName).toBe("AirMaster - 2026-07-20");
    expect(deal.leadIds).toEqual([]);
    expect(deal.outcome).toBe("Ads Program Yes");
    expect(deal.packagePitched).toBe("Growth Engine 1497");
  });
});

describe("buildDealLeadRelation", () => {
  it("produces a single-item relation for the given lead id", () => {
    expect(buildDealLeadRelation("lead-1")).toEqual({ Lead: { relation: [{ id: "lead-1" }] } });
  });
});

describe("buildDealPatch", () => {
  it("only includes explicitly provided fields", () => {
    const patch = buildDealPatch({ outcome: "Site Only" });
    expect(Object.keys(patch)).toEqual(["Outcome"]);
  });
});

const agentPage: NotionPage = {
  id: "a1",
  url: "https://notion.so/a1",
  created_time: "",
  last_edited_time: "",
  properties: {
    "Agent Name": { title: [{ plain_text: "Outreach" }] },
    Level: { select: { name: "Sub-Agent" } },
    Status: { select: { name: "Idle" } },
    "Reports To": { relation: [{ id: "closer-dept" }] },
    "Sub-Agents": { relation: [] },
    "System Prompt Notes": { rich_text: [] },
    "Last Active": { date: null },
  },
};

describe("toAgent / buildAgentStatusPatch", () => {
  it("maps an Idle sub-agent correctly", () => {
    const agent = toAgent(agentPage);
    expect(agent.agentName).toBe("Outreach");
    expect(agent.level).toBe("Sub-Agent");
    expect(agent.status).toBe("Idle");
    expect(agent.reportsToIds).toEqual(["closer-dept"]);
  });
  it("builds a status-only patch", () => {
    expect(buildAgentStatusPatch("In progress")).toEqual({ Status: { select: { name: "In progress" } } });
  });
});
