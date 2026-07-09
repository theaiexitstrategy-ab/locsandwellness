'use client';
// (c) 2026 GoElev8.ai | Aaron Bryant. All rights reserved.
//
// Four-step structured intake: Client Info → Health & Lifestyle →
// Scalp & Hair History → Loc Profile. Writes via the submitIntake action.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TextField, TextArea, NumberField, RadioChips, CheckChips, Toggle,
} from '@/components/locs/fields';
import { LocsFooter } from '@/components/locs/chrome';
import {
  STRESS_LEVEL, SLEEP_QUALITY, WATER_INTAKE, EXERCISE_ROUTINE, MAIN_CONCERNS, CONCERN_TREND,
  WASH_FREQUENCY, SCALP_SYMPTOMS, LOC_STAGE, LOC_METHOD,
} from '@/lib/locs/constants';
import { submitIntake, type IntakePayload } from './actions';

const STEPS = ['Client Info', 'Health & Lifestyle', 'Scalp & Hair', 'Your Locs'];

export default function IntakeForm({ initial, isEdit }: { initial: IntakePayload; isEdit: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<IntakePayload>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Section setters keep updates immutable + typed.
  const setClient = (p: Partial<IntakePayload['client']>) => setData((d) => ({ ...d, client: { ...d.client, ...p } }));
  const setHealth = (p: Partial<IntakePayload['health']>) => setData((d) => ({ ...d, health: { ...d.health, ...p } }));
  const setScalp = (p: Partial<IntakePayload['scalp']>) => setData((d) => ({ ...d, scalp: { ...d.scalp, ...p } }));
  const setLoc = (p: Partial<IntakePayload['loc']>) => setData((d) => ({ ...d, loc: { ...d.loc, ...p } }));

  const submit = async () => {
    setSaving(true); setError('');
    const res = await submitIntake(data);
    if (!res.ok) { setError(res.error ?? 'Could not save. Please try again.'); setSaving(false); return; }
    router.push('/locs/dashboard');
    router.refresh();
  };

  const c = data.client, h = data.health, s = data.scalp, l = data.loc;
  const last = step === STEPS.length - 1;

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-locs-emerald">
          {isEdit ? 'Update your intake' : 'Welcome — let’s build your profile'}
        </h1>
        <p className="mt-1 text-locs-silver">This helps Leslie personalize your scalp &amp; loc care.</p>
      </header>

      {/* Stepper */}
      <div className="mb-7 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col gap-1.5">
            <div className={`h-1.5 rounded-full ${i <= step ? 'bg-locs-emerald' : 'bg-locs-rule'}`} />
            <span className={`text-xs ${i === step ? 'text-locs-emerald font-medium' : 'text-locs-gray'}`}>{label}</span>
          </div>
        ))}
      </div>

      {error && <p className="mb-4 rounded-lg bg-locs-fire/10 px-3 py-2 text-sm text-locs-fire">{error}</p>}

      <div className="locs-card space-y-5 p-6">
        {step === 0 && (
          <>
            <TextField label="Full name" value={c.full_name} onChange={(v) => setClient({ full_name: v })} />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Date of birth" type="date" value={c.dob} onChange={(v) => setClient({ dob: v })} />
              <TextField label="Phone" type="tel" value={c.phone} onChange={(v) => setClient({ phone: v })} />
            </div>
            <TextField label="Email" type="email" value={c.email} onChange={(v) => setClient({ email: v })} />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Occupation" value={c.occupation} onChange={(v) => setClient({ occupation: v })} />
              <TextField label="Referred by" value={c.referred_by} onChange={(v) => setClient({ referred_by: v })} />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <TextField label="Overall health" value={h.overall_health} onChange={(v) => setHealth({ overall_health: v })}
                       hint="e.g. generally good, managing a condition, etc." />
            <TextArea label="Medical conditions" value={h.medical_conditions} onChange={(v) => setHealth({ medical_conditions: v })} />
            <TextField label="Hormonal imbalances" value={h.hormonal_imbalances} onChange={(v) => setHealth({ hormonal_imbalances: v })} />
            <Toggle label="Currently pregnant or nursing" checked={h.pregnant_or_nursing} onChange={(v) => setHealth({ pregnant_or_nursing: v })} />
            <TextArea label="Medications & supplements" value={h.medications_supplements} onChange={(v) => setHealth({ medications_supplements: v })} />
            <RadioChips label="Stress level" options={STRESS_LEVEL} value={h.stress_level} onChange={(v) => setHealth({ stress_level: v })} allowClear />
            <RadioChips label="Sleep quality" options={SLEEP_QUALITY} value={h.sleep_quality} onChange={(v) => setHealth({ sleep_quality: v })} allowClear />
            <TextField label="Diet type" value={h.diet_type} onChange={(v) => setHealth({ diet_type: v })} hint="e.g. omnivore, vegetarian, vegan…" />
            <RadioChips label="Water intake" options={WATER_INTAKE} value={h.water_intake} onChange={(v) => setHealth({ water_intake: v })} allowClear />
            <RadioChips label="Exercise routine" options={EXERCISE_ROUTINE} value={h.exercise_routine} onChange={(v) => setHealth({ exercise_routine: v })} allowClear />
            <TextField label="Smoking / alcohol" value={h.smokes_or_drinks} onChange={(v) => setHealth({ smokes_or_drinks: v })} />
          </>
        )}

        {step === 2 && (
          <>
            <CheckChips label="Main concerns" options={MAIN_CONCERNS} values={s.main_concerns} onChange={(v) => setScalp({ main_concerns: v })} />
            {s.main_concerns.includes('other') && (
              <TextField label="Other concern" value={s.concern_other} onChange={(v) => setScalp({ concern_other: v })} />
            )}
            <TextField label="When did the concern start?" value={s.concern_onset} onChange={(v) => setScalp({ concern_onset: v })} />
            <RadioChips label="Since it started, it has…" options={CONCERN_TREND} value={s.concern_trend} onChange={(v) => setScalp({ concern_trend: v })} allowClear />
            <Toggle label="Seen a specialist about this" checked={s.seen_specialist} onChange={(v) => setScalp({ seen_specialist: v })} />
            {s.seen_specialist && (
              <TextField label="Specialist name" value={s.specialist_name} onChange={(v) => setScalp({ specialist_name: v })} />
            )}
            <Toggle label="Family history of hair loss" checked={s.family_history_hair_loss} onChange={(v) => setScalp({ family_history_hair_loss: v })} />
            {s.family_history_hair_loss && (
              <TextField label="Family history detail" value={s.family_history_detail} onChange={(v) => setScalp({ family_history_detail: v })} />
            )}
            <Toggle label="Recent chemical/heat treatments" checked={s.recent_treatments} onChange={(v) => setScalp({ recent_treatments: v })} />
            {s.recent_treatments && (
              <TextField label="Treatment detail" value={s.treatment_detail} onChange={(v) => setScalp({ treatment_detail: v })} />
            )}
            <RadioChips label="Wash frequency" options={WASH_FREQUENCY} value={s.wash_frequency} onChange={(v) => setScalp({ wash_frequency: v })} allowClear />
            <TextArea label="Current products" value={s.current_products} onChange={(v) => setScalp({ current_products: v })} />
            <CheckChips label="Scalp symptoms" options={SCALP_SYMPTOMS} values={s.scalp_symptoms} onChange={(v) => setScalp({ scalp_symptoms: v })} />
            <NumberField label="Rate your concern (1–10)" min={1} max={10} value={s.concern_rating} onChange={(v) => setScalp({ concern_rating: v })} />
          </>
        )}

        {step === 3 && (
          <>
            <RadioChips label="Loc stage" options={LOC_STAGE} value={l.loc_stage} onChange={(v) => setLoc({ loc_stage: v })} allowClear />
            <RadioChips label="Loc method" options={LOC_METHOD} value={l.loc_method} onChange={(v) => setLoc({ loc_method: v })} allowClear />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Started loc journey" type="date" value={l.loc_age_start_date} onChange={(v) => setLoc({ loc_age_start_date: v })} />
              <TextField label="Last retwist" type="date" value={l.last_retwist_date} onChange={(v) => setLoc({ last_retwist_date: v })} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <NumberField label="Retwist every (weeks)" min={0} value={l.retwist_frequency_weeks} onChange={(v) => setLoc({ retwist_frequency_weeks: v })} />
              <NumberField label="Loc count (optional)" min={0} value={l.loc_count} onChange={(v) => setLoc({ loc_count: v })} />
            </div>
            <TextField label="Current style" value={l.current_style} onChange={(v) => setLoc({ current_style: v })} />
            <TextArea label="Maintenance notes" value={l.maintenance_notes} onChange={(v) => setLoc({ maintenance_notes: v })} />
          </>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button className="locs-btn-ghost" disabled={step === 0 || saving}
                onClick={() => setStep((x) => Math.max(0, x - 1))}>Back</button>
        {last ? (
          <button className="locs-btn" disabled={saving} onClick={submit}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Finish & view dashboard'}
          </button>
        ) : (
          <button className="locs-btn" onClick={() => setStep((x) => Math.min(STEPS.length - 1, x + 1))}>Continue</button>
        )}
      </div>

      <LocsFooter />
    </div>
  );
}
