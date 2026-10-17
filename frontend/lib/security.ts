import crypto from "crypto";

// Basic HTML escaping to prevent XSS attacks when rendering raw strings
export function sanitizeText(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Compute a unique SHA-256 fingerprint hash of IP address + User Agent
export function getFingerprint(ip: string, userAgent: string): string {
  const salt = process.env.SUPABASE_SERVICE_ROLE_KEY || "nexbyte-salt-key-1337";
  return crypto
    .createHash("sha256")
    .update(`${ip}-${userAgent}-${salt}`)
    .digest("hex");
}

// Basic in-memory rate limiting to guard API routes from basic flood attacks
const ipRequestLog: Record<string, number[]> = {};

export function checkRateLimit(ip: string, limit = 5, windowMs = 60000): boolean {
  const now = Date.now();
  if (!ipRequestLog[ip]) {
    ipRequestLog[ip] = [];
  }

  // Filter out timestamps older than the rate limit window
  ipRequestLog[ip] = ipRequestLog[ip].filter((time) => now - time < windowMs);

  if (ipRequestLog[ip].length >= limit) {
    return false; // Limit exceeded
  }

  ipRequestLog[ip].push(now);
  return true; // OK
}
