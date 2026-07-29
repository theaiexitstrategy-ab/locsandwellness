// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Supabase "Send Email" auth hook.
//
// IMPORTANT: this is a SHARED platform project. Once the Send Email hook is
// enabled, Supabase routes EVERY tenant's auth email through this function and
// stops sending its own. So this must handle all tenants and all email types,
// with a safe neutral fallback — a bug here breaks auth email platform-wide.
//
// Branding is chosen by the redirect_to hostname. Locs & Wellness gets its own
// branded template + a cross-device /auth/confirm link; every other tenant gets
// a neutral template with the standard Supabase verify link (parity with the
// old default behavior).
//
// Required function secrets (Supabase → Edge Functions → send-email-hook → Secrets):
//   RESEND_API_KEY          – Resend API key
//   SEND_EMAIL_HOOK_SECRET  – the signing secret Supabase shows when you enable
//                             the hook (format: "v1,whsec_...")

import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
// Supabase provides the secret as "v1,whsec_<base64>". standardwebhooks only
// strips a leading "whsec_", so drop the "v1," ourselves or verification 401s.
const HOOK_SECRET = (Deno.env.get('SEND_EMAIL_HOOK_SECRET') ?? '').replace(/^v1,/, '');

type Brand = {
  name: string;
  from: string;        // must be a domain verified in Resend
  accent: string;
  ink: string;
  /** Locs uses the app's own /auth/confirm route (cross-device verifyOtp). */
  confirmPath?: string;
};

// Keyed by the redirect_to hostname.
const BRANDS: Record<string, Brand> = {
  'locsandwellness.com': {
    name: 'Locs and Wellness Co.',
    from: 'Locs and Wellness Co. <hello@locsandwellness.com>',
    accent: '#b8a361',
    ink: '#2e3a24',
    confirmPath: '/auth/confirm',
  },
};
BRANDS['www.locsandwellness.com'] = BRANDS['locsandwellness.com'];

// Neutral fallback for every other tenant on the shared project.
const DEFAULT_BRAND: Brand = {
  name: 'GoElev8',
  from: 'GoElev8 <noreply@goelev8.ai>',
  accent: '#b8a361',
  ink: '#111111',
};

function copyFor(action: string, brand: string) {
  switch (action) {
    case 'signup':
      return { subject: `Confirm your email · ${brand}`, heading: 'Welcome — confirm your email', body: `Thanks for creating your account with ${brand}. Confirm your email to get started.`, cta: 'Confirm my email' };
    case 'magiclink':
    case 'login':
      return { subject: `Your sign-in link · ${brand}`, heading: 'Your sign-in link', body: `Click below to sign in to ${brand}. This link expires shortly.`, cta: 'Sign in' };
    case 'recovery':
      return { subject: `Reset your password · ${brand}`, heading: 'Reset your password', body: `We received a request to reset your ${brand} password. If this wasn't you, you can ignore this email.`, cta: 'Reset password' };
    case 'invite':
      return { subject: `You're invited · ${brand}`, heading: `You're invited to ${brand}`, body: `You've been invited to join ${brand}. Accept the invitation to set up your account.`, cta: 'Accept invitation' };
    case 'email_change':
      return { subject: `Confirm your new email · ${brand}`, heading: 'Confirm your new email', body: `Confirm this address to finish updating your ${brand} account email.`, cta: 'Confirm email' };
    default:
      return { subject: `${brand}`, heading: brand, body: 'Please confirm the action below.', cta: 'Continue' };
  }
}

function renderHtml(brand: Brand, c: ReturnType<typeof copyFor>, link: string) {
  return `<!DOCTYPE html><html><body style="margin:0;background:#faf9f6;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#15120c">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px">
    <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-weight:600;font-size:26px;color:${brand.ink};margin-bottom:28px">${brand.name}</div>
    <h1 style="font-family:Georgia,serif;font-size:24px;font-weight:600;margin:0 0 14px">${c.heading}</h1>
    <p style="font-size:15px;line-height:1.6;color:#55504a;margin:0 0 28px">${c.body}</p>
    <a href="${link}" style="display:inline-block;background:${brand.ink};color:#fff;text-decoration:none;padding:14px 30px;border-radius:3px;font-size:13px;letter-spacing:1.5px;text-transform:uppercase">${c.cta}</a>
    <p style="font-size:12px;line-height:1.6;color:#8a8073;margin:28px 0 0">If the button doesn't work, copy and paste this link:<br><a href="${link}" style="color:${brand.accent};word-break:break-all">${link}</a></p>
    <hr style="border:none;border-top:1px solid #e0d6c2;margin:32px 0 16px">
    <p style="font-size:11px;color:#8a8073;margin:0">${brand.name}</p>
  </div></body></html>`;
}

Deno.serve(async (req) => {
  const payload = await req.text();

  // 1. Verify the webhook signature.
  let evt: any;
  try {
    const wh = new Webhook(HOOK_SECRET);
    evt = wh.verify(payload, Object.fromEntries(req.headers));
  } catch (e) {
    console.error('[send-email-hook] signature verify failed:', (e as Error)?.message,
      '| secret set:', HOOK_SECRET.length > 0);
    return new Response(JSON.stringify({ error: 'invalid signature' }), { status: 401 });
  }

  try {
    const user = evt.user;
    const ed = evt.email_data;
    const action: string = ed.email_action_type;
    const redirectTo: string = ed.redirect_to || ed.site_url || '';
    let host = '';
    let redirectOrigin = '';
    let redirectPath = '/locs';
    try {
      const u = new URL(redirectTo);
      host = u.hostname;
      redirectOrigin = u.origin;
      redirectPath = u.pathname && u.pathname !== '/' ? u.pathname : '/locs';
    } catch { /* redirectTo not a URL */ }

    const brand = BRANDS[host] ?? DEFAULT_BRAND;

    // 2. Build the action link.
    let link: string;
    if (brand.confirmPath && redirectOrigin) {
      // Cross-device: our app verifies the token_hash server-side.
      link = `${redirectOrigin}${brand.confirmPath}?token_hash=${encodeURIComponent(ed.token_hash)}&type=${encodeURIComponent(action)}&next=${encodeURIComponent(redirectPath)}`;
    } else {
      // Parity with Supabase default: hosted verify endpoint -> redirect_to.
      link = `${ed.site_url}/auth/v1/verify?token=${encodeURIComponent(ed.token_hash)}&type=${encodeURIComponent(action)}&redirect_to=${encodeURIComponent(redirectTo)}`;
    }

    const c = copyFor(action, brand.name);
    const html = renderHtml(brand, c, link);

    // 3. Send via Resend.
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: brand.from, to: [user.email], subject: c.subject, html }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('[send-email-hook] resend failed:', res.status, detail, '| from:', brand.from);
      return new Response(JSON.stringify({ error: `resend ${res.status} ${detail}` }), { status: 500 });
    }
    return new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('[send-email-hook] error:', String(e));
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
