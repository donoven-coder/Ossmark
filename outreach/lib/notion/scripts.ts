import type { NotionBlock } from "./client.js";

export interface OutreachScript {
  dm: string;
  emailSubject: string;
  emailBody: string;
  callPoints: string[];
}

function blockText(block: NotionBlock): string {
  const body = (block as any)[block.type];
  const richText = body?.rich_text as { plain_text: string }[] | undefined;
  return richText?.map((t) => t.plain_text).join("") ?? "";
}

const HEADING_TYPES = new Set(["heading_1", "heading_2", "heading_3"]);

/**
 * Parses the "Outreach Drafts" section SCOUT writes as page content under
 * each lead (a heading, then DM / Email subject+body / Call talking points
 * blocks). This is a content convention, not a schema — if SCOUT's output
 * format drifts, this returns null rather than guessing, and the UI falls
 * back to a link to open the page directly in Notion.
 */
export function parseOutreachDrafts(blocks: NotionBlock[]): OutreachScript | null {
  const headingIndex = blocks.findIndex(
    (b) => HEADING_TYPES.has(b.type) && /outreach drafts/i.test(blockText(b)),
  );
  if (headingIndex === -1) return null;

  const section: NotionBlock[] = [];
  for (let i = headingIndex + 1; i < blocks.length; i++) {
    if (HEADING_TYPES.has(blocks[i].type)) break;
    section.push(blocks[i]);
  }

  let dm = "";
  let emailSubject = "";
  let emailBody = "";
  const callPoints: string[] = [];

  for (let i = 0; i < section.length; i++) {
    const text = blockText(section[i]);
    const dmMatch = text.match(/^dm:?\s*(.*)$/i);
    const subjectMatch = text.match(/^email subject:?\s*(.*)$/i);
    const talkingPointsLabel = /^call talking points:?$/i.test(text.trim());

    if (dmMatch) {
      dm = dmMatch[1];
    } else if (subjectMatch) {
      emailSubject = subjectMatch[1];
      const next = section[i + 1];
      if (next && next.type === "paragraph" && !talkingPointsLabel) {
        emailBody = blockText(next);
        i++;
      }
    } else if (talkingPointsLabel) {
      for (let j = i + 1; j < section.length && section[j].type === "bulleted_list_item"; j++) {
        callPoints.push(blockText(section[j]));
        i = j;
      }
    }
  }

  if (!dm && !emailSubject && callPoints.length === 0) return null;
  return { dm, emailSubject, emailBody, callPoints };
}
