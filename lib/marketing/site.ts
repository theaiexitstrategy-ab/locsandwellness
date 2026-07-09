// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Server-side content loader for the marketing site. Reads the editable
// locs_site_content rows and merges them OVER the code DEFAULTS, so every
// section renders the Leslie-edited value when present and the default
// otherwise. Public read is allowed by RLS, so this works for anonymous
// visitors with the anon client.

import { createClient } from '@/lib/supabase/server';
import { DEFAULTS, SECTION_KEYS, type SiteContent, type SectionKey } from './content';

// resolveImage lives in a client-safe module (no next/headers) so admin fields
// can use it too; re-exported here for convenience.
export { resolveImage } from './image';

/** Shallow-merge a saved section blob over its default so newly-added default
 *  keys survive even if an older saved row predates them. Arrays/objects saved
 *  by the admin form replace the default wholesale (the form submits the whole
 *  section), which is the intended behavior for lists like services/products. */
function mergeSection<K extends SectionKey>(key: K, saved: unknown): SiteContent[K] {
  const def = DEFAULTS[key];
  if (saved == null || typeof saved !== 'object' || Array.isArray(saved) || Array.isArray(def)) {
    // `services` is a top-level array — a saved value replaces it entirely.
    return (saved == null ? def : (saved as SiteContent[K]));
  }
  return { ...(def as object), ...(saved as object) } as SiteContent[K];
}

/** Load the full, merged site content. Falls back to DEFAULTS on any error so
 *  the homepage never hard-fails just because the CMS table is empty/missing. */
export async function getSiteContent(): Promise<SiteContent> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('locs_site_content').select('key, data');
    if (error || !data) return DEFAULTS;

    const byKey = new Map(data.map((r) => [r.key as string, r.data]));
    const out = {} as Record<string, unknown>;
    for (const key of SECTION_KEYS) {
      out[key] = mergeSection(key, byKey.get(key));
    }
    return out as unknown as SiteContent;
  } catch {
    return DEFAULTS;
  }
}
