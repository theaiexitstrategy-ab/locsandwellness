// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Client-safe image helper (no server-only imports) so it can be used from
// both Server Components and 'use client' admin fields.

export const SITE_BUCKET = 'locs-site';

/** Public URL for an image field: passthrough for http(s) or root-relative,
 *  bucket URL for a storage path, '' for empty (rendered as a placeholder). */
export function resolveImage(value: string | undefined | null): string {
  if (!value) return '';
  if (/^https?:\/\//i.test(value) || value.startsWith('/')) return value;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return `${base}/storage/v1/object/public/${SITE_BUCKET}/${value}`;
}
