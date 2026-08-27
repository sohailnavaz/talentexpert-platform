"use server";

import { verifyAdminSession } from "@/lib/auth/dal";
import { saveUploadedFile } from "@/lib/storage";

export async function saveUploadedFileAction(formData: FormData): Promise<string> {
  await verifyAdminSession();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("No file provided");
  }
  return saveUploadedFile(file);
}
