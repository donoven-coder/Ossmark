/** Low-level Notion property JSON <-> plain value helpers. Pure functions, easy to unit test. */

type Props = Record<string, any>;

export function readTitle(props: Props, name: string): string {
  return props[name]?.title?.map((t: any) => t.plain_text).join("") ?? "";
}
export function titleProp(value: string) {
  return { title: value ? [{ type: "text", text: { content: value } }] : [] };
}

export function readRichText(props: Props, name: string): string {
  return props[name]?.rich_text?.map((t: any) => t.plain_text).join("") ?? "";
}
export function richTextProp(value: string) {
  return { rich_text: value ? [{ type: "text", text: { content: value } }] : [] };
}

export function readSelect(props: Props, name: string): string | null {
  return props[name]?.select?.name ?? null;
}
export function selectProp(value: string | null) {
  return { select: value ? { name: value } : null };
}

export function readMultiSelect(props: Props, name: string): string[] {
  return (props[name]?.multi_select ?? []).map((o: any) => o.name);
}

export function readStatus(props: Props, name: string): string | null {
  return props[name]?.status?.name ?? null;
}
export function statusProp(value: string | null) {
  return { status: value ? { name: value } : null };
}

export function readNumber(props: Props, name: string): number | null {
  return props[name]?.number ?? null;
}
export function numberProp(value: number | null) {
  return { number: value };
}

export function readCheckbox(props: Props, name: string): boolean {
  return !!props[name]?.checkbox;
}
export function checkboxProp(value: boolean) {
  return { checkbox: value };
}

export function readEmail(props: Props, name: string): string | null {
  return props[name]?.email ?? null;
}
export function emailProp(value: string | null) {
  return { email: value };
}

export function readPhone(props: Props, name: string): string | null {
  return props[name]?.phone_number ?? null;
}
export function phoneProp(value: string | null) {
  return { phone_number: value };
}

export function readUrl(props: Props, name: string): string | null {
  return props[name]?.url ?? null;
}
export function urlProp(value: string | null) {
  return { url: value };
}

export function readDateStart(props: Props, name: string): string | null {
  return props[name]?.date?.start ?? null;
}
export function dateProp(value: string | null) {
  return { date: value ? { start: value } : null };
}

export function readRelationIds(props: Props, name: string): string[] {
  return (props[name]?.relation ?? []).map((r: any) => r.id);
}
export function relationProp(ids: string[]) {
  return { relation: ids.map((id) => ({ id })) };
}
