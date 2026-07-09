// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Tailwind is used by the /locs portal only. The static marketing HTML in
// public/ ships its own inline styles and is unaffected.

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // --- marketing palette: ivory bg + black / gold / deep emerald (no red) ---
        'site-sand':    '#F5F0E3', // ivory page background
        'site-sand2':   '#FCF9F1', // raised ivory (cards, alt sections)
        'site-wood':    '#2B2720', // charcoal — body text
        'site-wood2':   '#15120D', // near-black — headings / dark panels
        'site-red':     '#0B5E52', // retired: repointed to emerald so stray uses stay on-palette
        'site-gold':    '#BF9D45', // rich gold accent
        'site-emerald': '#0B5E52', // deep emerald green (primary action)
        'site-emerald2':'#08463C', // emerald hover / deep
        'site-ink':     '#17140E', // near-black ink
        'site-rule':    '#E7DFCC', // hairline borders on ivory
        'site-muted':   '#7C7360', // warm neutral gray for secondary text

        // Ivory / emerald / gold — matches the marketing site tokens.
        'locs-ivory':   '#F4EEE1',
        'locs-ivory2':  '#FBF7EE',
        'locs-ivory3':  '#EBE2D0',
        'locs-ink':     '#15120C',
        'locs-rule':    '#E0D6C2',
        'locs-gray':    '#8A8073',
        'locs-silver':  '#55504A',
        'locs-emerald': '#0C5140',
        'locs-emerald2':'#083A2C',
        'locs-gold':    '#B08A2E',
        'locs-gold2':   '#C9A84C',
        'locs-dim':     'rgba(12,81,64,0.10)',
        'locs-fire':    '#C0492E',
        'locs-water':   '#2E6FB0',
        'locs-air':     '#8A8073',
        'locs-earth':   '#7A5C2E',
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        jost: ['Jost', 'sans-serif'],
        fraunces: ['Fraunces', 'Playfair Display', 'serif'],
      },
      keyframes: {
        drawStroke: { from: { strokeDashoffset: '1' }, to: { strokeDashoffset: '0' } },
        softRise: { from: { opacity: '0', transform: 'translateY(18px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        breathe: { '0%,100%': { transform: 'scale(1)', opacity: '0.5' }, '50%': { transform: 'scale(1.04)', opacity: '0.8' } },
      },
      animation: {
        'soft-rise': 'softRise 1s cubic-bezier(0.22,1,0.36,1) both',
        'breathe': 'breathe 9s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
