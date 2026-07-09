'use server';
// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Marketing-site CMS write action, living inside Leslie's portal admin. RLS
// restricts locs_site_content writes to admins (locs_is_admin()); requireAdmin
// adds the server-side gate + identity. Each section upserts as one row.

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/locs/auth';
import { SECTION_KEYS, type SectionKey } from '@/lib/marketing/content';

type Result = { ok: boolean; error?: string };

const KEYS = new Set<string>(SECTION_KEYS);

export async function saveSection(key: SectionKey, data: unknown): Promise<Result> {
  if (!KEYS.has(key)) return { ok: false, error: `Unknown section: ${key}` };
  const { supabase, user } = await requireAdmin();

  const { error } = await supabase
    .from('locs_site_content')
    .upsert({ key, data, updated_by: user.email ?? 'admin' }, { onConflict: 'key' });

  if (error) return { ok: false, error: error.message };

  revalidatePath('/');                       // public marketing homepage
  revalidatePath('/locs/admin/website');     // this editor
  return { ok: true };
}
