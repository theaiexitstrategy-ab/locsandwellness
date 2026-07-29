// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Self-contained layout for the Wellness Blueprint quiz (/quiz, /quiz/results).
// The root layout is intentionally bare, so the quiz owns its own styling.

import type { Metadata } from 'next';
import './quiz.css';

export const metadata: Metadata = {
  title: 'Scalp, Hair & Loc Wellness Quiz · The Locs + Wellness Co.',
  description:
    'A two-minute assessment that maps your scalp, hair, and loc wellness across six dimensions — and points you to your starting point.',
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <div className="lw-quiz">{children}</div>;
}
