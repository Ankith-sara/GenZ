const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

/**
 * Builds a public URL for an object in a public Supabase Storage bucket.
 * Returns null if there's no path.
 */
export function publicStorageUrl(bucket: string, path: string | null): string | null {
  if (!path || !SUPABASE_URL) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}
