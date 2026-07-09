// (c) 2026 GoElev8.ai | Aaron Bryant. All rights reserved.
//
// Locs & Wellness Co. — shared option lists + human labels. Values match the
// CHECK constraints in supabase/migrations/20260708000000_create_locs_schema.sql.
// Used by the intake form, the client dashboard, and the admin clinical panels
// so every enum renders identically wherever it appears.

export type Option = { value: string; label: string };

const opt = (value: string, label: string): Option => ({ value, label });

// ---- Section 2 — Health & Lifestyle ----
export const STRESS_LEVEL: Option[] = [opt('low', 'Low'), opt('moderate', 'Moderate'), opt('high', 'High')];
export const SLEEP_QUALITY: Option[] = [
  opt('poor', 'Poor'), opt('fair', 'Fair'), opt('good', 'Good'), opt('excellent', 'Excellent'),
];
export const WATER_INTAKE: Option[] = [opt('low', 'Low'), opt('moderate', 'Moderate'), opt('high', 'High')];
export const EXERCISE_ROUTINE: Option[] = [
  opt('none', 'None'), opt('light', 'Light'), opt('moderate', 'Moderate'), opt('intense', 'Intense'),
];

// ---- Section 3 — Scalp & Hair History ----
export const MAIN_CONCERNS: Option[] = [
  opt('hair_loss_shedding', 'Hair loss / shedding'),
  opt('thinning', 'Thinning'),
  opt('dandruff_flaking', 'Dandruff / flaking'),
  opt('itching', 'Itching / discomfort'),
  opt('oily_scalp', 'Oily scalp'),
  opt('breakage', 'Hair breakage'),
  opt('dryness', 'Dryness'),
  opt('other', 'Other'),
];
export const CONCERN_TREND: Option[] = [
  opt('worse', 'Getting worse'), opt('better', 'Getting better'), opt('stayed_the_same', 'Stayed the same'),
];
export const WASH_FREQUENCY: Option[] = [
  opt('daily', 'Daily'), opt('2_3x_week', '2–3× per week'), opt('weekly', 'Weekly'),
  opt('bi_weekly', 'Bi-weekly'), opt('other', 'Other'),
];
export const SCALP_SYMPTOMS: Option[] = [
  opt('itching', 'Itching'), opt('redness', 'Redness'), opt('flaking', 'Flaking'),
  opt('buildup', 'Buildup'), opt('tenderness', 'Tenderness'), opt('dryness', 'Dryness'),
  opt('greasy_oily', 'Greasy / oily'), opt('none', 'None'),
];

// ---- Loc profile ----
export const LOC_STAGE: Option[] = [
  opt('starter', 'Starter'), opt('budding', 'Budding'), opt('teenage', 'Teenage'),
  opt('mature', 'Mature'), opt('freeform', 'Freeform'),
];
export const LOC_METHOD: Option[] = [
  opt('traditional', 'Traditional'), opt('sisterlocks', 'Sisterlocks'), opt('microlocs', 'Microlocs'),
  opt('interlocking', 'Interlocking'), opt('other', 'Other'),
];

// ---- Journal (client-facing plain language) ----
export const SCALP_FEEL: Option[] = [
  opt('dry', 'Dry'), opt('oily', 'Oily'), opt('itchy', 'Itchy'),
  opt('normal', 'Normal'), opt('tender', 'Tender'),
];
// Same list as scalp symptoms, minus 'none', for daily journaling.
export const JOURNAL_SYMPTOMS: Option[] = SCALP_SYMPTOMS.filter((o) => o.value !== 'none');

// ---- Section 4 — Professional Scalp Assessment (admin) ----
export const SEBUM_LEVEL: Option[] = [opt('low', 'Low'), opt('balanced', 'Balanced'), opt('high', 'High')];
export const BARRIER_STATUS: Option[] = [
  opt('healthy', 'Healthy'), opt('compromised', 'Compromised'), opt('inflamed', 'Inflamed'),
];
export const MICROBIOME_BALANCE: Option[] = [
  opt('balanced', 'Balanced'), opt('yeast_dominant', 'Yeast-dominant'), opt('dysbiosis', 'Dysbiosis'),
];
export const INFLAMMATION_LEVEL: Option[] = [
  opt('none', 'None'), opt('mild', 'Mild'), opt('moderate', 'Moderate'), opt('severe', 'Severe'),
];
export const FOLLICLE_ACTIVITY: Option[] = [
  opt('active_anagen', 'Active (anagen)'), opt('stressed_telogen', 'Stressed (telogen)'),
  opt('miniaturization', 'Miniaturization'),
];
export const SCALP_SENSITIVITY: Option[] = [opt('low', 'Low'), opt('moderate', 'Moderate'), opt('high', 'High')];
export const HYDRATION_LEVEL: Option[] = [
  opt('well_hydrated', 'Well-hydrated'), opt('dehydrated', 'Dehydrated'),
  opt('severely_dehydrated', 'Severely dehydrated'),
];

// ---- Section 5 — Elemental Pattern (admin) ----
export const ELEMENTS: Option[] = [
  opt('fire', 'Fire'), opt('water', 'Water'), opt('air', 'Air'), opt('earth', 'Earth'),
];

// ---- Scalp Mapping Chart zones (admin) ----
export const SCALP_ZONES: Option[] = [
  opt('frontal_hairline', 'Frontal / Hairline'),
  opt('crown_vertex', 'Crown / Vertex'),
  opt('temples', 'Temples'),
  opt('mid_scalp', 'Mid Scalp'),
  opt('left_side', 'Left Side'),
  opt('right_side', 'Right Side'),
  opt('occipital_nape', 'Occipital / Nape'),
];

// Resolve a value to its label for any option list (falls back to the raw value).
export function labelFor(options: Option[], value: string | null | undefined): string {
  if (!value) return '—';
  return options.find((o) => o.value === value)?.label ?? value;
}
