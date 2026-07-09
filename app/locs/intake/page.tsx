// (c) 2026 GoElev8.ai | Aaron Bryant. All rights reserved.
//
// Intake page — loads any existing answers to prefill, then renders the
// multi-step form. Admins are bounced to their own portal.

import { redirect } from 'next/navigation';
import { requireUser, getRole, ensureClient, ADMIN_HOME } from '@/lib/locs/auth';
import IntakeForm from './IntakeForm';
import type { IntakePayload } from './actions';

export const dynamic = 'force-dynamic';

const str = (v: unknown) => (v == null ? '' : String(v));
const num = (v: unknown) => (v == null ? '' : Number(v)) as number | '';
const arr = (v: unknown) => (Array.isArray(v) ? (v as string[]) : []);

export default async function IntakePage() {
  const { supabase, user } = await requireUser();
  if ((await getRole(supabase, user.id)) === 'admin') redirect(ADMIN_HOME);

  const clientId = await ensureClient(supabase, user);
  if (!clientId) redirect(ADMIN_HOME);

  const [client, health, scalp, loc] = await Promise.all([
    supabase.from('locs_clients').select('*').eq('id', clientId).maybeSingle(),
    supabase.from('locs_intake_health').select('*').eq('client_id', clientId).maybeSingle(),
    supabase.from('locs_intake_scalp_history').select('*').eq('client_id', clientId).maybeSingle(),
    supabase.from('locs_loc_profile').select('*').eq('client_id', clientId).maybeSingle(),
  ]);

  const c = client.data ?? {}, h = health.data ?? {}, s = scalp.data ?? {}, l = loc.data ?? {};
  const initial: IntakePayload = {
    client: {
      full_name: str(c.full_name), dob: str(c.dob), phone: str(c.phone),
      email: str(c.email) || str(user.email), occupation: str(c.occupation), referred_by: str(c.referred_by),
    },
    health: {
      overall_health: str(h.overall_health), medical_conditions: str(h.medical_conditions),
      hormonal_imbalances: str(h.hormonal_imbalances), pregnant_or_nursing: !!h.pregnant_or_nursing,
      medications_supplements: str(h.medications_supplements), stress_level: str(h.stress_level),
      sleep_quality: str(h.sleep_quality), diet_type: str(h.diet_type), water_intake: str(h.water_intake),
      exercise_routine: str(h.exercise_routine), smokes_or_drinks: str(h.smokes_or_drinks),
    },
    scalp: {
      main_concerns: arr(s.main_concerns), concern_other: str(s.concern_other),
      concern_onset: str(s.concern_onset), concern_trend: str(s.concern_trend),
      seen_specialist: !!s.seen_specialist, specialist_name: str(s.specialist_name),
      family_history_hair_loss: !!s.family_history_hair_loss, family_history_detail: str(s.family_history_detail),
      recent_treatments: !!s.recent_treatments, treatment_detail: str(s.treatment_detail),
      wash_frequency: str(s.wash_frequency), current_products: str(s.current_products),
      scalp_symptoms: arr(s.scalp_symptoms), concern_rating: num(s.concern_rating),
    },
    loc: {
      loc_stage: str(l.loc_stage), loc_method: str(l.loc_method),
      loc_age_start_date: str(l.loc_age_start_date), last_retwist_date: str(l.last_retwist_date),
      retwist_frequency_weeks: num(l.retwist_frequency_weeks), loc_count: num(l.loc_count),
      current_style: str(l.current_style), maintenance_notes: str(l.maintenance_notes),
    },
  };

  return <IntakeForm initial={initial} isEdit={!!c.intake_submitted_at} />;
}
