"use server";

import { verifyAdminSession } from "@/lib/auth/dal";
import { getAdminSession, getTrainerSession } from "@/lib/auth/session";
import { saveUploadedFile, createPresignedUploadUrl } from "@/lib/storage";

export async function saveUploadedFileAction(formData: FormData): Promise<string> {
  await verifyAdminSession();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("No file provided");
  }
  return saveUploadedFile(file);
}

const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"]);

export async function getVideoUploadUrl(filename: string, contentType: string) {
  const admin = await getAdminSession();
  const trainer = await getTrainerSession();
  if (!admin && !trainer) throw new Error("Your session has expired. Please sign in again.");
  if (!ALLOWED_VIDEO_TYPES.has(contentType)) {
    throw new Error("Please upload an MP4, WebM, MOV, or MKV video file.");
  }
  return createPresignedUploadUrl(filename, contentType);
}
