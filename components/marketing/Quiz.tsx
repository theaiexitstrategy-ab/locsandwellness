'use client';
// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Scalp + Hair + Loc Wellness Quiz. Rule-based (no AI): each answer carries a
// fixed routing `key`; the tallied winner maps to a plain-language result that
// routes to booking. Question / answer / result COPY is Leslie-editable and
// arrives via props (from the CMS-merged content); the tally→result LOGIC is
// fixed here and not editable.

import { useState } from 'react';
import { BOOKING_URL, type SiteContent, type QuizKey } from '@/lib/marketing/content';

const ZERO: Record<QuizKey, number> = { sisterlocks: 0, traditional: 0, large: 0, scalp: 0, styling: 0 };

export default function Quiz({ data }: { data: SiteContent['quiz'] }) {
  const questions = data.questions;
  const [step, setStep] = useState(0);
  const [tally, setTally] = useState<Record<QuizKey, number>>({ ...ZERO });

  const choose = (key: QuizKey) => {
    setTally((t) => ({ ...t, [key]: t[key] + 1 }));
    setStep((s) => s + 1);
  };
  const restart = () => { setStep(0); setTally({ ...ZERO }); };

  const done = step >= questions.length;
  const winner = (Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'traditional') as QuizKey;
  const result = data.results[winner] ?? data.results.traditional;

  return (
    <div className="card overflow-hidden">
      {/* Near-black header band with a gold label — the card's dark accent. */}
      <div className="flex items-center justify-between bg-site-wood2 px-7 py-4 text-white">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-site-gold">Wellness Quiz</span>
        <span className="text-xs opacity-90">{done ? 'Your result' : `Step ${step + 1} of ${questions.length}`}</span>
      </div>

      <div className="p-7 sm:p-9">
        {!done ? (
          <div className="animate-soft-rise" key={step}>
            <h3 className="font-display text-2xl font-semibold text-site-wood2">{questions[step].q}</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {questions[step].options.map((o, i) => (
                <button key={i} onClick={() => choose(o.key)}
                  className="rounded-2xl border border-site-rule bg-white/60 px-5 py-4 text-left font-medium text-site-wood transition hover:border-site-emerald hover:bg-white">
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-soft-rise text-center">
            <p className="eyebrow">We’d recommend</p>
            <h3 className="mt-2 font-display text-3xl font-semibold text-site-emerald">{result.title}</h3>
            <p className="mx-auto mt-3 max-w-md text-site-muted">{result.body}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">Book this consultation</a>
              <button onClick={restart} className="btn-outline">Retake quiz</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
