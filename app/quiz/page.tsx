'use client';
// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Scalp, Hair & Loc Wellness Blueprint — quiz flow.
// intro → 22 questions → lead-capture gate (name + email required) → results.
// Scoring is entirely from lib/quiz/config (exported constants/functions).

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  FLOW_QUESTIONS, TOTAL_QUESTIONS, computeResult, type Answers, type Answer, type Question,
} from '@/lib/quiz/config';

type Phase = 'intro' | 'questions' | 'gate';

const RESULT_KEY = 'lw_quiz_result';

export default function QuizPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('intro');
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const q = FLOW_QUESTIONS[i];

  const setAnswer = (id: string, val: Answer) => setAnswers((a) => ({ ...a, [id]: val }));

  const isMulti = (qq: Question) => qq.type === 'multi_positive' || qq.type === 'multi_negative';

  const toggleMulti = (qq: Question, label: string) => {
    const clearOpt = qq.options?.find((x) => x.clears);
    const cur = (answers[qq.id] as string[] | undefined) ?? [];
    let next: string[];
    if (clearOpt && label === clearOpt.label) {
      next = cur.includes(label) ? [] : [label];
    } else {
      next = cur.includes(label) ? cur.filter((x) => x !== label) : [...cur.filter((x) => x !== clearOpt?.label), label];
    }
    setAnswer(qq.id, next);
  };

  const chooseSingle = (qq: Question, label: string) => {
    setAnswer(qq.id, label);
    // auto-advance for single/body-area
    setTimeout(() => goNext(true), 160);
  };

  const answeredCurrent = useMemo(() => {
    if (!q) return false;
    if (q.type === 'open') return true; // optional
    if (q.id === 'Q18') return true;    // "none" is valid
    const a = answers[q.id];
    return a != null && !(Array.isArray(a) && a.length === 0);
  }, [q, answers]);

  function goNext(auto = false) {
    if (i < FLOW_QUESTIONS.length - 1) {
      setI((n) => n + 1);
    } else {
      setPhase('gate');
    }
    if (!auto) window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function goBack() {
    setError('');
    if (phase === 'gate') { setPhase('questions'); return; }
    if (i > 0) setI((n) => n - 1);
    else setPhase('intro');
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('Please enter your first name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Please enter a valid email address.');

    setSaving(true);
    const result = computeResult(answers);
    const dimScores = Object.fromEntries(result.dimensions.map((d) => [d.key, d.score]));

    // Store the submission (anon insert; RLS keeps it admin-read).
    try {
      const supabase = createClient();
      await supabase.from('locs_quiz_responses').insert({
        name: name.trim(),
        email: email.trim(),
        answers,
        dimension_scores: dimScores,
        overall_score: result.overall,
        overall_stage: result.overallStage.label,
        open_response: result.openResponse || null,
        source: 'website_quiz',
      });
    } catch (err) {
      // Non-blocking: never trap a visitor behind a storage hiccup.
      console.error('[quiz] save failed', err);
    }

    // Hand the computed result to the results page (kept client-side/private).
    try {
      sessionStorage.setItem(RESULT_KEY, JSON.stringify({ ...result, name: name.trim() }));
    } catch { /* private mode */ }

    router.push('/quiz/results');
  }

  // ---------- INTRO ----------
  if (phase === 'intro') {
    return (
      <>
        <TopBar />
        <div className="lw-shell">
          <div className="lw-card lw-center">
            <div className="lw-eyebrow">Find Your Starting Point</div>
            <h1 className="lw-display">The Scalp, Hair &amp; Loc<br />Wellness Blueprint</h1>
            <p className="lw-lede">
              A short, reflective assessment that maps your wellness across six dimensions —
              from your scalp environment to your readiness for change. About two minutes.
              You&apos;ll get your personalized blueprint at the end.
            </p>
            <div className="lw-nav" style={{ justifyContent: 'center' }}>
              <button className="lw-btn lw-btn-primary" onClick={() => setPhase('questions')}>Begin the quiz</button>
            </div>
            <p className="lw-fine">{TOTAL_QUESTIONS} questions · your answers stay private</p>
          </div>
        </div>
      </>
    );
  }

  // ---------- GATE ----------
  if (phase === 'gate') {
    return (
      <>
        <TopBar />
        <div className="lw-shell">
          <div className="lw-card">
            <div className="lw-center">
              <div className="lw-eyebrow">Last step</div>
              <h2 className="lw-display" style={{ fontSize: 'clamp(1.7rem,7vw,2.3rem)' }}>See your blueprint</h2>
              <p className="lw-lede">Where should we send your results? Enter your name and email to reveal your personalized wellness blueprint.</p>
            </div>
            <form onSubmit={submit}>
              <label className="lw-field">
                <span className="lw-label">First name</span>
                <input className="lw-input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" required />
              </label>
              <label className="lw-field">
                <span className="lw-label">Email</span>
                <input className="lw-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
              </label>
              {error && <p className="lw-error">{error}</p>}
              <div className="lw-nav">
                <button type="button" className="lw-btn lw-btn-ghost" onClick={goBack}>Back</button>
                <button type="submit" className="lw-btn lw-btn-primary" disabled={saving}>
                  {saving ? 'Revealing…' : 'Reveal my blueprint'}
                </button>
              </div>
              <p className="lw-fine">We&apos;ll only use this to send your results. No spam.</p>
            </form>
          </div>
        </div>
      </>
    );
  }

  // ---------- QUESTIONS ----------
  const pct = Math.round(((i + 1) / TOTAL_QUESTIONS) * 100);
  const multi = isMulti(q);
  const selected = answers[q.id];

  return (
    <>
      <TopBar />
      <div className="lw-shell">
        <div className="lw-progress">
          <div className="lw-progress-meta">
            <span>Question {i + 1} of {TOTAL_QUESTIONS}</span>
            <span>{pct}%</span>
          </div>
          <div className="lw-progress-track"><div className="lw-progress-fill" style={{ width: `${pct}%` }} /></div>
        </div>

        <div className="lw-card" key={q.id}>
          <div className="lw-eyebrow">{multi ? 'Select all that apply' : q.type === 'open' ? 'Reflection' : 'Choose one'}</div>
          <h2 className="lw-q">{q.prompt}</h2>
          {q.helper && <p className="lw-helper">{q.helper}</p>}

          {q.type === 'open' ? (
            <textarea
              className="lw-textarea"
              placeholder="Share as much or as little as you like…"
              value={(selected as string) ?? ''}
              maxLength={4000}
              onChange={(e) => setAnswer(q.id, e.target.value)}
            />
          ) : (
            <div className={`lw-options ${(q.options?.length ?? 0) > 5 ? 'two' : ''}`}>
              {q.options?.map((opt) => {
                const on = multi
                  ? Array.isArray(selected) && selected.includes(opt.label)
                  : selected === opt.label;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    className={`lw-opt ${on ? 'selected' : ''}`}
                    aria-pressed={on}
                    onClick={() => (multi ? toggleMulti(q, opt.label) : chooseSingle(q, opt.label))}
                  >
                    {multi && <span className="lw-check">{on ? '✓' : ''}</span>}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="lw-nav">
            <button type="button" className="lw-btn lw-btn-ghost" onClick={goBack}>Back</button>
            {(multi || q.type === 'open') && (
              <button type="button" className="lw-btn lw-btn-primary" disabled={!answeredCurrent} onClick={() => goNext()}>
                {i === FLOW_QUESTIONS.length - 1 ? 'Continue' : 'Next'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function TopBar() {
  return (
    <div className="lw-top">
      <span className="lw-lockup">The Locs&nbsp;+&nbsp;Wellness Co.</span>
    </div>
  );
}
