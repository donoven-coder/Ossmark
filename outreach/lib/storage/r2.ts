/**
 * File Bank storage on Cloudflare R2 (S3-compatible). R2 credentials never
 * reach the browser: uploads use a short-lived presigned PUT URL the client
 * uploads directly to (the binary never transits our function), and deletes
 * go through our own DELETE endpoint using server-held credentials.
 *
 * R2 is the source of truth for the File Bank — no separate database. Scope
 * (scout/closer) is encoded as an object-key prefix, and the original
 * filename + uploader are stored as S3 custom metadata on the object, so a
 * simple ListObjectsV2 by prefix reconstructs the whole file list, survives
 * reload, and needs nothing else running to stay in sync.
 */
import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";

export type FileScope = "scout" | "closer";

function client(): S3Client {
  const accountId = requireEnv("R2_ACCOUNT_ID");
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set. Required as a server-side env var for file storage.`);
  return v;
}

function bucket(): string {
  return requireEnv("R2_BUCKET");
}

function slugify(filename: string): string {
  return filename.toLowerCase().replace(/[^a-z0-9.-]+/g, "-").replace(/-+/g, "-");
}

export interface PresignedUpload {
  key: string;
  uploadUrl: string;
  expiresInSeconds: number;
}

export async function createPresignedUpload(scope: FileScope, filename: string, contentType: string): Promise<PresignedUpload> {
  const key = `${scope}/${Date.now()}-${nanoid(6)}-${slugify(filename)}`;
  const command = new PutObjectCommand({
    Bucket: bucket(),
    Key: key,
    ContentType: contentType,
    Metadata: { "original-filename": filename },
  });
  const expiresInSeconds = 300;
  const uploadUrl = await getSignedUrl(client(), command, { expiresIn: expiresInSeconds });
  return { key, uploadUrl, expiresInSeconds };
}

export interface FileBankEntry {
  key: string;
  filename: string;
  scope: FileScope;
  sizeBytes: number;
  uploadedAt: string;
  downloadUrl: string;
}

export async function listFiles(scope: FileScope): Promise<FileBankEntry[]> {
  const res = await client().send(new ListObjectsV2Command({ Bucket: bucket(), Prefix: `${scope}/` }));
  const objects = res.Contents ?? [];

  return Promise.all(
    objects.map(async (obj) => {
      const key = obj.Key!;
      const downloadUrl = await getSignedUrl(client(), new GetObjectCommand({ Bucket: bucket(), Key: key }), {
        expiresIn: 3600,
      });
      return {
        key,
        filename: key.split("/").slice(1).join("/").replace(/^\d+-[\w-]{6}-/, ""),
        scope,
        sizeBytes: obj.Size ?? 0,
        uploadedAt: obj.LastModified?.toISOString() ?? "",
        downloadUrl,
      };
    }),
  );
}

export async function deleteFile(key: string): Promise<void> {
  await client().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
}
