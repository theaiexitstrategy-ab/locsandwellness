// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Marketing route group layout. Owns the public locsandwellness.com site.
// Tailwind is loaded only here so it never bleeds into the /locs portal.

import type { Metadata } from 'next';
import './marketing.css';

export const metadata: Metadata = {
  title: 'The Locs & Wellness Co. — Scalp, Hair & Loc Wellness · St. Louis',
  description:
    'Cultivating healthy scalp, hair, and locs for each individual. Sisterlocks, traditional locs, large locs, and loc styling at iSlay Studios, St. Louis.',
  icons: { icon: '/lawco-logo.png' },
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-site-sand text-site-ink">{children}</div>;
}
