// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Marketing route group layout. Owns the public locsandwellness.com site.
// Loads the vanilla CSS from marketing.css (the ex-public/style.css) and
// the Cormorant Garamond + Jost fonts the design depends on. GA (gtag) is
// injected once here so page.tsx doesn't have to.

import type { Metadata } from 'next';
import Script from 'next/script';
import './marketing.css';

const GA_ID = 'G-DLPHJ60W0L';

export const metadata: Metadata = {
  title: 'The Locs & Wellness Co. — Scalp, Hair & Loc Wellness · St. Louis',
  description:
    'Cultivating healthy scalp, hair, and locs for each individual. Sisterlocks, traditional locs, large locs, and loc styling at iSlay Studios, St. Louis.',
  icons: { icon: '/images/lawco-logo.png' },
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Fonts required by marketing.css (Cormorant Garamond wordmark + Jost body). */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,500&family=Jost:wght@300;400;500;600&display=swap"
      />
      {/* Google Analytics (GA4). */}
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-gtag" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
      {children}
    </>
  );
}
