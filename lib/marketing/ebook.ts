// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Shared ebook helpers. The homepage renders the ebook as a LIVE merch
// product pulled from the portal's public catalog endpoint, and the Stripe
// webhook emails this same download link after purchase. Keeping the path,
// product-matching, and email template in one place keeps the site and the
// fulfillment email in lockstep.
//
// Gating: the PDF (8.2MB) exceeds Vercel's ~4.5MB serverless response cap,
// so it can't stream through a token-checked route. It lives at an
// unguessable public path instead (soft gate) — the free/public links were
// removed and this URL is only handed out to buyers via the purchase email
// and the /guide/thank-you page. A hard gate (Supabase Storage signed URL)
// is the future upgrade if needed.

export const SITE = 'https://www.locsandwellness.com';

// Unguessable path — do NOT link this publicly anywhere but the post-purchase
// email + thank-you page.
export const EBOOK_DOWNLOAD_PATH = '/guides/loc-wellness-ebook-cb5d0a2c4229e814.pdf';
export const EBOOK_DOWNLOAD_URL = `${SITE}${EBOOK_DOWNLOAD_PATH}`;

// The portal serves the Locs catalog here (name, description, price_cents,
// compare_at_price_cents, image_url, payment_link, product_key, sort_order).
const PRODUCTS_URL = 'https://portal.goelev8.ai/api/external/products?slug=locs-and-wellness';

// Preferred way to identify the ebook among the catalog: give it this
// product_key in the merch tab. Falls back to a name/description keyword match
// so it still resolves if the key can't be set in the portal.
export const EBOOK_PRODUCT_KEY = 'loc-wellness-ebook';

export type EbookProduct = {
  name: string;
  description: string;
  price_cents: number | null;
  compare_at_price_cents: number | null;
  image_url: string | null;
  payment_link: string | null;
};

type RawProduct = Partial<EbookProduct> & { product_key?: string };

/**
 * Fetch the ebook product from the live merch catalog. Returns null if the
 * catalog is empty or the ebook hasn't been added yet — callers render a
 * graceful fallback so the homepage never breaks during setup.
 */
export async function getEbookProduct(): Promise<EbookProduct | null> {
  try {
    const res = await fetch(PRODUCTS_URL, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as { products?: RawProduct[] };
    const products = Array.isArray(data.products) ? data.products : [];
    if (!products.length) return null;

    const byKey = products.find((p) => p.product_key === EBOOK_PRODUCT_KEY);
    const match =
      byKey ||
      products.find((p) => {
        const hay = `${p.name || ''} ${p.description || ''}`.toLowerCase();
        return hay.includes('ebook') || hay.includes('guide') || hay.includes('e-book');
      });
    if (!match) return null;

    return {
      name: match.name || 'The Complete Guide to a Healthy Loc Wellness System',
      description: match.description || '',
      price_cents: typeof match.price_cents === 'number' ? match.price_cents : null,
      compare_at_price_cents:
        typeof match.compare_at_price_cents === 'number' ? match.compare_at_price_cents : null,
      image_url: match.image_url || null,
      payment_link: match.payment_link || null,
    };
  } catch {
    return null;
  }
}

export function formatPrice(cents: number | null | undefined): string {
  if (cents == null) return '';
  return '$' + (cents / 100).toFixed(2).replace(/\.00$/, '');
}

/** Branded post-purchase delivery email (matches the Locs email voice). */
export function ebookEmailHtml(firstName: string, downloadUrl: string): string {
  const hi = firstName ? `Hi ${firstName},` : 'Hello,';
  return `<!DOCTYPE html><html><body style="margin:0;background:#FAF6EC;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#1A1A1A">
  <div style="max-width:540px;margin:0 auto;padding:40px 24px">
    <div style="font-family:Georgia,serif;font-style:italic;font-weight:600;font-size:26px;color:#0B2B1E;margin-bottom:24px">The Locs&nbsp;+&nbsp;Wellness Co.</div>
    <h1 style="font-family:Georgia,serif;font-size:23px;font-weight:600;line-height:1.25;margin:0 0 8px;color:#0B2B1E">The Complete Guide to a Healthy Loc Wellness System</h1>
    <p style="font-family:Georgia,serif;font-style:italic;color:#C9A227;margin:0 0 22px">Wellness is a system. Your locs are the reflection.</p>
    <p style="font-size:15px;line-height:1.7;color:#45503f;margin:0 0 20px">${hi}<br><br>Thank you for your purchase! Your ebook walks through the 12 principles behind a thriving scalp, hair &amp; loc wellness system — the same foundation we build every client&rsquo;s care plan on. Tap below to download it.</p>
    <a href="${downloadUrl}" style="display:inline-block;background:#0B2B1E;color:#FAF6EC;text-decoration:none;padding:14px 32px;border-radius:3px;font-size:13px;letter-spacing:1.5px;text-transform:uppercase">Download your ebook</a>
    <p style="font-size:12px;line-height:1.6;color:#8a8073;margin:24px 0 0">If the button doesn&rsquo;t work, copy this link:<br><a href="${downloadUrl}" style="color:#C9A227;word-break:break-all">${downloadUrl}</a></p>
    <p style="font-size:12px;line-height:1.6;color:#8a8073;margin:16px 0 0">This download link is just for you — please keep it private.</p>
    <hr style="border:none;border-top:1px solid #E0C46A;margin:30px 0 16px">
    <p style="font-size:12px;color:#8a8073;margin:0">The Locs&nbsp;+&nbsp;Wellness Co. &middot; <a href="${SITE}" style="color:#C9A227">locsandwellness.com</a></p>
  </div></body></html>`;
}
