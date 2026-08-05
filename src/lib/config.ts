/**
 * Site URL resolution — single source of truth for the app's canonical base URL.
 *
 * Resolution order:
 *   1. NEXT_PUBLIC_SITE_URL — explicit custom domain (e.g. https://genzonline.in).
 *      This MUST be set in production; Vercel's own URL is never your custom domain.
 *   2. VERCEL_URL            — auto-injected per-deployment URL (preview/prod), no protocol.
 *   3. http://localhost:3000 — local dev fallback.
 *
 * The result is validated with the URL constructor and normalized (protocol enforced,
 * no trailing slash), so every consumer can safely do `${SITE_URL}/path`.
 */

const LOCALHOST_FALLBACK = "http://localhost:3000";

function resolveRawUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit;

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) return `https://${vercelUrl}`;

  return LOCALHOST_FALLBACK;
}

function normalizeUrl(raw: string): string {
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const parsed = new URL(withProtocol);
    // Strip trailing slash from pathname so `${SITE_URL}/foo` never yields `//foo`.
    parsed.pathname = parsed.pathname.replace(/\/+$/, "");
    return parsed.origin + parsed.pathname;
  } catch {
    // Malformed env var — fail loudly rather than silently shipping a broken URL
    // to canonical tags, sitemaps, or OG metadata.
    console.error(
      `[site-url] Invalid URL from environment: "${raw}". Falling back to ${LOCALHOST_FALLBACK}.`
    );
    return LOCALHOST_FALLBACK;
  }
}

/** Resolves and validates the app's base site URL from environment variables. */
export function getSiteUrl(): string {
  return normalizeUrl(resolveRawUrl());
}

/** Canonical base URL, e.g. "https://genzonline.in" — no trailing slash. */
export const SITE_URL = getSiteUrl();

if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_SITE_URL) {
  console.warn(
    "[site-url] NEXT_PUBLIC_SITE_URL is not set in production. " +
      `Falling back to VERCEL_URL / localhost — SEO metadata and canonical URLs may be wrong. Resolved: ${SITE_URL}`
  );
}
