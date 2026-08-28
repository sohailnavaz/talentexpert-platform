import "server-only";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function safeExtension(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  return /^\.[a-z0-9]{2,5}$/.test(ext) ? ext : "";
}

function getS3Client() {
  const { S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = process.env;
  if (!S3_ENDPOINT || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) return null;

  return new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint: S3_ENDPOINT,
    credentials: { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY },
  });
}

/**
 * Saves an uploaded file and returns a public URL.
 * Uploads to S3/R2 when credentials are configured; falls back to local
 * /public/uploads otherwise (dev-only — Vercel's filesystem is read-only).
 */
export async function saveUploadedFile(file: File): Promise<string> {
  const ext = safeExtension(file.name);
  const filename = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const s3 = getS3Client();
  const bucket = process.env.S3_BUCKET;
  const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL;

  if (s3 && bucket && publicBaseUrl) {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: filename,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
      })
    );
    return `${publicBaseUrl.replace(/\/$/, "")}/${filename}`;
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

/**
 * Returns a short-lived URL the browser can PUT a large file (e.g. a video
 * recording) to directly, bypassing the server entirely — necessary since
 * proxying a multi-hundred-MB file through a Server Action would hit
 * Vercel's request body size limit.
 */
export async function createPresignedUploadUrl(
  filename: string,
  contentType: string
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const s3 = getS3Client();
  const bucket = process.env.S3_BUCKET;
  const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL;
  if (!s3 || !bucket || !publicBaseUrl) {
    throw new Error("File storage isn't configured for direct uploads.");
  }

  const ext = safeExtension(filename);
  const key = `${randomUUID()}${ext}`;
  const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 15 * 60 });
  return { uploadUrl, publicUrl: `${publicBaseUrl.replace(/\/$/, "")}/${key}` };
}

const VIDEO_URL_EXPIRY_SECONDS = 4 * 60 * 60;
const DEFAULT_ASSET_URL_EXPIRY_SECONDS = 24 * 60 * 60;

/**
 * If `url` points at our own storage bucket, swap it for a short-lived signed
 * GET URL so a saved link can't be replayed/redistributed indefinitely.
 * Anything else (a pasted YouTube/Vimeo/external link) is returned unchanged
 * — callers that let admins paste an arbitrary URL (photos, thumbnails,
 * cover images) rely on this to avoid trying to sign a non-R2 host.
 */
export async function resolveStorageUrl(
  url: string,
  expirySeconds = DEFAULT_ASSET_URL_EXPIRY_SECONDS
): Promise<string> {
  const s3 = getS3Client();
  const bucket = process.env.S3_BUCKET;
  const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL;
  if (!s3 || !bucket || !publicBaseUrl) return url;

  const prefix = `${publicBaseUrl.replace(/\/$/, "")}/`;
  if (!url.startsWith(prefix)) return url;

  const key = url.slice(prefix.length);
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(s3, command, { expiresIn: expirySeconds });
}

export async function resolveStorageUrlOrNull(
  url: string | null | undefined,
  expirySeconds?: number
): Promise<string | null> {
  if (!url) return null;
  return resolveStorageUrl(url, expirySeconds);
}

export function isSignableStorageUrl(url: string | null | undefined): boolean {
  const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL;
  if (!url || !publicBaseUrl) return false;
  return url.startsWith(`${publicBaseUrl.replace(/\/$/, "")}/`);
}

export { VIDEO_URL_EXPIRY_SECONDS };
