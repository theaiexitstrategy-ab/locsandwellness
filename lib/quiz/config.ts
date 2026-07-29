// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Scalp, Hair & Loc Wellness Blueprint — quiz configuration + scoring.
//
// Source of truth for questions, options, weights, the question→dimension map,
// normalization, and stage bands. Weights/bands live in exported constants so
// they can be retuned WITHOUT touching component code.
//
// NOTE ON NUMBERING: the reference skips Q5 (Pillar 3 starts at Q6), so there
// are 22 live questions though the reference header says 23. The engine keys on
// question id, not position, so a Q5 can be added later without renumbering.
//
// NOTE ON COPY: option labels + all weights + the dimension map + scoring rules
// are exactly as specified. Question PROMPTS were written to fit each option set
// (the reference wording was not in the repo) and should be proofed by Leslie.
// Q19 is an open response: captured, shown back on results, never scored.

export type DimensionKey =
  | 'scalp' | 'lifestyle' | 'restoration' | 'hair' | 'consistency' | 'readiness';

export interface Dimension {
  key: DimensionKey;
  label: string;
  blurb: string;
}

export const DIMENSIONS: Dimension[] = [
  { key: 'scalp',       label: 'Scalp Environment',    blurb: 'The health and comfort of the ground your hair grows from.' },
  { key: 'lifestyle',   label: 'Lifestyle Balance',    blurb: 'The pace, rhythm, and body-awareness of your daily life.' },
  { key: 'restoration', label: 'Restoration Capacity', blurb: 'How well you rest, recover, and refill your own cup.' },
  { key: 'hair',        label: 'Hair Relationship',    blurb: 'The story and feeling you carry about your hair.' },
  { key: 'consistency', label: 'Care Consistency',     blurb: 'How steadily you show up for your hair and body.' },
  { key: 'readiness',   label: 'Readiness for Change', blurb: 'Your openness to nurture what comes next.' },
];

// ---- Stage bands (identical for each dimension AND the overall blueprint) ----
// Retune here without code changes.
export interface Stage { key: string; label: string; min: number; max: number; }
export const STAGE_BANDS: Stage[] = [
  { key: 'emerging',    label: 'Emerging',    min: 0,  max: 39 },
  { key: 'developing',  label: 'Developing',  min: 40, max: 59 },
  { key: 'established',  label: 'Established',  min: 60, max: 79 },
  { key: 'thriving',    label: 'Thriving',    min: 80, max: 100 },
];

export function stageFor(score: number): Stage {
  const s = Math.max(0, Math.min(100, score));
  return STAGE_BANDS.find((b) => s >= b.min && s <= b.max) ?? STAGE_BANDS[0];
}

// ---- Question model ----
export type QType =
  | 'single'          // pick one; earned = option weight
  | 'multi_positive'  // Q11: 0.4 per pick, cap 3; a "clears" option = 0 and clears rest
  | 'multi_negative'  // Q16/Q18: start high, subtract per pick; "clears" option overrides
  | 'body_area'       // Q7: any named area = 2, "I don't know" = 0.5
  | 'open';           // Q19: captured, never scored

export interface Option {
  label: string;
  weight?: number;    // single / body_area
  clears?: boolean;   // multi: selecting this clears all others
  clearsTo?: number;  // multi: score when the "clears" option is the selection
}

export interface Question {
  id: string;                 // 'Q1' … 'Q23' (no 'Q5')
  type: QType;
  dimensions: DimensionKey[]; // scored into each of these (Q2/Q6/Q10 feed two)
  prompt: string;
  helper?: string;
  options?: Option[];
  // multi_negative tuning
  perPick?: number;           // amount subtracted (Q16 .5, Q18 .75) or added (Q11 .4)
  base?: number;              // starting score for multi_negative (3)
  cap?: number;               // cap for multi_positive (3)
}

// Convenience builders keep the weight tables readable + auditable.
const o = (label: string, weight: number): Option => ({ label, weight });

export const QUESTIONS: Question[] = [
  {
    id: 'Q1', type: 'single', dimensions: ['hair'],
    prompt: 'When you think about your hair, what feeling comes up most?',
    options: [
      o('Pride', 3), o('Confidence', 3), o('Gratitude', 3), o('Curiosity', 2),
      o('It changes by the day', 1.5), o('Frustration', 1), o('Overwhelm', 0.5), o('Shame', 0),
    ],
  },
  {
    id: 'Q2', type: 'single', dimensions: ['hair', 'consistency'],
    prompt: 'When did you last do something that made your hair feel truly cared for?',
    options: [
      o('Last week', 3), o('Last month', 2.25), o('A few months ago', 1.5),
      o('6+ months ago', 0.75), o("I can't remember", 0),
    ],
  },
  {
    id: 'Q3', type: 'single', dimensions: ['restoration'],
    prompt: 'How restored do you feel after you rest or sleep?',
    options: [
      o('Very restored', 3), o('Somewhat restored', 2.25), o('Neutral', 1.5),
      o('Not very', 0.75), o('Exhausted', 0),
    ],
  },
  {
    id: 'Q4', type: 'single', dimensions: ['lifestyle'],
    prompt: 'How would you describe the pace of your daily life?',
    options: [
      o('Calm and intentional', 3), o('Busy but manageable', 2),
      o('Constantly rushing', 1), o('Frequently overwhelmed', 0),
    ],
  },
  // (Q5 intentionally absent — see file header.)
  {
    id: 'Q6', type: 'single', dimensions: ['lifestyle', 'readiness'],
    prompt: 'Which part of your wellness are you most ready to nurture right now?',
    helper: 'Choosing one is a sign of focus — "everything" often signals overwhelm.',
    options: [
      o('Hair', 2.5), o('Quiet time', 1.5), o('Movement', 1.5), o('Hydration', 1.5),
      o('Relationships', 1.5), o('Nutrition', 1), o('Sleep', 1), o('Everything', 0),
    ],
  },
  {
    id: 'Q7', type: 'body_area', dimensions: ['lifestyle'],
    prompt: 'Where do you tend to hold tension or stress in your body?',
    helper: 'Naming it is body awareness — there is no wrong answer.',
    options: [
      o('Shoulders', 2), o('Neck', 2), o('Jaw or face', 2), o('Back', 2),
      o('Chest', 2), o('Stomach', 2), o('Head', 2), o('Hips or legs', 2),
      o("I don't know", 0.5),
    ],
  },
  {
    id: 'Q8', type: 'single', dimensions: ['lifestyle'],
    prompt: 'How do you usually feel after you eat?',
    options: [
      o('Energized', 3), o('Satisfied', 2.25), o('Neutral', 1.5), o('Heavy or sluggish', 0),
    ],
  },
  {
    id: 'Q9', type: 'single', dimensions: ['consistency'],
    prompt: 'Do you follow through on the routines you set for yourself?',
    options: [
      o('Always', 3), o('Often', 2.25), o('Sometimes', 1.5), o('Rarely', 0.75), o('Never', 0),
    ],
  },
  {
    id: 'Q10', type: 'single', dimensions: ['scalp', 'consistency'],
    prompt: 'How hydrated are you on a typical day?',
    options: [
      o('Very hydrated', 3), o('Somewhat hydrated', 2),
      o('Probably dehydrated', 1), o('Very dehydrated', 0),
    ],
  },
  {
    id: 'Q11', type: 'multi_positive', dimensions: ['restoration'], perPick: 0.4, cap: 3,
    prompt: 'Which of these have you done for yourself lately?',
    helper: 'Select all that apply.',
    options: [
      { label: 'Slept deeply', weight: 0.4 },
      { label: 'Rested without guilt', weight: 0.4 },
      { label: 'Spent time outside', weight: 0.4 },
      { label: 'Moved my body', weight: 0.4 },
      { label: 'Prayer or meditation', weight: 0.4 },
      { label: 'Time with loved ones', weight: 0.4 },
      { label: 'Ate nourishing meals', weight: 0.4 },
      { label: 'Did something creative', weight: 0.4 },
      { label: 'Nothing lately', weight: 0, clears: true, clearsTo: 0 },
    ],
  },
  {
    id: 'Q12', type: 'single', dimensions: ['restoration'],
    prompt: 'When did you last take real time just for yourself?',
    options: [
      o('Less than a week ago', 3), o('This month', 2),
      o('Several months ago', 1), o("I can't remember", 0),
    ],
  },
  {
    id: 'Q13', type: 'single', dimensions: ['lifestyle'],
    prompt: 'Do you make time to slow down and rest during the week?',
    options: [
      o('Always', 3), o('Usually', 2.25), o('Sometimes', 1.5), o('Rarely', 0.75), o('Never', 0),
    ],
  },
  {
    id: 'Q14', type: 'single', dimensions: ['restoration'],
    prompt: 'How much time to yourself do you get on a typical day?',
    options: [
      o('2+ hours', 3), o('1–2 hours', 2.5), o('30 min–1 hour', 2),
      o('15–30 minutes', 1), o('Very little', 0),
    ],
  },
  {
    id: 'Q15', type: 'single', dimensions: ['restoration'],
    prompt: 'How often do you move your body?',
    options: [
      o('Daily', 3), o('Several times a week', 2.25), o('About once a week', 1.5),
      o('Rarely', 0.75), o('Never', 0),
    ],
  },
  {
    id: 'Q16', type: 'multi_negative', dimensions: ['scalp'], perPick: 0.5, base: 3,
    prompt: 'Which of these has your scalp felt lately?',
    helper: 'Select all that apply.',
    options: [
      { label: 'Itching' }, { label: 'Flaking' }, { label: 'Dryness' }, { label: 'Oiliness' },
      { label: 'Tenderness' }, { label: 'Redness' }, { label: 'Bumps' }, { label: 'Buildup' },
      { label: 'None of the above', clears: true, clearsTo: 3 },
    ],
  },
  {
    id: 'Q17', type: 'single', dimensions: ['scalp'],
    prompt: 'How does your scalp usually feel?',
    options: [
      o('Comfortable', 3), o('Oily', 1.5), o('Tight', 1), o('Dry', 1), o('Sensitive', 0.5),
    ],
  },
  {
    id: 'Q18', type: 'multi_negative', dimensions: ['scalp'], perPick: 0.75, base: 3,
    prompt: 'Where on your scalp do you notice concerns?',
    helper: 'Select all that apply — or none if all is well.',
    options: [
      { label: 'Hairline / edges' }, { label: 'Crown' }, { label: 'Nape' },
      { label: 'Temples' }, { label: 'Behind the ears' },
      { label: 'Entire scalp', clears: true, clearsTo: 0 },
    ],
  },
  {
    id: 'Q19', type: 'open', dimensions: [],
    prompt: 'Is there anything else you would like us to know about your hair or wellness journey?',
    helper: 'Optional — this is shared back with you and, if you book, helps Leslie prepare.',
  },
  {
    id: 'Q20', type: 'single', dimensions: ['consistency'],
    prompt: 'Who taught you how to care for your hair?',
    options: [
      o('A professional', 3), o('Self-taught', 2), o('A parent or family member', 2),
      o('A friend', 1.5), o('Other', 1.5), o('No one, really', 0),
    ],
  },
  {
    id: 'Q21', type: 'single', dimensions: ['hair'],
    prompt: 'Has your relationship with your hair changed over time?',
    options: [
      o('Yes — for the better', 3), o("It's improved and declined", 2),
      o("It's stayed the same", 1.5), o("Yes — it's been challenging", 1), o('Not sure', 0.5),
    ],
  },
  {
    id: 'Q22', type: 'single', dimensions: ['readiness'],
    prompt: 'Which best describes your approach to your health right now?',
    options: [
      o('I try to stay ahead of problems', 3),
      o("I'm learning to be more intentional", 2.5),
      o("I'm rebuilding my relationship with my health", 2),
      o('I react after problems appear', 0.5),
    ],
  },
  {
    id: 'Q23', type: 'single', dimensions: ['readiness'],
    prompt: 'What word best describes what you are seeking?',
    options: [
      o('Balance', 2.5), o('Healing', 2.5), o('Self-care', 2.5), o('Purpose', 2.5),
      o('Peace', 2.5), o('Nutrition', 2), o('Movement', 2), o('Science', 2), o("I don't know", 0.5),
    ],
  },
];

// Answered value shapes: single/body_area -> option label (string);
// multi -> string[]; open -> string.
export type Answer = string | string[] | undefined;
export type Answers = Record<string, Answer>;

/** Best achievable score for a question (used as the denominator per question). */
export function maxForQuestion(q: Question): number {
  if (q.type === 'open') return 0;
  if (q.type === 'multi_positive') return q.cap ?? 3;
  if (q.type === 'multi_negative') return q.base ?? 3;
  return Math.max(...(q.options ?? []).map((op) => op.weight ?? 0));
}

/** Earned score for a single answered question (0..maxForQuestion). */
export function scoreForQuestion(q: Question, answer: Answer): number {
  if (answer == null || (Array.isArray(answer) && answer.length === 0)) {
    // Q18 special-case: "no selection" is a valid, healthy answer (base).
    if (q.type === 'multi_negative' && q.id === 'Q18') return q.base ?? 3;
    return 0;
  }

  if (q.type === 'single' || q.type === 'body_area') {
    const op = q.options?.find((x) => x.label === answer);
    return op?.weight ?? 0;
  }

  if (q.type === 'multi_positive') {
    const picks = answer as string[];
    const clearOpt = q.options?.find((x) => x.clears);
    if (clearOpt && picks.includes(clearOpt.label)) return clearOpt.clearsTo ?? 0;
    return Math.min((q.perPick ?? 0.4) * picks.length, q.cap ?? 3);
  }

  if (q.type === 'multi_negative') {
    const picks = answer as string[];
    const clearOpt = q.options?.find((x) => x.clears);
    if (clearOpt && picks.includes(clearOpt.label)) return clearOpt.clearsTo ?? 0;
    const scored = picks.filter((p) => p !== clearOpt?.label).length;
    return Math.max(0, (q.base ?? 3) - (q.perPick ?? 0.5) * scored);
  }

  return 0;
}

export interface Result {
  dimensions: { key: DimensionKey; label: string; score: number; stage: Stage }[];
  overall: number;
  overallStage: Stage;
  openResponse: string;
}

/**
 * Normalize answers into per-dimension scores + overall blueprint.
 * dimensionScore = (Σ earned ÷ Σ max) × 100 over ANSWERED questions in that
 * dimension. Skipped questions are excluded from both numerator and denominator.
 * Overall = unweighted mean of the six dimension scores.
 */
export function computeResult(answers: Answers): Result {
  const byDim = DIMENSIONS.map((dim) => {
    let earned = 0;
    let max = 0;
    for (const q of QUESTIONS) {
      if (!q.dimensions.includes(dim.key)) continue;
      const a = answers[q.id];
      const answered =
        q.id === 'Q18' /* none-selected is a valid answer */
          ? a !== undefined
          : a != null && !(Array.isArray(a) && a.length === 0);
      if (!answered) continue;
      earned += scoreForQuestion(q, a);
      max += maxForQuestion(q);
    }
    const score = max > 0 ? Math.round((earned / max) * 100) : 0;
    return { key: dim.key, label: dim.label, score, stage: stageFor(score) };
  });

  const overall = Math.round(byDim.reduce((s, d) => s + d.score, 0) / byDim.length);
  const open = typeof answers['Q19'] === 'string' ? (answers['Q19'] as string) : '';

  return { dimensions: byDim, overall, overallStage: stageFor(overall), openResponse: open };
}

/** Questions shown in the flow (open + scored), in order, excluding none. */
export const FLOW_QUESTIONS = QUESTIONS;
export const TOTAL_QUESTIONS = QUESTIONS.length; // 22
