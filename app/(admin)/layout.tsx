// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Marketing CMS admin gate. Only role='admin' (Leslie / staff) reaches /admin —
// requireAdmin() redirects everyone else to the same /locs sign-in she already
// uses. Reuses the marketing stylesheet so the editor matches the brand.

import type { Metadata } from 'next';
import '../(marketing)/marketing.css';
import { requireAdmin } from '@/lib/locs/auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Edit your site · The Locs & Wellness Co.',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <div className="min-h-screen bg-site-sand text-site-ink">{children}</div>;
}
