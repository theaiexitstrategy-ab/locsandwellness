'use client';
// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Loc Wellness Planner — an interactive, rule-based (no AI) planner used on the
// /demo/option1 landing page. A few questions map to a personalized plan:
// a recommended service, a weekly home-care rhythm, and a product focus, then
// routes to booking. Uses the marketing brand classes (card/btn-*, site-*).

import { useState } from 'react';
import { BOOKING_URL } from '@/lib/marketing/content';

type Stage = 'starter' | 'budding' | 'mature' | 'considering';
type Goal = 'growth' | 'scalp' | 'style' | 'maintenance';
type Concern = 'dryness' | 'buildup' | 'thinning' | 'unraveling';
type Time = 'minimal' | 'moderate' | 'dedicated';

interface Answers { stage?: Stage; goal?: Goal; concern?: Concern; time?: Time }

const STEPS = [
  {
    key: 'stage' as const,
    q: 'Where are you in your loc journey?',
    options: [
      { label: 'Considering starting', value: 'considering' },
      { label: 'Starter locs', value: 'starter' },
      { label: 'Budding / teenage', value: 'budding' },
      { label: 'Mature locs', value: 'mature' },
    ],
  },
  {
    key: 'goal' as const,
    q: 'What matters most to you right now?',
    options: [
      { label: 'Growth & length', value: 'growth' },
      { label: 'A healthy scalp', value: 'scalp' },
      { label: 'Styling & versatility', value: 'style' },
      { label: 'Easy maintenance', value: 'maintenance' },
    ],
  },
  {
    key: 'concern' as const,
    q: 'Your biggest concern?',
    options: [
      { label: 'Dryness', value: 'dryness' },
      { label: 'Buildup & itch', value: 'buildup' },
      { label: 'Thinning / breakage', value: 'thinning' },
      { label: 'Frizz / unraveling', value: 'unraveling' },
    ],
  },
  {
    key: 'time' as const,
    q: 'Time you can give weekly?',
    options: [
      { label: 'Under 30 min', value: 'minimal' },
      { label: '30–60 min', value: 'moderate' },
      { label: '60 min +', value: 'dedicated' },
    ],
  },
];

const SERVICE_BY_GOAL: Record<Goal, string> = {
  growth: 'Scalp Wellness + Interlocking Maintenance',
  scalp: 'Scalp Wellness Consultation & Treatment',
  style: 'Loc Styling (premium)',
  maintenance: 'Traditional Retwist & Grooming',
};

const ROUTINE_BY_CONCERN: Record<Concern, string[]> = {
  dryness: ['Weekly hydrating scalp mist', 'Seal midweek with a light loc oil', 'Satin at night, always'],
  buildup: ['Bi-weekly clarifying wash', 'Gentle scalp exfoliation weekly', 'Fully dry locs after every wash'],
  thinning: ['Featherlight retwist tension', 'Nightly scalp massage (2–3 min)', 'Protein + moisture balance monthly'],
  unraveling: ['Palm-roll ends after washing', 'Retwist on your recommended cycle', 'Avoid over-manipulation between visits'],
};

const PRODUCT_BY_CONCERN: Record<Concern, string> = {
  dryness: 'Hydrating Scalp Mist + Sealing Loc Oil',
  buildup: 'Gentle Cleansing Wash + scalp exfoliant',
  thinning: 'Strengthening scalp serum + silk care',
  unraveling: 'Firm-hold loc gel + finishing oil',
};

const CYCLE_BY_TIME: Record<Time, string> = {
  minimal: 'a low-touch 4–6 week rhythm',
  moderate: 'a balanced 3–4 week rhythm',
  dedicated: 'a proactive 2–3 week rhythm',
};

export default function LocWellnessPlanner() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const done = step >= STEPS.length;
  const current = STEPS[step];

  const choose = (value: string) => {
    setAnswers((a) => ({ ...a, [current.key]: value }));
    setStep((s) => s + 1);
  };
  const restart = () => { setStep(0); setAnswers({}); };

  const goal = (answers.goal ?? 'scalp') as Goal;
  const concern = (answers.concern ?? 'dryness') as Concern;
  const time = (answers.time ?? 'moderate') as Time;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between bg-site-wood2 px-7 py-4 text-white">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-site-gold">Loc Wellness Planner</span>
        <span className="text-xs opacity-90">{done ? 'Your plan' : `Step ${step + 1} of ${STEPS.length}`}</span>
      </div>

      <div className="p-7 sm:p-9">
        {!done ? (
          <div className="animate-soft-rise" key={step}>
            <h3 className="font-display text-2xl font-semibold text-site-wood2">{current.q}</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {current.options.map((o) => (
                <button key={o.value} onClick={() => choose(o.value)}
                  className="rounded-2xl border border-site-rule bg-white/60 px-5 py-4 text-left font-medium text-site-wood transition hover:border-site-emerald hover:bg-white">
                  {o.label}
                </button>
              ))}
            </div>
            {step > 0 && (
              <button onClick={() => setStep((s) => s - 1)} className="mt-5 text-sm text-site-muted hover:text-site-emerald">← Back</button>
            )}
          </div>
        ) : (
          <div className="animate-soft-rise">
            <p className="eyebrow text-center">Your personalized plan</p>
            <h3 className="mt-2 text-center font-display text-2xl font-semibold text-site-emerald sm:text-3xl">
              {SERVICE_BY_GOAL[goal]}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-center text-site-muted">
              Built around {CYCLE_BY_TIME[time]}, tuned for {concern === 'thinning' ? 'thinning & breakage' : concern}.
            </p>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-site-rule bg-white/50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-site-gold">Weekly rhythm</p>
                <ul className="mt-3 space-y-2 text-sm text-site-wood">
                  {ROUTINE_BY_CONCERN[concern].map((r) => (
                    <li key={r} className="flex gap-2"><span className="text-site-emerald">◆</span>{r}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-site-rule bg-white/50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-site-gold">Product focus</p>
                <p className="mt-3 text-sm text-site-wood">{PRODUCT_BY_CONCERN[concern]}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-site-gold">Recommended cadence</p>
                <p className="mt-2 text-sm capitalize text-site-wood">{CYCLE_BY_TIME[time]}</p>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">Book this plan</a>
              <a href="#ebook" className="btn-emerald">Get the free guide</a>
              <button onClick={restart} className="btn-outline">Start over</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
