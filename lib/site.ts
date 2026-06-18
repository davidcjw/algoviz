/**
 * Canonical site origin. Override at build/deploy time with NEXT_PUBLIC_SITE_URL
 * (e.g. set it in Vercel project settings to your real domain).
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://algoviz.dev"
).replace(/\/$/, "");

export const SITE_NAME = "AlgoViz";
export const SITE_DESCRIPTION =
  "The ultimate visual playground for mastering data structures, algorithms, and system design. Learn by watching concepts come alive — animated, interactive, unforgettable.";

export const absoluteUrl = (path = "/") =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
