'use server';
// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Marketing-site CMS write actions. RLS already restricts locs_site_content
// writes to admins (locs_is_admin()); requireAdmin() adds the server-side gate
// and identity. Each section is upserted as one row keyed by its section slug.

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin, SIGNIN_PATH } from '@/lib/locs/auth';
import { SECTION_KEYS, type SectionKey } from '@/lib/marketing/content';

type Result = { ok: boolean; error?: string };

const KEYS = new Set<string>(SECTION_KEYS);

/** Save (upsert) one editable page section. `data` is the whole section blob. */
export async function saveSection(key: SectionKey, data: unknown): Promise<Result> {
  if (!KEYS.has(key)) return { ok: false, error: `Unknown section: ${key}` };
  const { supabase, user } = await requireAdmin();

  const { error } = await supabase
    .from('locs_site_content')
    .upsert({ key, data, updated_by: user.email ?? 'admin' }, { onConflict: 'key' });

  if (error) return { ok: false, error: error.message };

  // Homepage reads on every request (revalidate = 0), but revalidate anyway so
  // any cached render is dropped immediately.
  revalidatePath('/');
  revalidatePath('/admin');
  return { ok: true };
}

export async function signOutAction() {
  const { supabase } = await requireAdmin();
  await supabase.auth.signOut();
  redirect(SIGNIN_PATH);
}
