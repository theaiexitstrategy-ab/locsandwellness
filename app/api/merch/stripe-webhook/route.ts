// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Stripe webhook for ebook fulfillment. The merch checkout / Payment Link
// lives in the SHARED Stripe account the portal also uses, so this endpoint
// receives ALL checkout.session.completed events for the account. It only
// acts on sessions tagged with metadata.fulfillment === 'ebook' (set on the
// ebook's Stripe Payment Link) — every other purchase (physical merch minted
// by the portal) is acknowledged and ignored here.
//
// On a matching purchase it emails the buyer the branded download link via
// Resend. Signature is verified manually (Stripe's t=/v1= scheme) so we don't
// need the `stripe` SDK or the Stripe secret key — only STRIPE_WEBHOOK_SECRET.
//
// Required env (Vercel, locsandwellness project):
//   STRIPE_WEBHOOK_SECRET   — signing secret from the Stripe webhook endpoint
//   RESEND_API_KEY          — already configured for the guide email
//
// Stripe Payment Link setup (owner):
//   metadata: fulfillment=ebook
//   after payment → redirect to https://www.locsandwellness.com/guide/thank-you

import { NextResponse, type NextRequest } from 'next/server';
import crypto from 'node:crypto';
import { EBOOK_DOWNLOAD_URL, ebookEmailHtml } from '@/lib/marketing/ebook';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FROM = 'Locs and Wellness Co. <hello@locsandwellness.com>';
const SIGNATURE_TOLERANCE_SEC = 60 * 5; // reject events older than 5 minutes

/** Verify Stripe's `Stripe-Signature` header against the raw body. */
function verifyStripeSignature(rawBody: string, header: string, secret: string): boolean {
  const parts = Object.fromEntries(
    header.split(',').map((kv) => {
      const i = kv.indexOf('=');
      return [kv.slice(0, i), kv.slice(i + 1)];
    }),
  );
  const timestamp = parts['t'];
  const v1 = parts['v1'];
  if (!timestamp || !v1) return false;

  // Freshness: guards against replay of a captured event.
  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > SIGNATURE_TOLERANCE_SEC) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`, 'utf8')
    .digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
  } catch {
    return false; // length mismatch
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET not set');
    return NextResponse.json({ error: 'not configured' }, { status: 500 });
  }

  const sig = req.headers.get('stripe-signature') || '';
  const rawBody = await req.text(); // must be the raw string for signature verification

  if (!verifyStripeSignature(rawBody, sig, secret)) {
    console.error('[stripe-webhook] signature verification failed');
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'bad payload' }, { status: 400 });
  }

  // We only fulfill on completed checkout. Ack everything else so Stripe
  // stops retrying.
  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const session = event.data?.object || {};
  // Identify the ebook purchase two ways (either is sufficient):
  //   1. metadata.fulfillment === 'ebook'  (set on the Stripe Payment Link)
  //   2. session.payment_link === STRIPE_EBOOK_PAYMENT_LINK  (the pl_… id)
  // #2 is a fallback in case Payment Link metadata doesn't propagate to the
  // session's metadata on this account. Every other purchase (physical merch
  // minted by the portal) is acknowledged and ignored.
  const ebookPaymentLink = process.env.STRIPE_EBOOK_PAYMENT_LINK || '';
  const isEbook =
    session.metadata?.fulfillment === 'ebook' ||
    (!!ebookPaymentLink && session.payment_link === ebookPaymentLink);
  if (!isEbook) {
    return NextResponse.json({ received: true, skipped: true }, { status: 200 });
  }

  const email: string = session.customer_details?.email || session.customer_email || '';
  const fullName: string = session.customer_details?.name || '';
  const first = fullName.trim().split(/\s+/)[0]?.slice(0, 60) || '';
  if (!email) {
    console.error('[stripe-webhook] ebook purchase with no customer email', session.id);
    // Ack anyway — retrying won't produce an email; owner can follow up.
    return NextResponse.json({ received: true, warning: 'no email' }, { status: 200 });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error('[stripe-webhook] RESEND_API_KEY not set');
    // 500 so Stripe retries once the key is configured.
    return NextResponse.json({ error: 'email not configured' }, { status: 500 });
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: [email],
      subject: 'Your ebook — The Complete Guide to a Healthy Loc Wellness System',
      html: ebookEmailHtml(first, EBOOK_DOWNLOAD_URL),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error('[stripe-webhook] resend', res.status, detail);
    // 500 → Stripe retries the delivery.
    return NextResponse.json({ error: 'send failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true, fulfilled: true }, { status: 200 });
}
