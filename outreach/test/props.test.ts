import { describe, it, expect } from "vitest";
import * as P from "../lib/notion/props";

// Note: titleProp/richTextProp produce Notion *write* payloads
// ({ type: "text", text: { content } }), while readTitle/readRichText parse
// Notion *read* responses ({ plain_text, ... }) — genuinely different
// shapes for the same property, since that's what the real API gives and
// expects on each side. These read-side tests use read-shaped fixtures
// rather than piping a write payload back into a read helper.
describe("notion property helpers", () => {
  it("reads title from a read-shaped payload", () => {
    const read = { Name: { title: [{ plain_text: "Superior Comfort" }] } };
    expect(P.readTitle(read, "Name")).toBe("Superior Comfort");
    expect(P.readTitle({ Name: { title: [] } }, "Name")).toBe("");
    expect(P.readTitle({}, "Name")).toBe("");
  });

  it("writes a title payload in Notion's expected write shape", () => {
    expect(P.titleProp("Superior Comfort")).toEqual({ title: [{ type: "text", text: { content: "Superior Comfort" } }] });
    expect(P.titleProp("")).toEqual({ title: [] });
  });

  it("reads rich_text from a read-shaped payload", () => {
    const read = { Notes: { rich_text: [{ plain_text: "Score 7/10." }] } };
    expect(P.readRichText(read, "Notes")).toBe("Score 7/10.");
  });

  it("round-trips select, including null", () => {
    expect(P.readSelect({ Niche: P.selectProp("HVAC") }, "Niche")).toBe("HVAC");
    expect(P.readSelect({ Niche: P.selectProp(null) }, "Niche")).toBeNull();
    expect(P.readSelect({}, "Niche")).toBeNull();
  });

  it("round-trips status (distinct property type from select)", () => {
    expect(P.readStatus({ Status: P.statusProp("In progress") }, "Status")).toBe("In progress");
  });

  it("round-trips number, including null", () => {
    expect(P.readNumber({ Score: P.numberProp(7) }, "Score")).toBe(7);
    expect(P.readNumber({ Score: P.numberProp(null) }, "Score")).toBeNull();
  });

  it("round-trips checkbox, defaulting missing to false", () => {
    expect(P.readCheckbox({ Qualified: P.checkboxProp(true) }, "Qualified")).toBe(true);
    expect(P.readCheckbox({}, "Qualified")).toBe(false);
  });

  it("round-trips relation ids", () => {
    const written = { Lead: P.relationProp(["a", "b"]) };
    expect(P.readRelationIds(written, "Lead")).toEqual(["a", "b"]);
    expect(P.readRelationIds({ Lead: P.relationProp([]) }, "Lead")).toEqual([]);
  });

  it("round-trips date start", () => {
    expect(P.readDateStart({ "Call Date": P.dateProp("2026-07-27") }, "Call Date")).toBe("2026-07-27");
    expect(P.readDateStart({ "Call Date": P.dateProp(null) }, "Call Date")).toBeNull();
  });
});
