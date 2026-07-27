import { describe, it, expect } from "vitest";
import { parseOutreachDrafts } from "../lib/notion/scripts";
import type { NotionBlock } from "../lib/notion/client";

function textBlock(type: string, text: string): NotionBlock {
  return { id: `${type}-${text.slice(0, 8)}`, type, [type]: { rich_text: [{ plain_text: text }] } } as NotionBlock;
}

// Modeled on the real "Outreach Drafts" content fetched live for Superior
// Comfort Heating & Cooling during this build.
const realShapedBlocks: NotionBlock[] = [
  textBlock("heading_2", "Outreach Drafts"),
  textBlock(
    "paragraph",
    "DM: Hey — your reviews are all 5-star and named techs get praised for speed and knowledge, but there are only 68 of them.",
  ),
  textBlock("paragraph", "Email subject: Great reviews, just not enough of them"),
  textBlock("paragraph", "Hi — Superior Comfort's reviews are excellent but thin relative to nearby competitors."),
  textBlock("paragraph", "Call talking points:"),
  textBlock("bulleted_list_item", "Open: \"4.9 stars, but a small review count compared to shops down the road.\""),
  textBlock("bulleted_list_item", "Bridge: A stronger site plus a review-collection push would close that fast."),
  textBlock("bulleted_list_item", "Ask: Free site preview, no obligation."),
];

describe("parseOutreachDrafts", () => {
  it("parses DM, email subject+body, and call talking points from real-shaped blocks", () => {
    const script = parseOutreachDrafts(realShapedBlocks);
    expect(script).not.toBeNull();
    expect(script!.dm).toContain("Hey — your reviews are all 5-star");
    expect(script!.emailSubject).toBe("Great reviews, just not enough of them");
    expect(script!.emailBody).toContain("Hi — Superior Comfort's reviews");
    expect(script!.callPoints).toHaveLength(3);
    expect(script!.callPoints[0]).toContain("4.9 stars");
  });

  it("returns null when there's no Outreach Drafts heading at all (the honest 'not drafted yet' case)", () => {
    expect(parseOutreachDrafts([textBlock("paragraph", "Just some other page content.")])).toBeNull();
  });

  it("returns null (not a guess) when the heading exists but nothing recognizable follows", () => {
    const blocks = [textBlock("heading_2", "Outreach Drafts"), textBlock("paragraph", "TBD, still writing this one.")];
    expect(parseOutreachDrafts(blocks)).toBeNull();
  });

  it("stops collecting at the next heading, ignoring unrelated content below", () => {
    const blocks = [...realShapedBlocks, textBlock("heading_2", "Internal Notes"), textBlock("paragraph", "Don't show this.")];
    const script = parseOutreachDrafts(blocks);
    expect(script!.callPoints).toHaveLength(3);
  });
});
