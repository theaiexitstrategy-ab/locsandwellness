// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Static marketing sections. All copy, images, and links are Leslie-editable:
// each section takes its slice of SiteContent (loaded + merged over DEFAULTS in
// lib/marketing/site.ts) as a prop. Empty image fields render as honest
// labeled placeholders via <Media>, never a broken image.

import Motif from './Motif';
import Media from './Media';
import Logo from './Logo';
import Quiz from './Quiz';
import { resolveImage } from '@/lib/marketing/image';
import { BOOKING_URL, CONTACT, type SiteContent } from '@/lib/marketing/content';

function SectionHead({ eyebrow, title, lede }: { eyebrow: string; title: string; lede?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="section-title mt-3">{title}</h2>
      {lede && <p className="lede mt-4">{lede}</p>}
    </div>
  );
}

/* 1 — Hero: a BLACK brand panel (matches the lawco-logo.png treatment) — the
   white calligraphic "L" draws itself center-screen on landing, above a gold
   rule, an italic serif line, a gold label, and an emerald diamond. The rest
   of the site is ivory; this dark hero is the deliberate brand moment. */
export function Hero({ data }: { data: SiteContent['hero'] }) {
  const heroImage = resolveImage(data.image);
  return (
    <section id="top" className="relative flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center overflow-hidden bg-[#0C0B09] py-20 text-center">
      <Motif className="pointer-events-none absolute -right-24 -top-24 h-[34rem] w-[34rem] opacity-[0.12]" color="#BF9D45" />
      <Motif breathe className="pointer-events-none absolute -left-40 bottom-[-12rem] h-[30rem] w-[30rem] opacity-[0.10]" color="#0B5E52" />
      <div className="relative flex flex-col items-center px-6">
        <Logo size="hero" tone="onDark" animate />
        <span className="mt-9 h-px w-16 bg-site-gold/70 animate-soft-rise" />
        <h1 className="mt-8 max-w-2xl animate-soft-rise font-display text-3xl font-medium italic leading-snug text-site-sand sm:text-4xl">
          {data.headline}
        </h1>
        <p className="mt-5 max-w-md animate-soft-rise text-base text-site-sand/70">{data.tagline}</p>
        <p className="mt-7 animate-soft-rise text-xs font-semibold uppercase tracking-[0.28em] text-site-gold">
          A Locs &amp; Wellness Co. Experience
        </p>
        <span className="mt-5 animate-soft-rise text-[#12907B]">◆</span>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4 animate-soft-rise">
          <a href={data.ctaUrl || BOOKING_URL} target="_blank" rel="noopener noreferrer" className="btn-primary text-base">{data.cta}</a>
          <a href="#quiz" className="inline-flex items-center justify-center rounded-full border border-site-gold/40 px-6 py-2.5 font-medium text-site-sand transition hover:bg-white/5">
            Take the wellness quiz
          </a>
        </div>
        {heroImage && (
          <Media src={data.image} label="Hero photo" className="mt-14 aspect-[16/9] w-full max-w-3xl overflow-hidden rounded-[2rem]" imgClassName="rounded-[2rem]" />
        )}
      </div>
    </section>
  );
}

/* 2 — Quiz */
export function QuizSection({ data }: { data: SiteContent['quiz'] }) {
  return (
    <section id="quiz" className="py-16 sm:py-20">
      <div className="site-wrap">
        <SectionHead eyebrow="Find your starting point"
          title="Scalp, Hair & Loc Wellness Quiz"
          lede={data.intro} />
        <div className="mx-auto mt-10 max-w-2xl"><Quiz data={data} /></div>
      </div>
    </section>
  );
}

/* 3 — Method */
export function Method({ data }: { data: SiteContent['method'] }) {
  return (
    <section id="method" className="bg-site-sand2 py-16 sm:py-24">
      <div className="site-wrap">
        <SectionHead eyebrow="How we work" title={data.title} lede={data.intro} />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {data.steps.map((s, i) => (
            <div key={i} className="card p-6">
              <span className="font-display text-3xl font-semibold text-site-gold">{s.n}</span>
              <h3 className="mt-3 font-display text-lg font-semibold text-site-wood2">{s.title}</h3>
              <p className="mt-2 text-sm text-site-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 4 — Services */
export function Services({ data }: { data: SiteContent['services'] }) {
  return (
    <section id="services" className="py-16 sm:py-24">
      <div className="site-wrap">
        <SectionHead eyebrow="What I offer" title="Services"
          lede="Skilled, unhurried care — every service begins with your scalp and your story." />
        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {data.map((s, i) => (
            <div key={i} className="card overflow-hidden">
              <Media src={s.image} label={`${s.title} — photo`} className="media-slot aspect-[16/10] w-full rounded-none border-x-0 border-t-0" />
              <div className="border-l-4 border-site-gold p-6">
                <h3 className="font-display text-xl font-semibold text-site-wood2">{s.title}</h3>
                <p className="mt-2 text-site-muted">{s.body}</p>
                <a href={s.bookingUrl || BOOKING_URL} target="_blank" rel="noopener noreferrer" className="btn-emerald mt-5 text-sm">Book {s.title.split(' ')[0]}</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 5 — Scalp Wellness */
export function ScalpWellness({ data }: { data: SiteContent['scalpWellness'] }) {
  return (
    <section className="relative overflow-hidden bg-site-emerald py-16 text-site-sand sm:py-24">
      <Motif className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 opacity-30" color="#BF9D45" />
      <div className="site-wrap relative text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-site-gold">The wellness difference</p>
        <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">{data.title}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-site-sand/85">{data.intro}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          {data.pills.map((p, i) => (
            <span key={i} className="rounded-full border border-site-gold/40 bg-white/5 px-5 py-2.5 text-sm text-site-sand">{p}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 6 — Products / Home Care */
export function Products({ data }: { data: SiteContent['products'] }) {
  return (
    <section className="py-16 sm:py-24">
      <div className="site-wrap">
        <SectionHead eyebrow="Home care" title={data.title} lede={data.intro} />
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {data.items.map((p, i) => (
            <div key={i} className="card p-5 text-center">
              <Media src={p.image} label="Product photo" className="media-slot mx-auto aspect-square w-full overflow-hidden rounded-2xl" imgClassName="rounded-2xl" />
              <h3 className="mt-4 font-display text-lg font-semibold text-site-wood2">{p.name}</h3>
              <p className="mt-1 text-sm text-site-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 7 — Education / Ebooks */
export function Ebooks({ data }: { data: SiteContent['ebooks'] }) {
  return (
    <section className="bg-site-sand2 py-16 sm:py-24">
      <div className="site-wrap">
        <SectionHead eyebrow="Education" title={data.title} lede={data.intro} />
        <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
          {data.items.map((e, i) => (
            <div key={i} className="card flex gap-5 p-5">
              <Media src={e.cover} label="Cover" className="media-slot h-32 w-24 shrink-0 overflow-hidden rounded-xl" imgClassName="rounded-xl" />
              <div className="flex flex-col">
                <h3 className="font-display text-lg font-semibold text-site-wood2">{e.title}</h3>
                <p className="mt-1 text-sm text-site-muted">{e.body}</p>
                {e.buttonUrl ? (
                  <a href={e.buttonUrl} target="_blank" rel="noopener noreferrer" className="btn-outline mt-auto self-start text-sm">Get the guide</a>
                ) : (
                  <span className="btn-outline pointer-events-none mt-auto self-start text-sm opacity-60">Coming soon</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 8 — About */
export function About({ data }: { data: SiteContent['about'] }) {
  return (
    <section id="about" className="py-16 sm:py-24">
      <div className="site-wrap grid items-center gap-12 md:grid-cols-[0.8fr_1fr]">
        <Media src={data.headshot} label="Headshot — coming soon" className="media-slot mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl" imgClassName="rounded-2xl" />
        <div>
          <p className="eyebrow">Our founder</p>
          <h2 className="section-title mt-3">{data.title}</h2>
          {data.bio.map((p, i) => <p key={i} className="mt-4 text-site-muted">{p}</p>)}
          <ul className="mt-6 flex flex-wrap gap-2">
            {data.certifications.map((c, i) => <li key={i} className="pill">{c}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* 9 — Testimonials */
export function Testimonials({ data }: { data: SiteContent['testimonials'] }) {
  return (
    <section className="bg-site-sand2 py-16 sm:py-24">
      <div className="site-wrap">
        <SectionHead eyebrow="Kind words" title="Client love"
          lede={data.showBeforeAfter ? 'In their words — with real before & after transformations.' : 'Before & after photos coming soon — for now, in their words.'} />
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {data.items.map((t, i) => (
            <figure key={i} className="card flex flex-col p-6">
              {data.showBeforeAfter && (t.beforeImage || t.afterImage) && (
                <div className="mb-4 grid grid-cols-2 gap-2">
                  <Media src={t.beforeImage} label="Before" className="media-slot aspect-square overflow-hidden rounded-xl text-[10px]" imgClassName="rounded-xl" />
                  <Media src={t.afterImage} label="After" className="media-slot aspect-square overflow-hidden rounded-xl text-[10px]" imgClassName="rounded-xl" />
                </div>
              )}
              <span className="font-display text-4xl leading-none text-site-gold">“</span>
              <blockquote className="mt-2 text-site-wood">{t.quote}</blockquote>
              <figcaption className="mt-4 border-t border-site-rule pt-4">
                <span className="font-semibold text-site-wood2">{t.name}</span>
                <span className="block text-sm text-site-muted">{t.service}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        {!data.showBeforeAfter && (
          <p className="mx-auto mt-8 max-w-md rounded-2xl border border-dashed border-site-wood/25 bg-site-wood/[0.03] px-5 py-4 text-center text-sm text-site-muted">
            📸 Before &amp; after gallery coming soon — Leslie will add real transformation photos here.
          </p>
        )}
      </div>
    </section>
  );
}

/* 10 — Final CTA */
export function FinalCTA({ data }: { data: SiteContent['finalCta'] }) {
  return (
    <section className="py-20 sm:py-28">
      <div className="site-wrap">
        <div className="relative overflow-hidden rounded-[2rem] bg-site-wood2 px-8 py-16 text-center text-site-sand">
          <Motif className="pointer-events-none absolute -left-16 -top-16 h-80 w-80 opacity-25" color="#BF9D45" />
          <Motif className="pointer-events-none absolute -bottom-20 -right-16 h-80 w-80 opacity-20" color="#0B5E52" />
          <h2 className="relative font-display text-3xl font-semibold sm:text-4xl">{data.headline}</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-site-sand/85">{data.subtext}</p>
          <a href={data.ctaUrl || BOOKING_URL} target="_blank" rel="noopener noreferrer" className="btn-primary relative mt-8 text-base">{data.cta}</a>
        </div>
      </div>
    </section>
  );
}

/* Footer */
export function SiteFooter() {
  return (
    <footer className="border-t border-site-rule bg-site-sand2 py-14">
      <div className="site-wrap grid gap-8 sm:grid-cols-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-site-wood2">The Locs &amp; Wellness Co.</h3>
          <p className="mt-2 text-sm text-site-muted">Every loc tells a story. My job is to honor yours.</p>
        </div>
        <div className="text-sm text-site-wood">
          <p className="font-semibold text-site-wood2">Visit</p>
          <p className="mt-2">{CONTACT.location}</p>
          <a href={CONTACT.phoneHref} className="mt-1 block hover:text-site-emerald">{CONTACT.phone}</a>
        </div>
        <div className="text-sm text-site-wood">
          <p className="font-semibold text-site-wood2">Hours</p>
          <ul className="mt-2 space-y-1">
            {CONTACT.hours.map((h) => (
              <li key={h.day} className="flex justify-between gap-4"><span>{h.day}</span><span className="text-site-muted">{h.time}</span></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="site-wrap mt-10 flex flex-col items-center justify-between gap-3 border-t border-site-rule pt-6 text-xs text-site-muted sm:flex-row">
        <span>© {new Date().getFullYear()} The Locs &amp; Wellness Co. All rights reserved.</span>
        <span className="flex items-center gap-4">
          {/* Customer portal access — clients sign in to their account here. */}
          <a href="/locs/signin" className="hover:text-site-emerald">Client login</a>
          <span>Site by <a href="https://goelev8.ai" className="text-site-emerald hover:underline">GoElev8.ai</a></span>
        </span>
      </div>
    </footer>
  );
}
