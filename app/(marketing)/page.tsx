// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// locsandwellness.com homepage — REBUILT from the vanilla-HTML design in
// public/index.html so it can be dynamic. DOM structure + class names
// match the original 1:1 (so marketing.css doesn't have to change), but
// content in the CMS-editable slots reads from getSiteContent() and
// merges over the code DEFAULTS in lib/marketing/content.ts. Portal
// edits show on the next request.
//
// CMS-wired slots (edited from portal.goelev8.ai Website tab):
//   * Hero: eyebrow, headline, tagline, cta text, cta URL
//   * Method: title (fixed here), intro line, and any per-step overrides
//   * About: bio paragraphs, credentials list, cta text
// Not-yet-CMS (still hardcoded — safe to migrate later):
//   * Nav copy, mobile menu links
//   * Loc Types & Services (4 cards)
//   * Signature block, footer
//
// The ebook section is a LIVE merch product read from the portal catalog
// (lib/marketing/ebook.ts) — cover, price, and copy come from the merch tab;
// Buy routes to its Stripe Payment Link and the Stripe webhook emails the
// download after purchase.
//
// Client-side interactions (mobile menu) live in MarketingClient.tsx which
// mounts once here.

import { getSiteContent } from '@/lib/marketing/site';
import { getEbookProduct, formatPrice } from '@/lib/marketing/ebook';
import MarketingClient from './MarketingClient';

// Re-read content on each request so Leslie's edits appear without a
// redeploy.
export const revalidate = 0;

const BOOKING_URL = 'https://lawco.glossgenius.com';

export default async function HomePage() {
  const c = await getSiteContent();

  // Ebook — a live merch product managed from the portal's merch tab. Null
  // until Leslie adds it; the section renders a graceful "view in shop"
  // fallback in the meantime so there's never a broken window.
  const ebook = await getEbookProduct();
  const ebookImg   = ebook?.image_url || '/images/guide-cover.jpg';
  const ebookTitle = ebook?.name || 'The Complete Guide to a Healthy Loc Wellness System';
  const ebookDesc  = ebook?.description ||
    'A guide covering the 12 principles behind a thriving scalp, hair & loc wellness system — the same foundation Leslie builds every client’s care plan on.';
  const ebookPrice = formatPrice(ebook?.price_cents);
  const ebookWas   = ebook?.compare_at_price_cents && ebook.compare_at_price_cents > (ebook.price_cents || 0)
    ? formatPrice(ebook.compare_at_price_cents) : '';
  // Buy → the product's Stripe Payment Link if set, else send them to the shop.
  const ebookBuyUrl = ebook?.payment_link || '/merch';

  // Hero copy — CMS with sensible fallbacks matching public/index.html.
  const heroHeadline = c.hero?.headline || 'Healthy locs start with a healthy foundation.';
  const heroTagline  = c.hero?.tagline  || 'Our personalized wellness system is designed to nourish, restore, and support your loc journey — from first consultation to lasting home care.';
  const heroCta      = c.hero?.cta      || 'Book Now';
  const heroCtaUrl   = c.hero?.ctaUrl   || BOOKING_URL;

  // Method — the title stays fixed to preserve brand voice, intro is
  // CMS-editable. Steps come from CMS if present, otherwise fall back
  // to the four cards in the static HTML.
  const methodIntro = c.method?.intro || 'A calm, considered path — from first consultation to lasting home care.';
  const methodSteps = (c.method?.steps && c.method.steps.length) ? c.method.steps : [
    { n: '01', title: 'Scalp, Hair & Loc Wellness Assessment', body: 'In-depth microscopic scalp analysis, hair porosity test, and loc integrity evaluation.' },
    { n: '02', title: 'Personalized Care Plan',                 body: 'Customized product, maintenance, and treatment plan built around your results.' },
    { n: '03', title: 'The Locs + Wellness Experience',         body: 'Intentional care, customized treatments, and professional services.' },
    { n: '04', title: 'Home Wellness Routine',                  body: 'Leave empowered with knowledge, products, and a system for your scalp, hair & loc care.' },
  ];

  // About — SiteContent.about is { title, bio: string[], certifications: string[], headshot }.
  // We keep the code-fallback copy in sync with public/legacy-index.html
  // so a fresh install with no saved row looks identical to the old
  // static page.
  const aboutBio: string[] = (Array.isArray(c.about?.bio) && c.about.bio.length) ? c.about.bio
    : [
        'The Locs + Wellness Co. was born from a simple belief: every loc tells a story, and my job is to honor yours.',
        'I care for scalp, hair, and locs as one connected system — blending skilled technique with genuine wellness, so you leave feeling seen, not rushed.',
      ];
  const aboutCreds: string[] = (Array.isArray(c.about?.certifications) && c.about.certifications.length)
    ? c.about.certifications
    : ['AMCA Certified Hair Loss Practitioner', 'Certified Loctician', 'Sisterlocks™-Trained'];
  // No CTA-label field on the About shape today; fall back to the button
  // text baked into public/legacy-index.html.
  const aboutCta = 'Book a Consultation';

  return (
    <>
      {/* ============ NAV ============ */}
      <nav className="nav" aria-label="Primary">
        <button className="menu-icon" id="navToggle" aria-label="Open menu" aria-expanded="false" aria-controls="mobileMenu">
          <span></span><span></span><span></span>
        </button>

        <a href="#top" className="nav-logo" aria-label="Locs and Wellness Co. — home">Locs and Wellness Co.</a>

        <a className="login-btn" href="/locs/signin">Log In</a>

        <div className="mobile-menu" id="mobileMenu" aria-hidden="true">
          <button className="mobile-menu-close" id="menuClose" aria-label="Close menu">&times;</button>
          <a href={heroCtaUrl} target="_blank" rel="noopener" className="mobile-menu-link">Book Now</a>
          <a href="#quiz" className="mobile-menu-link">Take the Quiz</a>
          <a href="#gallery" className="mobile-menu-link">Services</a>
          <a href="#guide" className="mobile-menu-link">The Ebook</a>
          <a href="#about" className="mobile-menu-link">About</a>
          <a href="/locs/signin" className="mobile-menu-link">Log In</a>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <header className="hero" id="top">
        <div className="hero-anim">
          <svg className="lw-logo" viewBox="0 0 340 297" role="img" aria-label="The Locs and Wellness Co. logo">
            <defs>
              <mask id="lwMask">
                <path className="lw-reveal" pathLength={1}
                  d="M193 14 C184 55 165 110 150 150 C130 190 108 218 92 240 C74 262 58 268 50 272 C34 278 30 288 58 284 C82 281 100 272 114 260 C170 247 245 246 320 256"
                  fill="none" stroke="#fff" strokeWidth="82" strokeLinecap="round" strokeLinejoin="round" />
              </mask>
            </defs>
            <image href="/images/logo-white.png" width="340" height="297" mask="url(#lwMask)" />
          </svg>
        </div>

        <div className="hero-copy">
          <div className="eyebrow">Holistic Scalp, Hair &amp; Loc Wellness</div>
          <h1 dangerouslySetInnerHTML={{ __html: heroHeadline.replace(/\n/g, '<br />') }} />
          <p style={{ whiteSpace: 'pre-line' }}>{heroTagline}</p>
          <a className="book-btn" href={heroCtaUrl} target="_blank" rel="noopener">{heroCta}</a>
        </div>
      </header>

      {/* ============ METHOD ============ */}
      <section className="method" id="method">
        <div className="section-label">How We Work</div>
        <h2>The Locs + Wellness Method</h2>
        <div className="sub">{methodIntro}</div>
        <div className="method-grid">
          {methodSteps.map((step, i) => (
            <div className="method-card" key={i}>
              <span className="num">{step.n || String(i + 1).padStart(2, '0')}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ QUIZ ============ */}
      <section className="quiz" id="quiz">
        <div className="section-label">Find Your Starting Point</div>
        <h2>Scalp, Hair &amp; Loc Wellness Quiz</h2>
        <div className="sub">A two-minute assessment to build your personalized care path.</div>
        <div className="quiz-card">
          <a className="take-quiz-btn" href="/quiz">Take the Quiz</a>
          <div className="note">A two-minute assessment — you&apos;ll get your personalized wellness blueprint at the end.</div>
        </div>
      </section>

      {/* ============ LOC TYPES & SERVICES ============ */}
      <section className="gallery" id="gallery">
        <div className="gallery-inner">
          <h2>Loc Types &amp; Services</h2>

          <div className="loctypes-grid">
            <article className="service-card">
              <div className="service-img">
                <img src="/images/loc-types/large.jpg"
                     alt="Large locs and wics maintained with retwisting, interlocking, and crochet grooming"
                     width={1100} height={584} loading="lazy" />
              </div>
              <div className="service-body">
                <h3>Large Locs / Wics</h3>
                <p>Large locs/Wics are maintained by retwisting, interlocking, crochet work or a customized combination of techniques. Crochet grooming is incorporated with retwisting or interlocking to collect loose hair and integrate it into the loc shaft. This provides additional reinforcement, improves structure and creates a clean, well-groomed finish while preserving the fullness and character of each loc.</p>
                <a className="service-link" href={BOOKING_URL} target="_blank" rel="noopener">Book &rarr;</a>
              </div>
            </article>

            <article className="service-card">
              <div className="service-img">
                <img src="/images/loc-types/medium.jpg"
                     alt="Medium-sized locs maintained by retwisting or interlocking with crochet detailing for a neat, uniform finish"
                     width={1100} height={732} loading="lazy" />
              </div>
              <div className="service-body">
                <h3>Medium Locs</h3>
                <p>Medium sized locs are maintained by retwisting or interlocking, based on your hair, lifestyle and preferred finish. For more refined grooming, crochet detailing may be added to guide loose hair back into the loc shaft. This technique helps reinforce the loc, improve its shape to create a neat and uniform finish from root to tip.</p>
                <a className="service-link" href={BOOKING_URL} target="_blank" rel="noopener">Book &rarr;</a>
              </div>
            </article>

            <article className="service-card">
              <div className="service-img">
                <img src="/images/loc-types/sisterlocks.jpg"
                     alt="Sisterlocks and micro locs with a fine, clean grid maintained by interlocking using a low-product approach"
                     width={1100} height={732} loading="lazy" />
              </div>
              <div className="service-body">
                <h3>Sisterlocks&trade; / Micro Locs</h3>
                <p>Sisterlocks&trade; and Microlocks require precise, detailed care to preserve their small size and clean grid. New growth is maintained by interlocking, using a no/low-product approach that helps prevent buildup and keeps the locs lightweight. Styling product may be applied around the hairline upon request for additional hold and a polished finish.</p>
                <a className="service-link" href={BOOKING_URL} target="_blank" rel="noopener">Book &rarr;</a>
              </div>
            </article>

            <article className="service-card">
              <div className="service-img service-img--stack">
                <img src="/images/loc-types/repair-1.jpg"
                     alt="Before and after loc repair — a weakened loc reconnected and reinforced with crochet technique"
                     width={1200} height={800} loading="lazy" />
                <img src="/images/loc-types/repair-2.jpg"
                     alt="Before and after loc reconstruction — a frizzy, unraveling loc restored to a clean, blended finish"
                     width={1200} height={900} loading="lazy" />
              </div>
              <div className="service-body">
                <h3>Loc Repair &amp; Reconstruction</h3>
                <p>Whether a loc has detached, unraveled, weakened, thinned, developed uneven areas or you&apos;re looking to combine multiple locs into one, each service is customized to restore the integrity and appearance of your locs. Depending on your needs, specialized crochet and repair techniques are used to reconnect, reinforce, reshape or combine locs while creating seamless results that blend beautifully with the surrounding locs.</p>
                <a className="service-link" href={BOOKING_URL} target="_blank" rel="noopener">Book &rarr;</a>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ============ EBOOK ============ */}
      {/* Live merch product — cover, price, and copy read from the portal
          merch tab (see lib/marketing/ebook.ts). Buy routes to the product's
          Stripe Payment Link; fulfillment is handled by the Stripe webhook
          (/api/merch/stripe-webhook) which emails the download after payment. */}
      <section className="guide" id="guide">
        <div className="guide-inner">
          <div className="guide-cover">
            <img src={ebookImg}
                 sizes="(min-width: 768px) 300px, 62vw"
                 alt={`Cover of ${ebookTitle} — a Locs & Wellness Co. ebook`}
                 width={720} height={1080} loading="lazy" />
          </div>
          <div className="guide-body">
            <div className="section-label">The Ebook</div>
            <h2>{ebookTitle}</h2>
            <p className="guide-tagline">Wellness is a system. Your locs are the reflection.</p>
            <p className="guide-desc">{ebookDesc}</p>
            {ebookPrice && (
              <p className="guide-price" style={{ margin: '0 0 18px', fontSize: '1.35rem', color: '#0B2B1E', fontWeight: 600 }}>
                {ebookPrice}
                {ebookWas && (
                  <span style={{ marginLeft: 10, color: '#8a8073', fontWeight: 400, textDecoration: 'line-through', fontSize: '1rem' }}>{ebookWas}</span>
                )}
              </p>
            )}
            <a className="btn-book-all" href={ebookBuyUrl}
               target={ebook?.payment_link ? '_blank' : undefined}
               rel={ebook?.payment_link ? 'noopener' : undefined}>
              {ebook?.payment_link ? 'Buy the ebook' : 'View in shop'}
            </a>
            <p className="guide-fine">Instant download delivered to your inbox after purchase.</p>
          </div>
        </div>
      </section>

      {/* ============ ABOUT ============ */}
      <section className="about" id="about">
        <div className="about-inner">
          <div className="about-photo">
            <img src="/images/leslie.jpg" alt="Leslie Dudley, AMCA Certified Hair Loss Practitioner" width={600} height={600} loading="lazy" />
          </div>
          <div className="about-copy">
            <div className="section-label">Meet Leslie</div>
            <h2>Rooted in care, guided by wellness.</h2>
            {aboutBio.map((para, i) => (
              <p key={i} style={{ whiteSpace: 'pre-line' }}>{para}</p>
            ))}
            <ul className="about-creds">
              {aboutCreds.map((cred, i) => <li key={i}>{cred}</li>)}
            </ul>
            <a className="btn-book-all" href={heroCtaUrl} target="_blank" rel="noopener">{aboutCta}</a>
          </div>
        </div>
      </section>

      {/* ============ FOOTER SIGNATURE ============ */}
      <section className="signature-block">
        <a href="#top" className="footer-logo" aria-label="The Locs + Wellness Co.">
          <img src="/images/logo-white.png" alt="The Locs + Wellness Co." width={340} height={297} />
        </a>
        <p>Overall Wellness</p>
      </section>

      <div className="footer-credit">
        Site by <a href="https://goelev8.ai" target="_blank" rel="noopener">GoElev8.ai</a>
      </div>

      {/* Client-side interactions (mobile menu). */}
      <MarketingClient />
    </>
  );
}
