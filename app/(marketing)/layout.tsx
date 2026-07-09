// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Marketing route group layout. Owns the public locsandwellness.com site.
// Tailwind is loaded only here so it never bleeds into the /locs portal.

import type { Metadata } from 'next';
import Script from 'next/script';
import './marketing.css';

// Google Analytics (GA4) measurement ID for locsandwellness.com.
const GA_ID = 'G-DLPHJ60W0L';

export const metadata: Metadata = {
  title: 'The Locs & Wellness Co. — Scalp, Hair & Loc Wellness · St. Louis',
  description:
    'Cultivating healthy scalp, hair, and locs for each individual. Sisterlocks, traditional locs, large locs, and loc styling at iSlay Studios, St. Louis.',
  icons: { icon: '/lawco-logo.png' },
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-site-sand text-site-ink">
      {/* Google tag (gtag.js) — loads on every public marketing page. */}
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-gtag" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
      {children}
    </div>
  );
}
