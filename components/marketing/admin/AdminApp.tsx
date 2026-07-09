'use client';
// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// The self-edit dashboard body. Every field in Leslie's spec table is a real
// input here, grouped by page section. Each section holds its own local state
// (seeded from the merged content) and saves independently via saveSection.
// The tally→result quiz LOGIC stays fixed; only its copy/routing is editable.

import { useState } from 'react';
import type { SiteContent, QuizKey } from '@/lib/marketing/content';
import { SECTION_KEYS } from '@/lib/marketing/content';
import { saveSection } from '@/app/locs/(admin)/admin/website/actions';
import { Field, Area, Toggle, ImageField, StringList, SectionCard, ItemBox } from './fields';

const QUIZ_KEYS: QuizKey[] = ['sisterlocks', 'traditional', 'large', 'scalp', 'styling'];

const NAV: { key: (typeof SECTION_KEYS)[number]; label: string }[] = [
  { key: 'hero', label: 'Hero' },
  { key: 'quiz', label: 'Quiz' },
  { key: 'method', label: 'Method' },
  { key: 'services', label: 'Services' },
  { key: 'scalpWellness', label: 'Scalp Wellness' },
  { key: 'products', label: 'Products' },
  { key: 'ebooks', label: 'Ebooks' },
  { key: 'about', label: 'About' },
  { key: 'testimonials', label: 'Testimonials' },
  { key: 'finalCta', label: 'Final CTA' },
];

export default function AdminApp({ content, email }: { content: SiteContent; email: string }) {
  // One state slice per section, seeded from the merged content.
  const [hero, setHero] = useState(content.hero);
  const [quiz, setQuiz] = useState(content.quiz);
  const [method, setMethod] = useState(content.method);
  const [services, setServices] = useState(content.services);
  const [scalp, setScalp] = useState(content.scalpWellness);
  const [products, setProducts] = useState(content.products);
  const [ebooks, setEbooks] = useState(content.ebooks);
  const [about, setAbout] = useState(content.about);
  const [testimonials, setTestimonials] = useState(content.testimonials);
  const [finalCta, setFinalCta] = useState(content.finalCta);

  return (
    <div>
      {/* Editor header (sits below the portal's own admin nav). */}
      <header className="border-b border-site-rule bg-site-sand2">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
          <div>
            <p className="font-display text-lg font-semibold text-site-wood2">Edit your website</p>
            <p className="text-xs text-site-muted">Personalize locsandwellness.com · {email}</p>
          </div>
          <a href="/" target="_blank" rel="noopener noreferrer" className="btn-outline text-xs">View live site ↗</a>
        </div>
        <nav className="mx-auto flex max-w-5xl flex-wrap gap-x-4 gap-y-1 px-5 pb-2.5 text-xs text-site-muted">
          {NAV.map((n) => <a key={n.key} href={`#${n.key}`} className="hover:text-site-emerald">{n.label}</a>)}
        </nav>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-5 py-8">
        <p className="rounded-2xl border border-site-emerald/20 bg-site-emerald/5 px-5 py-3 text-sm text-site-emerald">
          Edit any section, then press <strong>Save</strong> on that section. Changes appear on your live site right away.
          Empty photo slots show a labeled placeholder until you upload.
        </p>

        {/* 1 — HERO */}
        <SectionCard id="hero" title="Hero" help="The first thing visitors see." onSave={() => saveSection('hero', hero)}>
          <Field label="Headline" value={hero.headline} onChange={(v) => setHero({ ...hero, headline: v })} />
          <Field label="Tagline" value={hero.tagline} onChange={(v) => setHero({ ...hero, tagline: v })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Button text" value={hero.cta} onChange={(v) => setHero({ ...hero, cta: v })} />
            <Field label="Button link" value={hero.ctaUrl} onChange={(v) => setHero({ ...hero, ctaUrl: v })} />
          </div>
          <ImageField label="Hero photo / video" folder="hero" value={hero.image} onChange={(v) => setHero({ ...hero, image: v })} />
        </SectionCard>

        {/* 2 — QUIZ */}
        <SectionCard id="quiz" title="Wellness Quiz" help="Edit the wording of each question, answer, and result. The quiz logic stays fixed." onSave={() => saveSection('quiz', quiz)}>
          <Field label="Intro line" value={quiz.intro} onChange={(v) => setQuiz({ ...quiz, intro: v })} />
          <p className="text-xs font-semibold uppercase tracking-wide text-site-muted">Questions</p>
          {quiz.questions.map((q, qi) => (
            <ItemBox key={qi}>
              <Field label={`Question ${qi + 1}`} value={q.q}
                onChange={(v) => setQuiz({ ...quiz, questions: quiz.questions.map((x, j) => j === qi ? { ...x, q: v } : x) })} />
              <div className="space-y-2">
                {q.options.map((o, oi) => (
                  <div key={oi} className="grid grid-cols-[1fr_auto] gap-2">
                    <input className="rounded-xl border border-site-rule bg-white px-3 py-2 text-sm outline-none focus:border-site-emerald"
                      value={o.label}
                      onChange={(e) => setQuiz({ ...quiz, questions: quiz.questions.map((x, j) => j === qi
                        ? { ...x, options: x.options.map((y, k) => k === oi ? { ...y, label: e.target.value } : y) } : x) })} />
                    <select className="rounded-xl border border-site-rule bg-white px-2 py-2 text-xs text-site-muted outline-none focus:border-site-emerald"
                      value={o.key}
                      onChange={(e) => setQuiz({ ...quiz, questions: quiz.questions.map((x, j) => j === qi
                        ? { ...x, options: x.options.map((y, k) => k === oi ? { ...y, key: e.target.value as QuizKey } : y) } : x) })}>
                      {QUIZ_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </ItemBox>
          ))}
          <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-site-muted">Results</p>
          {QUIZ_KEYS.map((k) => (
            <ItemBox key={k}>
              <Field label={`Result: ${k} — title`} value={quiz.results[k].title}
                onChange={(v) => setQuiz({ ...quiz, results: { ...quiz.results, [k]: { ...quiz.results[k], title: v } } })} />
              <Area label="Result text" rows={2} value={quiz.results[k].body}
                onChange={(v) => setQuiz({ ...quiz, results: { ...quiz.results, [k]: { ...quiz.results[k], body: v } } })} />
            </ItemBox>
          ))}
        </SectionCard>

        {/* 3 — METHOD */}
        <SectionCard id="method" title="The Locs & Wellness Method" help="The four-step explainer." onSave={() => saveSection('method', method)}>
          <Field label="Section title" value={method.title} onChange={(v) => setMethod({ ...method, title: v })} />
          <Area label="Intro" rows={2} value={method.intro} onChange={(v) => setMethod({ ...method, intro: v })} />
          {method.steps.map((s, i) => (
            <ItemBox key={i}>
              <div className="grid gap-3 sm:grid-cols-[5rem_1fr]">
                <Field label="No." value={s.n} onChange={(v) => setMethod({ ...method, steps: method.steps.map((x, j) => j === i ? { ...x, n: v } : x) })} />
                <Field label="Step title" value={s.title} onChange={(v) => setMethod({ ...method, steps: method.steps.map((x, j) => j === i ? { ...x, title: v } : x) })} />
              </div>
              <Area label="Description" rows={2} value={s.body} onChange={(v) => setMethod({ ...method, steps: method.steps.map((x, j) => j === i ? { ...x, body: v } : x) })} />
            </ItemBox>
          ))}
        </SectionCard>

        {/* 4 — SERVICES */}
        <SectionCard id="services" title="Services" help="Four service cards. Each has a title, description, photo/video, and booking link." onSave={() => saveSection('services', services)}>
          {services.map((s, i) => (
            <ItemBox key={i} onRemove={services.length > 1 ? () => setServices(services.filter((_, j) => j !== i)) : undefined}>
              <Field label="Service title" value={s.title} onChange={(v) => setServices(services.map((x, j) => j === i ? { ...x, title: v } : x))} />
              <Area label="Description" rows={2} value={s.body} onChange={(v) => setServices(services.map((x, j) => j === i ? { ...x, body: v } : x))} />
              <Field label="Booking link" value={s.bookingUrl} onChange={(v) => setServices(services.map((x, j) => j === i ? { ...x, bookingUrl: v } : x))} />
              <ImageField label="Photo / video" folder="services" value={s.image} onChange={(v) => setServices(services.map((x, j) => j === i ? { ...x, image: v } : x))} />
            </ItemBox>
          ))}
          <button type="button" className="btn-outline text-xs"
            onClick={() => setServices([...services, { title: 'New service', body: '', bookingUrl: '', image: '' }])}>+ Add service</button>
        </SectionCard>

        {/* 5 — SCALP WELLNESS */}
        <SectionCard id="scalpWellness" title="Scalp Wellness" help="The clinical / wellness section and its pills." onSave={() => saveSection('scalpWellness', scalp)}>
          <Field label="Section title" value={scalp.title} onChange={(v) => setScalp({ ...scalp, title: v })} />
          <Area label="Intro" rows={2} value={scalp.intro} onChange={(v) => setScalp({ ...scalp, intro: v })} />
          <StringList label="Pills" items={scalp.pills} onChange={(v) => setScalp({ ...scalp, pills: v })} addLabel="pill" />
        </SectionCard>

        {/* 6 — PRODUCTS */}
        <SectionCard id="products" title="Products & Home Care" help="Add or remove product recommendations." onSave={() => saveSection('products', products)}>
          <Field label="Section title" value={products.title} onChange={(v) => setProducts({ ...products, title: v })} />
          <Area label="Intro" rows={2} value={products.intro} onChange={(v) => setProducts({ ...products, intro: v })} />
          {products.items.map((p, i) => (
            <ItemBox key={i} onRemove={() => setProducts({ ...products, items: products.items.filter((_, j) => j !== i) })}>
              <Field label="Name" value={p.name} onChange={(v) => setProducts({ ...products, items: products.items.map((x, j) => j === i ? { ...x, name: v } : x) })} />
              <Area label="Description" rows={2} value={p.body} onChange={(v) => setProducts({ ...products, items: products.items.map((x, j) => j === i ? { ...x, body: v } : x) })} />
              <ImageField label="Photo" folder="products" value={p.image} onChange={(v) => setProducts({ ...products, items: products.items.map((x, j) => j === i ? { ...x, image: v } : x) })} />
            </ItemBox>
          ))}
          <button type="button" className="btn-outline text-xs"
            onClick={() => setProducts({ ...products, items: [...products.items, { name: 'New product', body: '', image: '' }] })}>+ Add product</button>
        </SectionCard>

        {/* 7 — EBOOKS */}
        <SectionCard id="ebooks" title="Education / Ebooks" help="Add or remove guides. Leave the link blank to show a “Coming soon” button." onSave={() => saveSection('ebooks', ebooks)}>
          <Field label="Section title" value={ebooks.title} onChange={(v) => setEbooks({ ...ebooks, title: v })} />
          <Area label="Intro" rows={2} value={ebooks.intro} onChange={(v) => setEbooks({ ...ebooks, intro: v })} />
          {ebooks.items.map((e, i) => (
            <ItemBox key={i} onRemove={() => setEbooks({ ...ebooks, items: ebooks.items.filter((_, j) => j !== i) })}>
              <Field label="Title" value={e.title} onChange={(v) => setEbooks({ ...ebooks, items: ebooks.items.map((x, j) => j === i ? { ...x, title: v } : x) })} />
              <Area label="Description" rows={2} value={e.body} onChange={(v) => setEbooks({ ...ebooks, items: ebooks.items.map((x, j) => j === i ? { ...x, body: v } : x) })} />
              <Field label="Button link" value={e.buttonUrl} onChange={(v) => setEbooks({ ...ebooks, items: ebooks.items.map((x, j) => j === i ? { ...x, buttonUrl: v } : x) })} />
              <ImageField label="Cover image" folder="ebooks" value={e.cover} onChange={(v) => setEbooks({ ...ebooks, items: ebooks.items.map((x, j) => j === i ? { ...x, cover: v } : x) })} />
            </ItemBox>
          ))}
          <button type="button" className="btn-outline text-xs"
            onClick={() => setEbooks({ ...ebooks, items: [...ebooks.items, { title: 'New guide', body: '', buttonUrl: '', cover: '' }] })}>+ Add ebook</button>
        </SectionCard>

        {/* 8 — ABOUT */}
        <SectionCard id="about" title="About" help="Your story, headshot, and certifications." onSave={() => saveSection('about', about)}>
          <Field label="Heading" value={about.title} onChange={(v) => setAbout({ ...about, title: v })} />
          <ImageField label="Headshot" folder="about" value={about.headshot} onChange={(v) => setAbout({ ...about, headshot: v })} />
          <StringList label="Bio paragraphs" textarea items={about.bio} onChange={(v) => setAbout({ ...about, bio: v })} addLabel="paragraph" />
          <StringList label="Certifications" items={about.certifications} onChange={(v) => setAbout({ ...about, certifications: v })} addLabel="certification" />
        </SectionCard>

        {/* 9 — TESTIMONIALS */}
        <SectionCard id="testimonials" title="Testimonials" help="Client quotes. Turn on before/after photos once you have them." onSave={() => saveSection('testimonials', testimonials)}>
          <Toggle label="Show before & after photos (instead of the “coming soon” note)"
            checked={testimonials.showBeforeAfter} onChange={(v) => setTestimonials({ ...testimonials, showBeforeAfter: v })} />
          {testimonials.items.map((t, i) => (
            <ItemBox key={i} onRemove={() => setTestimonials({ ...testimonials, items: testimonials.items.filter((_, j) => j !== i) })}>
              <Area label="Quote" rows={2} value={t.quote} onChange={(v) => setTestimonials({ ...testimonials, items: testimonials.items.map((x, j) => j === i ? { ...x, quote: v } : x) })} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Client name" value={t.name} onChange={(v) => setTestimonials({ ...testimonials, items: testimonials.items.map((x, j) => j === i ? { ...x, name: v } : x) })} />
                <Field label="Service" value={t.service} onChange={(v) => setTestimonials({ ...testimonials, items: testimonials.items.map((x, j) => j === i ? { ...x, service: v } : x) })} />
              </div>
              {testimonials.showBeforeAfter && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <ImageField label="Before photo" folder="testimonials" value={t.beforeImage} onChange={(v) => setTestimonials({ ...testimonials, items: testimonials.items.map((x, j) => j === i ? { ...x, beforeImage: v } : x) })} />
                  <ImageField label="After photo" folder="testimonials" value={t.afterImage} onChange={(v) => setTestimonials({ ...testimonials, items: testimonials.items.map((x, j) => j === i ? { ...x, afterImage: v } : x) })} />
                </div>
              )}
            </ItemBox>
          ))}
          <button type="button" className="btn-outline text-xs"
            onClick={() => setTestimonials({ ...testimonials, items: [...testimonials.items, { quote: '', name: '', service: '', beforeImage: '', afterImage: '' }] })}>+ Add testimonial</button>
        </SectionCard>

        {/* 10 — FINAL CTA */}
        <SectionCard id="finalCta" title="Final Booking CTA" help="The closing call to action before the footer." onSave={() => saveSection('finalCta', finalCta)}>
          <Field label="Headline" value={finalCta.headline} onChange={(v) => setFinalCta({ ...finalCta, headline: v })} />
          <Area label="Subtext" rows={2} value={finalCta.subtext} onChange={(v) => setFinalCta({ ...finalCta, subtext: v })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Button text" value={finalCta.cta} onChange={(v) => setFinalCta({ ...finalCta, cta: v })} />
            <Field label="Button link" value={finalCta.ctaUrl} onChange={(v) => setFinalCta({ ...finalCta, ctaUrl: v })} />
          </div>
        </SectionCard>

        <p className="pb-10 pt-2 text-center text-xs text-site-muted">The Locs &amp; Wellness Co. · CMS by GoElev8.ai</p>
      </main>
    </div>
  );
}
