// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Supabase "Send Email" auth hook (SHARED platform project). Once enabled,
// EVERY tenant's auth email routes through here and Supabase stops sending its
// own — so this handles all tenants with a safe fallback.
//
// Tenant is identified by user_metadata.tenant (set by the app at signup), with
// a redirect_to/site_url substring fallback — the project's Auth Site URL is a
// single global value (currently not per-tenant), so URL-based detection alone
// isn't reliable. Locs & Wellness sends from its verified domain and a fixed
// confirm origin so the confirmation link is always correct regardless of the
// project Site URL.
//
// Secrets: RESEND_API_KEY, SEND_EMAIL_HOOK_SECRET (format "v1,whsec_…").

import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
// Supabase gives the secret as "v1,whsec_<base64>"; standardwebhooks only strips
// a leading "whsec_", so drop the "v1," or signature verification 401s.
const HOOK_SECRET = (Deno.env.get('SEND_EMAIL_HOOK_SECRET') ?? '').replace(/^v1,/, '');

type Brand = { name: string; from: string; ink: string; accent: string; origin: string };
const LOCS: Brand = {
  name: 'Locs and Wellness Co.',
  from: 'Locs and Wellness Co. <hello@locsandwellness.com>',
  ink: '#2e3a24', accent: '#b8a361', origin: 'https://www.locsandwellness.com',
};
// Neutral fallback for other tenants. NOTE: sends only succeed once this domain
// is verified in the Resend account tied to RESEND_API_KEY.
const DEFAULT_BRAND: Brand = {
  name: 'GoElev8', from: 'GoElev8 <noreply@goelev8.ai>', ink: '#111111', accent: '#b8a361', origin: '',
};

function copyFor(action: string, brand: string) {
  switch (action) {
    case 'signup': return { subject: `Confirm your email · ${brand}`, heading: 'Welcome — confirm your email', body: `Thanks for creating your account with ${brand}. Confirm your email to get started.`, cta: 'Confirm my email' };
    case 'magiclink': case 'login': return { subject: `Your sign-in link · ${brand}`, heading: 'Your sign-in link', body: `Click below to sign in to ${brand}. This link expires shortly.`, cta: 'Sign in' };
    case 'recovery': return { subject: `Reset your password · ${brand}`, heading: 'Reset your password', body: `We received a request to reset your ${brand} password. If this wasn't you, ignore this email.`, cta: 'Reset password' };
    case 'invite': return { subject: `You're invited · ${brand}`, heading: `You're invited to ${brand}`, body: `You've been invited to join ${brand}.`, cta: 'Accept invitation' };
    case 'email_change': return { subject: `Confirm your new email · ${brand}`, heading: 'Confirm your new email', body: `Confirm this address to finish updating your ${brand} account email.`, cta: 'Confirm email' };
    default: return { subject: `${brand}`, heading: brand, body: 'Please confirm the action below.', cta: 'Continue' };
  }
}
function renderHtml(b: Brand, c: ReturnType<typeof copyFor>, link: string) {
  return `<!DOCTYPE html><html><body style="margin:0;background:#faf9f6;font-family:sans-serif;color:#15120c"><div style="max-width:520px;margin:0 auto;padding:40px 24px"><div style="font-family:Georgia,serif;font-style:italic;font-weight:600;font-size:26px;color:${b.ink};margin-bottom:28px">${b.name}</div><h1 style="font-family:Georgia,serif;font-size:24px;margin:0 0 14px">${c.heading}</h1><p style="font-size:15px;line-height:1.6;color:#55504a;margin:0 0 28px">${c.body}</p><a href="${link}" style="display:inline-block;background:${b.ink};color:#fff;text-decoration:none;padding:14px 30px;border-radius:3px;font-size:13px;letter-spacing:1.5px;text-transform:uppercase">${c.cta}</a><p style="font-size:12px;color:#8a8073;margin:28px 0 0">Or paste this link:<br><a href="${link}" style="color:${b.accent};word-break:break-all">${link}</a></p></div></body></html>`;
}

Deno.serve(async (req) => {
  const payload = await req.text();

  let evt: any;
  try {
    const wh = new Webhook(HOOK_SECRET);
    evt = wh.verify(payload, Object.fromEntries(req.headers));
  } catch (e) {
    console.error('[hook] signature fail:', (e as Error)?.message, '| secretSet:', HOOK_SECRET.length > 0);
    return new Response(JSON.stringify({ error: 'invalid signature' }), { status: 401 });
  }

  try {
    const user = evt.user;
    const ed = evt.email_data;
    const action: string = ed.email_action_type;
    const redirectTo: string = ed.redirect_to || '';
    const siteUrl: string = ed.site_url || '';
    const meta = (user && user.user_metadata) || {};
    const hay = (redirectTo + ' ' + siteUrl).toLowerCase();
    const isLocs = meta.tenant === 'locs' || hay.includes('locsandwellness');
    const b = isLocs ? LOCS : DEFAULT_BRAND;

    const link = isLocs
      ? `${LOCS.origin}/auth/confirm?token_hash=${encodeURIComponent(ed.token_hash)}&type=${encodeURIComponent(action)}&next=${encodeURIComponent('/locs')}`
      : `${siteUrl}/auth/v1/verify?token=${encodeURIComponent(ed.token_hash)}&type=${encodeURIComponent(action)}&redirect_to=${encodeURIComponent(redirectTo)}`;

    const c = copyFor(action, b.name);
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: b.from, to: [user.email], subject: c.subject, html: renderHtml(b, c, link) }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('[hook] resend fail:', res.status, detail, '| from:', b.from);
      return new Response(JSON.stringify({ error: `resend ${res.status}` }), { status: 500 });
    }
    return new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('[hook] error:', String(e));
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
