'use server';
// (c) 2026 GoElev8.ai | Aaron Bryant. All rights reserved.
//
// Intake submission. Runs under the client's own session, so RLS confines
// every write to their own rows. The locs_clients id is resolved server-side
// from the session — never trusted from the payload.

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ensureClient } from '@/lib/locs/auth';

export type IntakePayload = {
  client: {
    full_name: string; dob: string; phone: string; email: string;
    occupation: string; referred_by: string;
  };
  health: {
    overall_health: string; medical_conditions: string; hormonal_imbalances: string;
    pregnant_or_nursing: boolean; medications_supplements: string; stress_level: string;
    sleep_quality: string; diet_type: string; water_intake: string;
    exercise_routine: string; smokes_or_drinks: string;
  };
  scalp: {
    main_concerns: string[]; concern_other: string; concern_onset: string; concern_trend: string;
    seen_specialist: boolean; specialist_name: string; family_history_hair_loss: boolean;
    family_history_detail: string; recent_treatments: boolean; treatment_detail: string;
    wash_frequency: string; current_products: string; scalp_symptoms: string[];
    concern_rating: number | '';
  };
  loc: {
    loc_stage: string; loc_method: string; loc_age_start_date: string; last_retwist_date: string;
    retwist_frequency_weeks: number | ''; loc_count: number | ''; current_style: string;
    maintenance_notes: string;
  };
};

// Empty string / '' → null so optional columns and CHECK constraints stay happy.
const nz = (v: unknown) => (v === '' || v === undefined ? null : v);
const obj = (o: Record<string, unknown>) => {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o)) out[k] = Array.isArray(v) ? v : nz(v);
  return out;
};

export async function submitIntake(payload: IntakePayload): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not signed in.' };

  const clientId = await ensureClient(supabase, user);
  if (!clientId) return { ok: false, error: 'This account is not a client account.' };

  const now = new Date().toISOString();

  // Section 1 — client profile (+ intake stamps).
  const { error: cErr } = await supabase
    .from('locs_clients')
    .update({ ...obj(payload.client), intake_submitted_at: now, intake_updated_at: now })
    .eq('id', clientId);
  if (cErr) return { ok: false, error: cErr.message };

  const upsert = (table: string, row: Record<string, unknown>) =>
    supabase.from(table).upsert({ client_id: clientId, ...obj(row) }, { onConflict: 'client_id' });

  const results = await Promise.all([
    upsert('locs_intake_health', payload.health),
    upsert('locs_intake_scalp_history', payload.scalp),
    upsert('locs_loc_profile', payload.loc),
  ]);
  const failed = results.find((r) => r.error);
  if (failed?.error) return { ok: false, error: failed.error.message };

  revalidatePath('/locs/dashboard');
  return { ok: true };
}
