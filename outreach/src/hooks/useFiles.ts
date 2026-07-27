import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchFiles, requestFileUpload, deleteFile } from "../lib/api";

export function filesKey(scope: "scout" | "closer") {
  return ["files", scope] as const;
}

export function useFiles(scope: "scout" | "closer") {
  return useQuery({
    queryKey: filesKey(scope),
    queryFn: () => fetchFiles(scope),
    staleTime: 30_000,
  });
}

export function useUploadFile(scope: "scout" | "closer") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => requestFileUpload(scope, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: filesKey(scope) }),
  });
}

export function useDeleteFile(scope: "scout" | "closer") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => deleteFile(key),
    onSuccess: () => qc.invalidateQueries({ queryKey: filesKey(scope) }),
  });
}
