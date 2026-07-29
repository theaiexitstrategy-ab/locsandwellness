/* =====================================================================
   The Locs + Wellness Co. — interactions
   Vanilla JS, no frameworks.
   © 2026 GoElev8.ai
   ===================================================================== */

/* -----------------------------------------------------------------
   SUPABASE — quiz lead capture
   Writes to the `locs_quiz_leads` table via the PostgREST endpoint
   (no SDK needed). RLS lets the anon key INSERT only; leads are
   admin-read (see supabase/migrations/..._create_locs_quiz_leads.sql).
   The anon key is a PUBLIC, publishable key — safe to ship client-side.
   ----------------------------------------------------------------- */
const SUPABASE_URL      = 'https://bnkoqybkmwtrlorhowyv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJua29xeWJrbXd0cmxvcmhvd3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MzUzODIsImV4cCI6MjA5MTAxMTM4Mn0.9_zS120_HF89HR4u_u48UOT2wgHKVHPg1W4sg4_h1mU';
const LEADS_TABLE       = 'locs_quiz_leads';

async function saveLead(lead) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${LEADS_TABLE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ name: lead.name, email: lead.email, source: lead.source || 'website_quiz' }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Supabase responded ${res.status} ${detail}`);
  }
  return { ok: true };
}

/* -----------------------------------------------------------------
   Small helpers
   ----------------------------------------------------------------- */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const lockScroll   = () => document.body.classList.add('no-scroll');
const unlockScroll = () => document.body.classList.remove('no-scroll');
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/* -----------------------------------------------------------------
   Mobile menu (hamburger)
   ----------------------------------------------------------------- */
const navToggle  = $('#navToggle');
const mobileMenu = $('#mobileMenu');
const menuClose  = $('#menuClose');

function openMenu() {
  mobileMenu.classList.add('open');
  mobileMenu.setAttribute('aria-hidden', 'false');
  navToggle.setAttribute('aria-expanded', 'true');
  lockScroll();
}
function closeMenu() {
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  navToggle.setAttribute('aria-expanded', 'false');
  unlockScroll();
}

navToggle.addEventListener('click', openMenu);
menuClose.addEventListener('click', closeMenu);
// Any in-menu link closes the menu (and lets the anchor jump happen)
mobileMenu.querySelectorAll('.mobile-menu-link').forEach((a) =>
  a.addEventListener('click', closeMenu)
);

/* -----------------------------------------------------------------
   Quiz modal — capture name + email BEFORE any questions
   ----------------------------------------------------------------- */
const modal        = $('#quizModal');
const openQuizBtn  = $('#openQuiz');
const modalClose   = $('#modalClose');
const captureForm  = $('#captureForm');
const modalIntro   = $('#modalIntro');
const modalThanks  = $('#modalThanks');
const formError    = $('#formError');
const submitBtn    = $('#captureSubmit');
let   lastFocused  = null;

function openModal() {
  lastFocused = document.activeElement;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  lockScroll();
  // reset state each open
  modalIntro.hidden = false;
  modalThanks.hidden = true;
  formError.hidden = true;
  captureForm.reset();
  setTimeout(() => $('#fName').focus(), 60);
}
function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  unlockScroll();
  if (lastFocused) lastFocused.focus();
}

// The homepage "Take the Quiz" CTA links to /quiz; the capture modal is now the
// gate for the free guide download ("Get the free guide").
const getGuideBtn = $('#getGuide');
if (getGuideBtn) getGuideBtn.addEventListener('click', openModal);
if (openQuizBtn) openQuizBtn.addEventListener('click', openModal);
if (modalClose) modalClose.addEventListener('click', closeModal);
// Click the dim backdrop (but not the panel) to close
if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
// Esc closes whichever overlay is open
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (modal.classList.contains('open')) closeModal();
  else if (mobileMenu.classList.contains('open')) closeMenu();
});

captureForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  formError.hidden = true;

  const name  = $('#fName').value.trim();
  const email = $('#fEmail').value.trim();

  if (!name)          return showError('Please enter your first name.');
  if (!isEmail(email)) return showError('Please enter a valid email address.');

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';

  try {
    await saveLead({ name, email, source: 'guide_download' });
    // Email a branded copy via Resend (fire-and-forget — never block the download).
    fetch('/api/guide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    }).catch((err) => console.error('[guide-email]', err));
    // Reveal the download and start it automatically.
    modalIntro.hidden = true;
    modalThanks.hidden = false;
    $('#thanksCopy').textContent =
      `Thanks, ${name.split(' ')[0]}! Your guide is downloading now — we've also emailed a copy to ${email}.`;
    downloadGuide();
  } catch (err) {
    console.error(err);
    showError('Something went wrong. Please try again.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send me the guide';
  }
});

function showError(msg) {
  formError.textContent = msg;
  formError.hidden = false;
}

/* -----------------------------------------------------------------
   Free guide download. Same-origin file, so the download attribute
   controls the saved filename shown to the user.
   ----------------------------------------------------------------- */
const GUIDE_PDF  = '/guides/The-Complete-Guide-to-a-Healthy-Loc-Wellness-System.pdf';
const GUIDE_NAME = 'The-Complete-Guide-to-Creating-a-Healthy-Loc-Wellness-System.pdf';
function downloadGuide() {
  const a = document.createElement('a');
  a.href = GUIDE_PDF;
  a.download = GUIDE_NAME;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
