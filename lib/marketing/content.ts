// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Single source of truth for the marketing site's editable content SHAPE and
// its DEFAULTS. Every field here is Leslie-editable from /admin: the loader
// (lib/marketing/site.ts) reads the locs_site_content table and merges the
// saved values OVER these defaults, so an un-edited section falls back here.
//
// Real content (contact, testimonials, philosophy, service names) is carried
// from the current live site. Image fields default to '' — an empty image
// renders as an honest labeled placeholder, never a broken <img>. When Leslie
// uploads, the field holds a storage path in the public `locs-site` bucket
// (or a full https URL); resolveImage() in site.ts handles both.

/* ----------------------------- types ----------------------------- */

export type QuizKey = 'sisterlocks' | 'traditional' | 'large' | 'scalp' | 'styling';

export interface SiteContent {
  hero: { headline: string; tagline: string; cta: string; ctaUrl: string; image: string };
  quiz: {
    intro: string;
    questions: { q: string; options: { label: string; key: QuizKey }[] }[];
    results: Record<QuizKey, { title: string; body: string }>;
  };
  method: { title: string; intro: string; steps: { n: string; title: string; body: string }[] };
  services: { title: string; body: string; bookingUrl: string; image: string }[];
  scalpWellness: { title: string; intro: string; pills: string[] };
  products: { title: string; intro: string; items: { name: string; body: string; image: string }[] };
  ebooks: { title: string; intro: string; items: { title: string; body: string; buttonUrl: string; cover: string }[] };
  about: { title: string; bio: string[]; certifications: string[]; headshot: string };
  testimonials: {
    showBeforeAfter: boolean;
    items: { quote: string; name: string; service: string; beforeImage: string; afterImage: string }[];
  };
  finalCta: { headline: string; subtext: string; cta: string; ctaUrl: string };
}

/** The section slugs, in page order — used as locs_site_content primary keys. */
export const SECTION_KEYS = [
  'hero', 'quiz', 'method', 'services', 'scalpWellness',
  'products', 'ebooks', 'about', 'testimonials', 'finalCta',
] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

/* --------------------------- static globals --------------------------- */
// Not part of the per-section editable table; carried verbatim from the live
// site. (Booking is the default target for every CTA that doesn't override it.)

export const BOOKING_URL = 'https://lawco.glossgenius.com';

export const CONTACT = {
  phone: '(314) 295-2824',
  phoneHref: 'tel:+13142952824',
  location: 'iSlay Studios · St. Louis, MO',
  hours: [
    { day: 'Mon–Fri', time: '4:00–8:00 pm' },
    { day: 'Saturday', time: '9:00 am–5:00 pm' },
    { day: 'Sunday', time: 'Closed' },
  ],
};

/* ------------------------------ defaults ------------------------------ */

export const DEFAULTS: SiteContent = {
  hero: {
    headline: 'Cultivating healthy scalp, hair, and locs — for each individual.',
    tagline: 'Every loc tells a story. My job is to honor yours.',
    cta: 'Book a consultation',
    ctaUrl: BOOKING_URL,
    image: '',
  },

  quiz: {
    intro: 'A few quick questions to point you toward the right first step.',
    questions: [
      {
        q: 'Where are you in your loc journey?',
        options: [
          { label: 'Starting fresh', key: 'traditional' },
          { label: 'Maintaining existing locs', key: 'traditional' },
          { label: 'Ready for a new style', key: 'styling' },
          { label: 'Dealing with scalp concerns', key: 'scalp' },
        ],
      },
      {
        q: 'What matters most right now?',
        options: [
          { label: 'Scalp health & relief', key: 'scalp' },
          { label: 'A precise, versatile look', key: 'sisterlocks' },
          { label: 'Bold, statement locs', key: 'large' },
          { label: 'A fresh style for an event', key: 'styling' },
        ],
      },
      {
        q: 'Your ideal loc size?',
        options: [
          { label: 'Micro / Sisterlocks', key: 'sisterlocks' },
          { label: 'Traditional', key: 'traditional' },
          { label: 'Large / Wicks', key: 'large' },
          { label: 'Not sure yet', key: 'traditional' },
        ],
      },
    ],
    results: {
      sisterlocks: { title: 'Sisterlocks / Microlocs', body: 'Precise, versatile micro-locs look like a beautiful fit. Let’s talk sizing and a maintenance rhythm that keeps them healthy.' },
      traditional: { title: 'Traditional Locs', body: 'Classic locs with palm rolling or interlocking suit you. We’ll build a plan for strong, healthy growth.' },
      large: { title: 'Large Locs / Wicks', body: 'Bold, statement locs are calling. Let’s shape and groom them to suit your look and lifestyle.' },
      scalp: { title: 'Scalp Wellness Consultation', body: 'Let’s start at the scalp — an assessment, gentle cleansing, and a wellness plan so your locs thrive from the root.' },
      styling: { title: 'Loc Styling', body: 'From everyday looks to premium event styles — let’s find the perfect one for your moment.' },
    },
  },

  method: {
    title: 'The Locs & Wellness Method',
    intro: 'A calm, considered path from first conversation to lasting home care.',
    steps: [
      { n: '01', title: 'Consultation', body: 'We start by listening — your history, your scalp, your goals for your locs.' },
      { n: '02', title: 'Personalized recommendations', body: 'A plan built around your hair type, lifestyle, and where you want to go.' },
      { n: '03', title: 'Professional service', body: 'Skilled, unhurried hands-on care in a peaceful studio setting.' },
      { n: '04', title: 'Home care guidance', body: 'Simple, sustainable routines so your progress continues between visits.' },
    ],
  },

  services: [
    { title: 'Sisterlocks / Microlocs', body: 'Precise, versatile micro-sized locs installed and maintained with care.', bookingUrl: BOOKING_URL, image: '' },
    { title: 'Traditional Locs', body: 'Palm rolling, interlocking, and crochet methods for classic, healthy locs.', bookingUrl: BOOKING_URL, image: '' },
    { title: 'Large Locs / Wicks', body: 'Bold, statement locs and wicks shaped and groomed to suit you.', bookingUrl: BOOKING_URL, image: '' },
    { title: 'Loc Styling', body: 'From simple everyday looks to premium styles for your special moments.', bookingUrl: BOOKING_URL, image: '' },
  ],

  scalpWellness: {
    title: 'Scalp Wellness',
    intro: 'The clinical, wellness-focused side of loc care — because healthy locs start at the scalp.',
    pills: ['Scalp assessments', 'Cleansing', 'Exfoliation', 'Hydration', 'Wellness treatments'],
  },

  products: {
    title: 'Products & Home Care',
    intro: 'A short, honest shelf of what I actually reach for — expanding soon.',
    items: [
      { name: 'Hydrating Scalp Mist', body: 'Lightweight daily moisture for a calm, balanced scalp.', image: '' },
      { name: 'Gentle Cleansing Wash', body: 'Residue-free clarifying wash that respects your locs.', image: '' },
      { name: 'Sealing Loc Oil', body: 'A finishing oil to seal in moisture and add soft shine.', image: '' },
    ],
  },

  ebooks: {
    title: 'Learn with me',
    intro: 'Guides to help you care for your scalp and locs between visits.',
    items: [
      { title: 'The Healthy Scalp Starter', body: 'The fundamentals of a balanced, thriving scalp.', buttonUrl: '', cover: '' },
      { title: 'Loc Maintenance at Home', body: 'A simple weekly rhythm to keep your locs strong.', buttonUrl: '', cover: '' },
    ],
  },

  about: {
    title: 'Meet Leslie',
    bio: [
      'The Locs & Wellness Co. was born from a simple belief: every loc tells a story, and my job is to honor yours.',
      'I care for scalp, hair, and locs as one connected system — blending skilled technique with genuine wellness, so you leave feeling seen, not rushed.',
    ],
    certifications: ['Certified Loctician', 'Scalp & Trichology Care (placeholder)', 'Sisterlocks-trained (placeholder)'],
    headshot: '',
  },

  testimonials: {
    showBeforeAfter: false,
    items: [
      { quote: 'Placeholder quote — carried from the live site; Leslie can edit or replace.', name: 'Tanya M.', service: 'Traditional Retwist', beforeImage: '', afterImage: '' },
      { quote: 'Placeholder quote — carried from the live site; Leslie can edit or replace.', name: 'Darius K.', service: 'Large Locs Grooming', beforeImage: '', afterImage: '' },
      { quote: 'Placeholder quote — carried from the live site; Leslie can edit or replace.', name: 'Janelle R.', service: 'Interlocking', beforeImage: '', afterImage: '' },
    ],
  },

  finalCta: {
    headline: 'Ready to begin your loc wellness journey?',
    subtext: 'Book a consultation and let’s build a plan for your healthiest scalp, hair, and locs.',
    cta: 'Schedule your consultation',
    ctaUrl: BOOKING_URL,
  },
};
