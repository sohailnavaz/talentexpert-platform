import "server-only";
import { headers } from "next/headers";

export async function getRequestInfo() {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : (headerList.get("x-real-ip") ?? null);
  const userAgent = headerList.get("user-agent");
  return { ip, userAgent };
}
