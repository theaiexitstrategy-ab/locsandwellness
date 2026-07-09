// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Root layout. Minimal on purpose — the marketing site is static HTML in
// public/, and the /locs portal supplies its own scoped layout + Tailwind.

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Locs & Wellness Co.',
  description: 'Locs & Wellness Co. — scalp & loc wellness.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
