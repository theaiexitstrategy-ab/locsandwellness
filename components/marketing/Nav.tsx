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
            <a key={l.href} href={l.href} className="text-sm font-medium text-site-wood transition hover:text-site-emerald">
              {l.label}
            </a>
          ))}
        </nav>

        {/* Center: logo, pinned to true page center */}
        <a href="#top" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Logo size="nav" />
        </a>

        {/* Right: client login + booking CTA */}
        <div className="ml-auto flex items-center gap-4 md:ml-0">
          {/* Customers reach their portal account from the homepage — no /admin. */}
          <a href="/locs/signin" className="hidden text-sm font-medium text-site-wood transition hover:text-site-emerald sm:inline">
            Client Login
          </a>
          <a href={ctaUrl || BOOKING_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">
            Book Now
          </a>
        </div>
      </div>
    </header>
  );
}
