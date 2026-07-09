// (c) 2026 GoElev8.ai | Aaron Bryant. All rights reserved.
//
// Shared chrome for the Locs & Wellness Co. portal. Client-facing UI carries
// Locs & Wellness Co. branding with a "Powered by GoElev8.ai" footer credit.

import Link from 'next/link';
import SignOutButton from './SignOutButton';

export function LocsFooter() {
  return (
    <footer className="mt-16 border-t border-locs-rule py-6 text-center text-sm text-locs-gray">
      <p>© {new Date().getFullYear()} Locs &amp; Wellness Co.</p>
      <p className="mt-1">
        Powered by{' '}
        <a href="https://goelev8.ai" className="text-locs-emerald hover:underline">
          GoElev8.ai
        </a>
      </p>
    </footer>
  );
}

export function LocsNav({
  links,
  title = 'Locs & Wellness Co.',
}: {
  links: { href: string; label: string }[];
  title?: string;
}) {
  return (
    <nav className="sticky top-0 z-40 border-b border-locs-rule bg-locs-ivory/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
        <Link href="/locs" className="font-display text-lg font-semibold text-locs-emerald">
          {title}
        </Link>
        <div className="flex items-center gap-5">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-locs-ink hover:text-locs-emerald transition">
              {l.label}
            </Link>
          ))}
          <SignOutButton />
        </div>
      </div>
    </nav>
  );
}
