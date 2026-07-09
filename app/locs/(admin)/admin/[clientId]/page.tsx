// (c) 2026 GoElev8.ai | Aaron Bryant. All rights reserved.
//
// Admin client detail — "MyChart for the scalp". Read-only intake reference on
// the left; the editable, versioned clinical layer (ClinicalPanels) on the right.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/locs/auth';
import {
  STRESS_LEVEL, SLEEP_QUALITY, WATER_INTAKE, EXERCISE_ROUTINE, MAIN_CONCERNS, CONCERN_TREND,
  WASH_FREQUENCY, SCALP_SYMPTOMS, LOC_STAGE, LOC_METHOD, labelFor,
} from '@/lib/locs/constants';
import ClinicalPanels, { type ClinicalData } from '@/components/locs/ClinicalPanels';

export const dynamic = 'force-dynamic';

const fmtDate = (d: any) => (d ? new Date(d).toLocaleDateString() : '—');
const yesno = (b: any) => (b ? 'Yes' : 'No');
const list = (options: any, values: any) =>
  Array.isArray(values) && values.length ? values.map((v: string) => labelFor(options, v)).join(', ') : '—';

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-locs-gray">{label}</span>
      <span className="text-right text-locs-ink">{value || '—'}</span>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="locs-card p-5">
      <h3 className="mb-2 font-display text-base font-semibold text-locs-emerald">{title}</h3>
      <div className="divide-y divide-locs-rule/60">{children}</div>
    </section>
  );
}

export default async function ClientDetailPage({ params }: { params: { clientId: string } }) {
  const { supabase } = await requireAdmin();
  const clientId = params.clientId;

  const [client, health, scalp, loc, pro, elemental, zones, summaries, notes] = await Promise.all([
    supabase.from('locs_clients').select('*').eq('id', clientId).maybeSingle(),
    supabase.from('locs_intake_health').select('*').eq('client_id', clientId).maybeSingle(),
    supabase.from('locs_intake_scalp_history').select('*').eq('client_id', clientId).maybeSingle(),
    supabase.from('locs_loc_profile').select('*').eq('client_id', clientId).maybeSingle(),
    supabase.from('locs_pro_assessment').select('*').eq('client_id', clientId).order('assessed_at', { ascending: false }),
    supabase.from('locs_elemental_pattern').select('*').eq('client_id', clientId).order('assessed_at', { ascending: false }),
    supabase.from('locs_scalp_zone_map').select('*').eq('client_id', clientId).order('assessed_at', { ascending: false }),
    supabase.from('locs_scalp_summary').select('*').eq('client_id', clientId).order('assessed_at', { ascending: false }),
    supabase.from('locs_admin_notes').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
  ]);

  if (!client.data) notFound();
  const c = client.data, h = health.data ?? {}, s = scalp.data ?? {}, l = loc.data ?? {};

  // Group zone-map rows into dated snapshots (7 zones share one assessed_at).
  const zoneSnapshots = Object.values(
    (zones.data ?? []).reduce((acc: Record<string, any>, z: any) => {
      (acc[z.assessed_at] ??= { assessedAt: z.assessed_at, zones: {} }).zones[z.zone] = z;
      return acc;
    }, {}),
  ).sort((a: any, b: any) => (a.assessedAt < b.assessedAt ? 1 : -1));

  const clinical: ClinicalData = {
    clientId,
    proHistory: pro.data ?? [],
    elementalHistory: elemental.data ?? [],
    zoneSnapshots: zoneSnapshots as ClinicalData['zoneSnapshots'],
    summaries: summaries.data ?? [],
    notes: notes.data ?? [],
  };

  return (
    <div>
      <Link href="/locs/admin" className="text-sm text-locs-emerald hover:underline">← All clients</Link>
      <header className="mb-6 mt-2">
        <h1 className="font-display text-2xl font-semibold text-locs-ink">{c.full_name ?? '(no name)'}</h1>
        <p className="text-locs-silver">{c.email} · Intake {fmtDate(c.intake_submitted_at)}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
        {/* Read-only intake reference */}
        <div className="space-y-5">
          <Card title="Client">
            <Row label="Phone" value={c.phone} />
            <Row label="DOB" value={fmtDate(c.dob)} />
            <Row label="Occupation" value={c.occupation} />
            <Row label="Referred by" value={c.referred_by} />
          </Card>
          <Card title="Loc profile">
            <Row label="Stage" value={labelFor(LOC_STAGE, l.loc_stage)} />
            <Row label="Method" value={labelFor(LOC_METHOD, l.loc_method)} />
            <Row label="Started" value={fmtDate(l.loc_age_start_date)} />
            <Row label="Last retwist" value={fmtDate(l.last_retwist_date)} />
            <Row label="Retwist cycle" value={l.retwist_frequency_weeks ? `${l.retwist_frequency_weeks} wks` : '—'} />
            <Row label="Loc count" value={l.loc_count} />
            <Row label="Style" value={l.current_style} />
            <Row label="Notes" value={l.maintenance_notes} />
          </Card>
          <Card title="Health & lifestyle">
            <Row label="Overall health" value={h.overall_health} />
            <Row label="Conditions" value={h.medical_conditions} />
            <Row label="Hormonal" value={h.hormonal_imbalances} />
            <Row label="Pregnant/nursing" value={yesno(h.pregnant_or_nursing)} />
            <Row label="Medications" value={h.medications_supplements} />
            <Row label="Stress" value={labelFor(STRESS_LEVEL, h.stress_level)} />
            <Row label="Sleep" value={labelFor(SLEEP_QUALITY, h.sleep_quality)} />
            <Row label="Diet" value={h.diet_type} />
            <Row label="Water" value={labelFor(WATER_INTAKE, h.water_intake)} />
            <Row label="Exercise" value={labelFor(EXERCISE_ROUTINE, h.exercise_routine)} />
            <Row label="Smoke/alcohol" value={h.smokes_or_drinks} />
          </Card>
          <Card title="Scalp & hair history">
            <Row label="Main concerns" value={list(MAIN_CONCERNS, s.main_concerns)} />
            {s.concern_other && <Row label="Other" value={s.concern_other} />}
            <Row label="Onset" value={s.concern_onset} />
            <Row label="Trend" value={labelFor(CONCERN_TREND, s.concern_trend)} />
            <Row label="Seen specialist" value={yesno(s.seen_specialist)} />
            <Row label="Family history" value={yesno(s.family_history_hair_loss)} />
            <Row label="Recent treatments" value={yesno(s.recent_treatments)} />
            <Row label="Wash frequency" value={labelFor(WASH_FREQUENCY, s.wash_frequency)} />
            <Row label="Products" value={s.current_products} />
            <Row label="Symptoms" value={list(SCALP_SYMPTOMS, s.scalp_symptoms)} />
            <Row label="Concern rating" value={s.concern_rating ? `${s.concern_rating}/10` : '—'} />
          </Card>
        </div>

        {/* Editable clinical layer */}
        <ClinicalPanels data={clinical} />
      </div>
    </div>
  );
}
