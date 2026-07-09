// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Brand logo — the real lawco-logo.png (white calligraphic mark + wordmark on
// black). Because the art is white-on-black, it's shown as a rounded black tile
// with a thin gold ring so it reads intentionally against the ivory page.
// (A raster PNG can't be stroke-drawn like an SVG, so the mark fades/scales in
// instead of the pen-trace animation.)

export default function Logo({
  className = '',
  size = 'nav',
}: { className?: string; size?: 'nav' | 'hero' }) {
  const box = size === 'hero'
    ? 'h-44 w-44 rounded-[2rem] sm:h-52 sm:w-52'
    : 'h-14 w-14 rounded-2xl';
  return (
    // eslint-disable-next-line @next/next/no-img-element -- brand asset in /public; next/image not needed.
    <img
      src="/lawco-logo.png"
      alt="The Locs & Wellness Co."
      className={`${box} object-cover shadow-sm ring-1 ring-site-gold/45 ${className}`}
    />
  );
}
