import "server-only";

// In-memory sliding-window limiter. Good enough to blunt basic brute-force
// tools that hammer one endpoint from a single warm serverless instance;
// it does NOT share state across instances or survive a cold start. For
// real distributed protection, move this to Upstash Redis (or Vercel's
// Firewall rate limiting) — same call sites, different storage.
const attempts = new Map<string, number[]>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function recentAttempts(key: string, now: number) {
  return (attempts.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
}

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = recentAttempts(key, now);
  attempts.set(key, timestamps);
  return timestamps.length >= MAX_ATTEMPTS;
}

export function recordFailedAttempt(key: string) {
  const now = Date.now();
  const timestamps = recentAttempts(key, now);
  timestamps.push(now);
  attempts.set(key, timestamps);
}

export function clearAttempts(key: string) {
  attempts.delete(key);
}
