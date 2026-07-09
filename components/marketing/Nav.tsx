// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Header. The logo is absolutely centered (left:50% + translateX(-50%)) so it
// stays pixel-true regardless of the unequal nav-links / button widths on
// either side. The logo draw-on runs once here on load.

import Logo from './Logo';
import { BOOKING_URL } from '@/lib/marketing/content';

const LINKS = [
  { href: '#method', label: 'Method' },
  { href: '#services', label: 'Services' },
  { href: '#about', label: 'About' },
];

export default function Nav({ ctaUrl }: { ctaUrl?: string }) {
  return (
    <header className="relative z-40 border-b border-site-rule/70 bg-site-sand/85 backdrop-blur">
      <div className="site-wrap relative flex h-24 items-center justify-between">
        {/* Left: nav links */}
        <nav className="hidden gap-7 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-site-wood transition hover:text-site-red">
              {l.label}
            </a>
          ))}
        </nav>

        {/* Center: logo, pinned to true page center */}
        <a href="#top" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Logo animate />
        </a>

        {/* Right: booking CTA */}
        <a href={ctaUrl || BOOKING_URL} target="_blank" rel="noopener noreferrer" className="btn-primary ml-auto md:ml-0">
          Book Now
        </a>
      </div>
    </header>
  );
}
