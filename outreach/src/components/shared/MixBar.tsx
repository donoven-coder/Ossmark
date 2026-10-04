const PALETTE = ["#E8B84B", "#A855F7", "#22D3EE", "#22C55E", "#F472B6"];

export function MixBar({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, n]) => sum + n, 0) || 1;

  return (
    <div>
      <div className="flex h-6.5 overflow-hidden rounded-lg border border-(--color-line)">
        {entries.map(([name, count], i) => {
          const pct = Math.max(Math.round((count / total) * 100), 3);
          return (
            <div
              key={name}
              className="flex items-center justify-center text-[10px] font-extrabold text-[#1A1408]"
              style={{ width: `${pct}%`, background: PALETTE[i % PALETTE.length] }}
              title={`${name}: ${count}`}
            >
              {count}
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-3.5 text-[10.5px] text-(--color-sub)">
        {entries.map(([name, count], i) => (
          <span key={name} className="flex items-center gap-1.25">
            <span className="h-2 w-2 rounded-sm" style={{ background: PALETTE[i % PALETTE.length] }} />
            {name} ({count})
          </span>
        ))}
      </div>
    </div>
  );
}
