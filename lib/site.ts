/**
 * Canonical site origin. Resolution order:
 *  1. NEXT_PUBLIC_SITE_URL  — set this to your custom domain in production.
 *  2. VERCEL_PROJECT_PRODUCTION_URL — Vercel injects the production domain at build time.
 *  3. Fallback placeholder.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://algoviz.dev")
).replace(/\/$/, "");

export const SITE_NAME = "AlgoViz";
export const SITE_DESCRIPTION =
  "The ultimate visual playground for mastering data structures, algorithms, and system design. Learn by watching concepts come alive — animated, interactive, unforgettable.";

export const absoluteUrl = (path = "/") =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
