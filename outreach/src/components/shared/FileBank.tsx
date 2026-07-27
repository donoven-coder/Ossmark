import { useRef } from "react";
import { File as FileIcon, Trash2, Upload } from "lucide-react";
import { useFiles, useUploadFile, useDeleteFile } from "../../hooks/useFiles";

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileBank({ scope }: { scope: "scout" | "closer" }) {
  const filesQuery = useFiles(scope);
  const upload = useUploadFile(scope);
  const del = useDeleteFile(scope);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload.mutateAsync(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={upload.isPending}
        className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-(--color-violet)/50 bg-(--color-panel2) py-3 text-[11.5px] font-bold text-(--color-violet) disabled:opacity-50"
      >
        <Upload size={14} />
        {upload.isPending ? "Uploading…" : "Upload file"}
      </button>

      {filesQuery.isLoading && <div className="text-[11px] text-(--color-sub) italic">Loading files…</div>}
      {filesQuery.data?.files.length === 0 && (
        <div className="text-[11px] text-(--color-sub) italic">No files yet in this bank.</div>
      )}
      <div className="space-y-1.5">
        {filesQuery.data?.files.map((f) => (
          <div
            key={f.key}
            className="flex items-center gap-2.5 rounded-lg border border-(--color-line) bg-(--color-panel2) px-3 py-2"
          >
            <FileIcon size={14} className="shrink-0 text-(--color-sub)" />
            <a
              href={f.downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="min-w-0 flex-1 truncate text-[11.5px] font-semibold text-(--color-ink)"
            >
              {f.filename}
            </a>
            <span className="shrink-0 text-[9.5px] text-(--color-sub)">{formatBytes(f.sizeBytes)}</span>
            <button
              type="button"
              onClick={() => del.mutate(f.key)}
              className="shrink-0 text-(--color-crimson) active:scale-90"
              aria-label={`Delete ${f.filename}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
