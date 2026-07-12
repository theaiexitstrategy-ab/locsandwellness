// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Demo landing page — served at locsandwellness.com/demo/option1. Placed under
// the (marketing) route group so the URL stays /demo/option1 while it inherits
// marketing.css + Google Analytics from the marketing layout. Self-contained
// demo copy (not CMS-driven); reuses the brand: black drawn-logo hero, the
// interactive Loc Wellness Planner, and the ebook feature.

import type { Metadata } from 'next';
import Nav from '@/components/marketing/Nav';
import Logo from '@/components/marketing/Logo';
import Motif from '@/components/marketing/Motif';
import LocWellnessPlanner from '@/components/LocWellnessPlanner';
import { SiteFooter } from '@/components/marketing/sections';
import { BOOKING_URL } from '@/lib/marketing/content';

export const metadata: Metadata = {
  title: 'Loc Wellness Planner — The Locs & Wellness Co.',
  description: 'Build a personalized scalp, hair, and loc wellness plan in under a minute, then book your visit.',
};

/* The ebook cover, recreated in-brand (black panel, white "L", gold rule,
   italic title, gold label, emerald diamond) so it needs no external image. */
function EbookCover() {
  return (
    <div className="mx-auto flex aspect-[3/4] w-full max-w-xs flex-col items-center justify-center rounded-2xl bg-[#0C0B09] px-8 py-10 text-center shadow-xl ring-1 ring-site-gold/20">
      <Logo size="hero" tone="onDark" className="scale-90" />
      <span className="mt-6 h-px w-12 bg-site-gold/70" />
      <p className="mt-6 font-display text-lg italic leading-snug text-site-sand">
        The Complete Guide to Healthy Scalp, Strong Roots &amp; Beautiful Locs
      </p>
      <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.28em] text-site-gold">
        A Locs &amp; Wellness Co. Guide
      </p>
      <span className="mt-4 text-[#12907B]">◆</span>
    </div>
  );
}

export default function DemoOption1Page() {
  return (
    <>
      <Nav />
      <main>
        {/* Hero — black brand panel with the drawn "L". */}
        <section className="relative flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center overflow-hidden bg-[#0C0B09] py-20 text-center">
          <Motif className="pointer-events-none absolute -right-24 -top-24 h-[34rem] w-[34rem] opacity-[0.12]" color="#BF9D45" />
          <Motif breathe className="pointer-events-none absolute -left-40 bottom-[-12rem] h-[30rem] w-[30rem] opacity-[0.10]" color="#0B5E52" />
          <div className="relative flex flex-col items-center px-6">
            <Logo size="hero" tone="onDark" animate />
            <span className="mt-9 h-px w-16 bg-site-gold/70 animate-soft-rise" />
            <h1 className="mt-8 max-w-2xl animate-soft-rise font-display text-3xl font-medium italic leading-snug text-site-sand sm:text-4xl">
              A calmer, personalized path to healthy locs.
            </h1>
            <p className="mt-5 max-w-md animate-soft-rise text-base text-site-sand/70">
              Answer four quick questions and get a wellness plan built around your scalp, your locs, and your life.
            </p>
            <p className="mt-7 animate-soft-rise text-xs font-semibold uppercase tracking-[0.28em] text-site-gold">
              A Locs &amp; Wellness Co. Experience
            </p>
            <span className="mt-5 animate-soft-rise text-[#12907B]">◆</span>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4 animate-soft-rise">
              <a href="#planner" className="btn-primary text-base">Build my plan</a>
              <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-site-gold/40 px-6 py-2.5 font-medium text-site-sand transition hover:bg-white/5">
                Book a consultation
              </a>
            </div>
          </div>
        </section>

        {/* Planner */}
        <section id="planner" className="py-16 sm:py-24">
          <div className="site-wrap">
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow">Interactive</p>
              <h2 className="section-title mt-3">Your Loc Wellness Planner</h2>
              <p className="lede mt-4">No guesswork — a plain-language plan you can act on today, and bring to your next visit.</p>
            </div>
            <div className="mx-auto mt-10 max-w-2xl"><LocWellnessPlanner /></div>
          </div>
        </section>

        {/* Ebook feature */}
        <section id="ebook" className="bg-site-sand2 py-16 sm:py-24">
          <div className="site-wrap grid items-center gap-12 md:grid-cols-[0.9fr_1fr]">
            <EbookCover />
            <div>
              <p className="eyebrow">Free guide</p>
              <h2 className="section-title mt-3">The Complete Guide to Healthy Scalp, Strong Roots &amp; Beautiful Locs</h2>
              <p className="mt-4 text-site-muted">
                A calm, practical companion to your locs — scalp fundamentals, a simple home-care rhythm,
                and how to tell when it&apos;s time to see your loctician. Yours free.
              </p>
              <ul className="mt-6 space-y-2 text-site-wood">
                {['The healthy-scalp fundamentals', 'A weekly home-care rhythm', 'What to bring to your consultation'].map((t) => (
                  <li key={t} className="flex gap-2"><span className="text-site-emerald">◆</span>{t}</li>
                ))}
              </ul>
              <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className="btn-primary mt-8">Get the free guide</a>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="py-20 sm:py-28">
          <div className="site-wrap">
            <div className="relative overflow-hidden rounded-[2rem] bg-site-wood2 px-8 py-16 text-center text-site-sand">
              <Motif className="pointer-events-none absolute -left-16 -top-16 h-80 w-80 opacity-20" color="#BF9D45" />
              <Motif className="pointer-events-none absolute -bottom-20 -right-16 h-80 w-80 opacity-20" color="#0B5E52" />
              <h2 className="relative font-display text-3xl font-semibold sm:text-4xl">Ready to begin?</h2>
              <p className="relative mx-auto mt-4 max-w-xl text-site-sand/85">
                Book a consultation and we&apos;ll turn your plan into healthy, beautiful locs.
              </p>
              <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className="btn-primary relative mt-8 text-base">Book your consultation</a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
