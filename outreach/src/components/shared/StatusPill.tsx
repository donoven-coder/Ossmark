import { cn } from "../../lib/cn";

export function StatusPill({ status }: { status: string | null }) {
  const label = status ?? "New";
  const tone =
    status === "Not Interested" || status === "Disqualified"
      ? "bg-(--color-crimson)/13 text-[#FCA5A5]"
      : status
        ? "border border-(--color-violet)/33 bg-(--color-violet)/13 text-[#C4B5FD]"
        : "bg-(--color-line) text-(--color-sub)";

  return (
    <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[9.5px] font-extrabold tracking-wide uppercase", tone)}>
      {label}
    </span>
  );
}
