export function describeDevice(userAgent: string | null): string | null {
  if (!userAgent) return null;

  let browser = "Unknown browser";
  if (/edg\//i.test(userAgent)) browser = "Edge";
  else if (/chrome\//i.test(userAgent)) browser = "Chrome";
  else if (/firefox\//i.test(userAgent)) browser = "Firefox";
  else if (/safari\//i.test(userAgent)) browser = "Safari";

  let os = "Unknown OS";
  if (/windows/i.test(userAgent)) os = "Windows";
  else if (/mac os x/i.test(userAgent)) os = "macOS";
  else if (/android/i.test(userAgent)) os = "Android";
  else if (/iphone|ipad/i.test(userAgent)) os = "iOS";
  else if (/linux/i.test(userAgent)) os = "Linux";

  return `${browser} on ${os}`;
}
