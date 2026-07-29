// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Sends the free-guide delivery email via Resend (uses the Vercel-configured
// RESEND_API_KEY). Called by the homepage guide gate after the visitor submits
// name + email. The lead itself is stored client-side into locs_quiz_leads;
// this route only sends the branded "here's your guide" email.

import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FROM = 'Locs and Wellness Co. <hello@locsandwellness.com>';
const SITE = 'https://www.locsandwellness.com';
const GUIDE_URL = `${SITE}/guides/The-Complete-Guide-to-a-Healthy-Loc-Wellness-System.pdf`;
const ALLOWED_HOSTS = ['locsandwellness.com', 'www.locsandwellness.com'];

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function emailHtml(firstName: string) {
  const hi = firstName ? `Hi ${firstName},` : 'Hello,';
  return `<!DOCTYPE html><html><body style="margin:0;background:#FAF6EC;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#1A1A1A">
  <div style="max-width:540px;margin:0 auto;padding:40px 24px">
    <div style="font-family:Georgia,serif;font-style:italic;font-weight:600;font-size:26px;color:#0B2B1E;margin-bottom:24px">The Locs&nbsp;+&nbsp;Wellness Co.</div>
    <h1 style="font-family:Georgia,serif;font-size:23px;font-weight:600;line-height:1.25;margin:0 0 8px;color:#0B2B1E">The Complete Guide to Creating a Healthy Loc Wellness System</h1>
    <p style="font-family:Georgia,serif;font-style:italic;color:#C9A227;margin:0 0 22px">Wellness is a system. Your locs are the reflection.</p>
    <p style="font-size:15px;line-height:1.7;color:#45503f;margin:0 0 20px">${hi}<br><br>Thank you for downloading your free guide. It walks through the 12 principles behind a thriving scalp, hair &amp; loc wellness system — the same foundation we build every client&rsquo;s care plan on.</p>
    <a href="${GUIDE_URL}" style="display:inline-block;background:#0B2B1E;color:#FAF6EC;text-decoration:none;padding:14px 32px;border-radius:3px;font-size:13px;letter-spacing:1.5px;text-transform:uppercase">Download the guide</a>
    <p style="font-size:12px;line-height:1.6;color:#8a8073;margin:24px 0 0">If the button doesn&rsquo;t work, copy this link:<br><a href="${GUIDE_URL}" style="color:#C9A227;word-break:break-all">${GUIDE_URL}</a></p>
    <hr style="border:none;border-top:1px solid #E0C46A;margin:30px 0 16px">
    <p style="font-size:12px;color:#8a8073;margin:0">The Locs&nbsp;+&nbsp;Wellness Co. &middot; <a href="${SITE}" style="color:#C9A227">locsandwellness.com</a></p>
  </div></body></html>`;
}

export async function POST(req: NextRequest) {
  // Soft origin guard — blocks casual off-site abuse of the sender.
  const origin = req.headers.get('origin') || req.headers.get('referer') || '';
  try {
    if (origin) {
      const host = new URL(origin).hostname;
      if (!ALLOWED_HOSTS.includes(host)) {
        return NextResponse.json({ error: 'forbidden' }, { status: 403 });
      }
    }
  } catch { /* ignore malformed origin */ }

  let body: { name?: string; email?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'bad request' }, { status: 400 }); }

  const email = (body.email || '').trim();
  const first = (body.name || '').trim().split(/\s+/)[0].slice(0, 60);
  if (!isEmail(email)) return NextResponse.json({ error: 'invalid email' }, { status: 400 });

  const key = process.env.RESEND_API_KEY;
  if (!key) return NextResponse.json({ error: 'email not configured' }, { status: 500 });

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: [email],
      subject: 'Your free guide — The Complete Guide to a Healthy Loc Wellness System',
      html: emailHtml(first),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error('[guide-email] resend', res.status, detail);
    return NextResponse.json({ error: 'send failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
