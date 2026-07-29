'use client';
// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Client-side interactions for the marketing homepage — direct port of
// the ex-public/script.js vanilla JS. Everything hangs off the DOM ids
// that page.tsx renders in the server pass, so the JSX and this
// controller stay in sync via those ids. Mounts once, wires listeners
// via useEffect, tears down on unmount.
//
// What lives here:
//   1. Hamburger open/close (#navToggle, #mobileMenu, #menuClose)
//   2. Guide-modal open/close + name/email capture (#quizModal + form)
//   3. Guide download trigger — same-origin PDF
//
// The Supabase quiz-lead insert stays as a direct PostgREST call using
// the PUBLIC anon key — matches the original script.js and the
// lib/supabase/client.ts pattern.

import { useEffect } from 'react';

const SUPABASE_URL      = 'https://bnkoqybkmwtrlorhowyv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJua29xeWJrbXd0cmxvcmhvd3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MzUzODIsImV4cCI6MjA5MTAxMTM4Mn0.9_zS120_HF89HR4u_u48UOT2wgHKVHPg1W4sg4_h1mU';
const LEADS_TABLE       = 'locs_quiz_leads';
const GUIDE_PDF         = '/guides/The-Complete-Guide-to-a-Healthy-Loc-Wellness-System.pdf';
const GUIDE_NAME        = 'The-Complete-Guide-to-Creating-a-Healthy-Loc-Wellness-System.pdf';

export default function MarketingClient() {
  useEffect(() => {
    const $ = (sel: string) => document.querySelector(sel);
    const lockScroll   = () => document.body.classList.add('no-scroll');
    const unlockScroll = () => document.body.classList.remove('no-scroll');
    const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    // Grab elements after the server pass has rendered them.
    const navToggle  = $('#navToggle') as HTMLButtonElement | null;
    const mobileMenu = $('#mobileMenu') as HTMLElement | null;
    const menuClose  = $('#menuClose')  as HTMLButtonElement | null;
    const modal      = $('#quizModal')  as HTMLElement | null;
    const modalClose = $('#modalClose') as HTMLButtonElement | null;
    const captureForm = $('#captureForm') as HTMLFormElement | null;
    const modalIntro  = $('#modalIntro')  as HTMLElement | null;
    const modalThanks = $('#modalThanks') as HTMLElement | null;
    const formError   = $('#formError')   as HTMLElement | null;
    const submitBtn   = $('#captureSubmit') as HTMLButtonElement | null;
    const getGuideBtn = $('#getGuide') as HTMLButtonElement | null;
    let   lastFocused: HTMLElement | null = null;

    // ── Mobile menu ───────────────────────────────────────────────
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

    // ── Modal ─────────────────────────────────────────────────────
    const openModal = () => {
      if (!modal) return;
      lastFocused = document.activeElement as HTMLElement | null;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      lockScroll();
      if (modalIntro) modalIntro.hidden = false;
      if (modalThanks) modalThanks.hidden = true;
      if (formError) formError.hidden = true;
      captureForm?.reset();
      setTimeout(() => ($('#fName') as HTMLInputElement | null)?.focus(), 60);
    };
    const closeModal = () => {
      if (!modal) return;
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      unlockScroll();
      lastFocused?.focus();
    };
    getGuideBtn?.addEventListener('click', openModal);
    modalClose?.addEventListener('click', closeModal);
    const backdropClose = (e: MouseEvent) => { if (e.target === modal) closeModal(); };
    modal?.addEventListener('click', backdropClose);
    const escHandler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (modal?.classList.contains('open')) closeModal();
      else if (mobileMenu?.classList.contains('open')) closeMenu();
    };
    document.addEventListener('keydown', escHandler);

    // ── Guide download ────────────────────────────────────────────
    const downloadGuide = () => {
      const a = document.createElement('a');
      a.href = GUIDE_PDF;
      a.download = GUIDE_NAME;
      document.body.appendChild(a);
      a.click();
      a.remove();
    };

    // ── Quiz lead form ────────────────────────────────────────────
    const showError = (msg: string) => {
      if (!formError) return;
      formError.textContent = msg;
      formError.hidden = false;
    };
    const submitHandler = async (e: SubmitEvent) => {
      e.preventDefault();
      if (formError) formError.hidden = true;
      const name  = (($('#fName') as HTMLInputElement | null)?.value || '').trim();
      const email = (($('#fEmail') as HTMLInputElement | null)?.value || '').trim();
      if (!name)          return showError('Please enter your first name.');
      if (!isEmail(email)) return showError('Please enter a valid email address.');
      if (!submitBtn) return;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${LEADS_TABLE}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ name, email, source: 'guide_download' }),
        });
        if (!res.ok) throw new Error(`Supabase responded ${res.status}`);
        // Fire-and-forget branded email via /api/guide.
        fetch('/api/guide', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email }),
        }).catch((err) => console.error('[guide-email]', err));
        if (modalIntro)  modalIntro.hidden = true;
        if (modalThanks) modalThanks.hidden = false;
        const thanksCopy = $('#thanksCopy');
        if (thanksCopy) thanksCopy.textContent =
          `Thanks, ${name.split(' ')[0]}! Your guide is downloading now — we've also emailed a copy to ${email}.`;
        downloadGuide();
      } catch (err) {
        console.error(err);
        showError('Something went wrong. Please try again.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send me the guide';
      }
    };
    captureForm?.addEventListener('submit', submitHandler as unknown as EventListener);

    // Cleanup on unmount
    return () => {
      navToggle?.removeEventListener('click', openMenu);
      menuClose?.removeEventListener('click', closeMenu);
      menuLinks.forEach((a) => a.removeEventListener('click', closeMenu));
      getGuideBtn?.removeEventListener('click', openModal);
      modalClose?.removeEventListener('click', closeModal);
      modal?.removeEventListener('click', backdropClose);
      document.removeEventListener('keydown', escHandler);
      captureForm?.removeEventListener('submit', submitHandler as unknown as EventListener);
    };
  }, []);

  return null;
}
