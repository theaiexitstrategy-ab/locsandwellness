// (c) 2026 GoElev8.ai | Aaron Bryant. All rights reserved.
//
// Locs & Wellness Co. root layout. Owns everything under /locs/*.
// Tailwind is loaded only here (via ./styles/globals.css) so utilities never
// bleed into the rest of the goelev8-funnels app.

import type { Metadata, Viewport } from 'next';
import './styles/globals.css';

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
  return <div className="min-h-screen bg-locs-ivory text-locs-ink font-jost">{children}</div>;
}
