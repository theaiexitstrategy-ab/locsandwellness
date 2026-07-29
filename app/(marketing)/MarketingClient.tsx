'use client';
// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Client-side interactions for the marketing homepage. The ebook is now a
// merch product bought via Stripe (see lib/marketing/ebook.ts + the Stripe
// webhook), so the old free-guide capture modal + download logic were
// removed. What remains is the mobile menu (open/close + Esc + link-close).
//
// Everything hangs off DOM ids that page.tsx renders in the server pass.

import { useEffect } from 'react';

export default function MarketingClient() {
  useEffect(() => {
    const $ = (sel: string) => document.querySelector(sel);
    const lockScroll   = () => document.body.classList.add('no-scroll');
    const unlockScroll = () => document.body.classList.remove('no-scroll');

    const navToggle  = $('#navToggle') as HTMLButtonElement | null;
    const mobileMenu = $('#mobileMenu') as HTMLElement | null;
    const menuClose  = $('#menuClose')  as HTMLButtonElement | null;

    const openMenu = () => {
      if (!mobileMenu || !navToggle) return;
      mobileMenu.classList.add('open');
      mobileMenu.setAttribute('aria-hidden', 'false');
      navToggle.setAttribute('aria-expanded', 'true');
      lockScroll();
    };
    const closeMenu = () => {
      if (!mobileMenu || !navToggle) return;
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      navToggle.setAttribute('aria-expanded', 'false');
      unlockScroll();
    };
    navToggle?.addEventListener('click', openMenu);
    menuClose?.addEventListener('click', closeMenu);
    const menuLinks = Array.from(mobileMenu?.querySelectorAll('.mobile-menu-link') || []);
    menuLinks.forEach((a) => a.addEventListener('click', closeMenu));

    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenu?.classList.contains('open')) closeMenu();
    };
    document.addEventListener('keydown', escHandler);

    return () => {
      navToggle?.removeEventListener('click', openMenu);
      menuClose?.removeEventListener('click', closeMenu);
      menuLinks.forEach((a) => a.removeEventListener('click', closeMenu));
      document.removeEventListener('keydown', escHandler);
    };
  }, []);

  return null;
}
