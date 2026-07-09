// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// locsandwellness.com homepage — the 10-section layout. Content is loaded from
// the CMS (getSiteContent merges Leslie's saved edits over the code defaults),
// so every field is self-editable from /admin. Empty image slots render as
// honest labeled placeholders until she uploads.

import Nav from '@/components/marketing/Nav';
import { getSiteContent } from '@/lib/marketing/site';
import {
  Hero, QuizSection, Method, Services, ScalpWellness,
  Products, Ebooks, About, Testimonials, FinalCTA, SiteFooter,
} from '@/components/marketing/sections';

// Re-read content on each request so Leslie's edits appear without a redeploy.
export const revalidate = 0;

export default async function HomePage() {
  const c = await getSiteContent();
  return (
    <>
      <Nav />
      <main>
        <Hero data={c.hero} />
        <QuizSection data={c.quiz} />
        <Method data={c.method} />
        <Services data={c.services} />
        <ScalpWellness data={c.scalpWellness} />
        <Products data={c.products} />
        <Ebooks data={c.ebooks} />
        <About data={c.about} />
        <Testimonials data={c.testimonials} />
        <FinalCTA data={c.finalCta} />
      </main>
      <SiteFooter />
    </>
  );
}
