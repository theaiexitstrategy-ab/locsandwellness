'use client';
// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Wellness Blueprint results. Reads the computed result the quiz stored in
// sessionStorage (kept client-side so submissions stay admin-read). Direct
// visits with no result fall back to /quiz.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DIMENSIONS, type Result } from '@/lib/quiz/config';

const RESULT_KEY = 'lw_quiz_result';
const BOOKING_URL = 'https://lawco.glossgenius.com';

type StoredResult = Result & { name?: string };

export default function ResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<StoredResult | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(RESULT_KEY);
      if (raw) setData(JSON.parse(raw));
    } catch { /* ignore */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && !data) router.replace('/quiz');
  }, [ready, data, router]);

  if (!data) {
    return (
      <>
        <TopBar />
        <div className="lw-shell"><div className="lw-card lw-center"><p className="lw-lede">Loading your blueprint…</p></div></div>
      </>
    );
  }

  const blurbFor = (key: string) => DIMENSIONS.find((d) => d.key === key)?.blurb ?? '';
  const first = (data.name || '').split(' ')[0];

  return (
    <>
      <TopBar />
      <div className="lw-shell">
        <div className="lw-hero-stage">
          <div className="lw-eyebrow">{first ? `${first}, your blueprint` : 'Your blueprint'}</div>
          <div className="lw-stage-name">{data.overallStage.label}</div>
          <div className="lw-stage-score">Overall wellness · {data.overall}/100</div>
        </div>

        <p className="lw-lede lw-center" style={{ marginBottom: 6 }}>
          Here&apos;s how your wellness maps across the six dimensions of the blueprint.
          This is a starting point — not a verdict.
        </p>

        <h2 className="lw-section-title">Your six dimensions</h2>
        <div className="lw-dims">
          {data.dimensions.map((d) => (
            <div className="lw-dim" key={d.key}>
              <div className="lw-dim-head">
                <span className="lw-dim-name">{d.label}</span>
                <span className="lw-dim-stage">{d.stage.label}</span>
              </div>
              <p className="lw-dim-blurb">{blurbFor(d.key)}</p>
              <div className="lw-bar"><div className="lw-bar-fill" style={{ width: `${d.score}%` }} /></div>
              <div className="lw-dim-score">{d.score}/100</div>
            </div>
          ))}
        </div>

        {data.openResponse?.trim() && (
          <div className="lw-reflection">
            <h3>In your own words</h3>
            <p>“{data.openResponse}”</p>
          </div>
        )}

        <div className="lw-cta">
          <p className="lw-lede" style={{ marginBottom: 16 }}>
            Ready to build on this? Book a consultation and Leslie will turn your blueprint
            into a personalized scalp, hair &amp; loc wellness plan.
          </p>
          <a className="lw-btn lw-btn-primary" href={BOOKING_URL} target="_blank" rel="noopener noreferrer">Book a consultation</a>
          <a className="lw-btn lw-btn-ghost" href="/quiz">Retake the quiz</a>
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
