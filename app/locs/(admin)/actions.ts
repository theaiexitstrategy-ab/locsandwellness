'use server';
// (c) 2026 GoElev8.ai | Aaron Bryant. All rights reserved.
//
// Admin (Leslie) clinical-write actions. RLS already restricts every locs
// clinical table to admins; these actions add server-side identity + input
// shaping. Assessments are versioned — each save inserts a NEW dated row so
// change-over-time is preserved.

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/locs/auth';

const nz = (v: unknown) => (v === '' || v === undefined ? null : v);
function clean(o: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o)) out[k] = Array.isArray(v) ? v : nz(v);
  return out;
}

type Result = { ok: boolean; error?: string };
const fail = (e?: string): Result => ({ ok: false, error: e ?? 'Save failed.' });

function refresh(clientId: string) {
  revalidatePath(`/locs/admin/${clientId}`);
  revalidatePath('/locs/admin');
}

export async function saveProAssessment(clientId: string, row: Record<string, unknown>): Promise<Result> {
  const { supabase, user } = await requireAdmin();
  const { error } = await supabase.from('locs_pro_assessment')
    .insert({ client_id: clientId, assessed_by: user.email ?? 'admin', ...clean(row) });
  if (error) return fail(error.message);
  refresh(clientId);
  return { ok: true };
}

export async function saveElemental(clientId: string, row: Record<string, unknown>): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('locs_elemental_pattern')
    .insert({ client_id: clientId, ...clean(row) });
  if (error) return fail(error.message);
  refresh(clientId);
  return { ok: true };
}

// A full zone-map snapshot: one assessed_at, seven zone rows inserted together.
export async function saveZoneMap(
  clientId: string, assessedAt: string, zones: Record<string, unknown>[],
): Promise<Result> {
  const { supabase } = await requireAdmin();
  const rows = zones.map((z) => ({ client_id: clientId, assessed_at: assessedAt, ...clean(z) }));
  const { error } = await supabase.from('locs_scalp_zone_map').insert(rows);
  if (error) return fail(error.message);
  refresh(clientId);
  return { ok: true };
}

export async function saveSummary(clientId: string, row: Record<string, unknown>): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('locs_scalp_summary')
    .insert({ client_id: clientId, ...clean(row) });
  if (error) return fail(error.message);
  refresh(clientId);
  return { ok: true };
}

// Publishing toggle — flip a single summary row's client visibility.
export async function toggleSummaryVisible(
  clientId: string, summaryId: string, visible: boolean,
): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('locs_scalp_summary')
    .update({ visible_to_client: visible }).eq('id', summaryId);
  if (error) return fail(error.message);
  refresh(clientId);
  return { ok: true };
}

export async function addAdminNote(clientId: string, note: string): Promise<Result> {
  const { supabase, user } = await requireAdmin();
  if (!note.trim()) return fail('Note is empty.');
  const { error } = await supabase.from('locs_admin_notes')
    .insert({ client_id: clientId, author: user.email ?? 'admin', note: note.trim() });
  if (error) return fail(error.message);
  refresh(clientId);
  return { ok: true };
}
