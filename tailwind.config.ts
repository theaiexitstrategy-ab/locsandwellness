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
        // --- v2 marketing palette (Leslie's spec) ---
        'site-sand':    '#F5EEDD',
        'site-sand2':   '#FBF6EA',
        'site-wood':    '#5C3C24',
        'site-wood2':   '#40290F',
        'site-red':     '#CE1B23',
        'site-gold':    '#D9A441',
        'site-emerald': '#0B5E52',
        'site-emerald2':'#083F37',
        'site-ink':     '#2A1D12',
        'site-rule':    '#E4D8BF',
        'site-muted':   '#8A7B63',

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
