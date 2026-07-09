// (c) 2026 GoElev8.ai | Aaron Bryant. All rights reserved.
//
// Locs & Wellness Co. root layout. Owns everything under /locs/*.
// Tailwind is loaded only here (via ./styles/globals.css) so utilities never
// bleed into the rest of the goelev8-funnels app.

import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './styles/globals.css';

const GA_ID = 'G-DLPHJ60W0L';

export const metadata: Metadata = {
  title: {
    default: 'Locs & Wellness Co.',
    template: '%s | Locs & Wellness Co.',
  },
  description: 'Your personal scalp & loc wellness journal.',
  icons: { icon: '/lawco-logo.png' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0C5140',
};

export default function LocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-locs-ivory text-locs-ink font-jost">
      {/* Google tag (gtag.js) — portal pageviews into the same GA4 property. */}
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-gtag-locs" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
      {children}
    </div>
  );
}
