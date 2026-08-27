import "server-only";
import { db } from "@/lib/db";

export async function generateEnrollmentCode() {
  const count = await db.enrollment.count();
  const now = new Date();
  const yy = now.getFullYear().toString().slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return `HT-${yy}${mm}-${String(count + 1).padStart(4, "0")}`;
}
