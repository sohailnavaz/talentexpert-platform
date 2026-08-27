import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// No CSP nonce here deliberately: nonces require every page to render
// dynamically (no static generation, no CDN caching — see Next's own CSP
// docs), which would undo the static optimization most of this site relies
// on. 'unsafe-inline' is the documented non-nonce path; it still blocks
// loading arbitrary external scripts via script-src's allowlist.
const cspDirectives = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://www.clarity.ms https://scripts.clarity.ms https://connect.facebook.net https://checkout.razorpay.com`,
  "style-src 'self' 'unsafe-inline'",
  // Broad https allowed for images/media: admins paste arbitrary thumbnail,
  // photo, cover, and recording URLs — there's no fixed host list to allow.
  "img-src 'self' https: data: blob:",
  "media-src 'self' https:",
  "font-src 'self' data:",
  "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.google.com https://*.clarity.ms https://api.razorpay.com https://lumberjack.razorpay.com https://connect.facebook.net",
  "frame-src https://www.youtube.com https://player.vimeo.com https://api.razorpay.com https://checkout.razorpay.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
];

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspDirectives.join("; ") },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.ngrok-free.dev", "*.trycloudflare.com"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
