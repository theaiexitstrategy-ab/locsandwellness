// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Post-purchase landing page — the redirect target set on the ebook's Stripe
// Payment Link (after payment → https://www.locsandwellness.com/guide/thank-you).
// The authoritative delivery is the branded email fired by the Stripe webhook;
// this page confirms the purchase and offers the download directly for
// convenience (the buyer reached it legitimately after paying).

import type { Metadata } from 'next';
import { EBOOK_DOWNLOAD_PATH } from '@/lib/marketing/ebook';

export const metadata: Metadata = {
  title: 'Thank you · The Locs & Wellness Co.',
  robots: { index: false, follow: false },
};

export default function EbookThankYou() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FAF6EC',
        color: '#1A1A1A',
        padding: '48px 24px',
        fontFamily: '-apple-system, "Segoe UI", Helvetica, Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 520, textAlign: 'center' }}>
        <div
          style={{
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            fontWeight: 600,
            fontSize: 26,
            color: '#0B2B1E',
            marginBottom: 28,
          }}
        >
          The Locs&nbsp;+&nbsp;Wellness Co.
        </div>
        <div
          style={{
            fontSize: 12,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: '#C9A227',
            marginBottom: 12,
          }}
        >
          Purchase complete
        </div>
        <h1
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 30,
            fontWeight: 600,
            lineHeight: 1.2,
            margin: '0 0 16px',
            color: '#0B2B1E',
          }}
        >
          Thank you — your ebook is ready.
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: '#45503f', margin: '0 0 32px' }}>
          We&rsquo;ve emailed your copy of <em>The Complete Guide to a Healthy Loc Wellness System</em>{' '}
          with your download link. You can also grab it right here.
        </p>
        <a
          href={EBOOK_DOWNLOAD_PATH}
          download
          style={{
            display: 'inline-block',
            background: '#0B2B1E',
            color: '#FAF6EC',
            textDecoration: 'none',
            padding: '15px 36px',
            borderRadius: 3,
            fontSize: 13,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
          }}
        >
          Download your ebook
        </a>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: '#8a8073', margin: '28px 0 0' }}>
          Didn&rsquo;t get the email? Check your spam folder, or reach us at{' '}
          <a href="mailto:hello@locsandwellness.com" style={{ color: '#C9A227' }}>
            hello@locsandwellness.com
          </a>
          .
        </p>
        <p style={{ margin: '32px 0 0' }}>
          <a href="/" style={{ color: '#0B2B1E', fontSize: 14 }}>
            ← Back to locsandwellness.com
          </a>
        </p>
      </div>
    </main>
  );
}
