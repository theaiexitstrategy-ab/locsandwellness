// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Brand logo = the REAL lawco-logo.png (exact shape), not a redrawn approximation.
// The white-on-black PNG is used as a luminance mask so only the calligraphic
// "L" + wordmark show (the black square drops out), recolored near-black to read
// on the ivory page. To "draw" it, a thick pen path sweeps along the L's stroke
// as an animated reveal mask — so the exact logo appears stroke-by-stroke on load.

const SRC = '/lawco-logo.png';

// Pen centerline following the L: down the stem, loop at the foot, then the
// tail (under the wordmark). Coordinates are in the PNG's 500×500 space. It only
// controls REVEAL ORDER — the visible shape is the real logo via the luminance mask.
const PEN =
  'M283 34 C250 105 175 215 152 255 C133 290 88 305 93 288 C98 273 140 276 178 278 C266 284 362 278 414 280';

export default function Logo({
  className = '',
  size = 'hero',
  animate = false,
}: { className?: string; size?: 'nav' | 'hero'; animate?: boolean }) {
  const uid = size; // one hero + one nav per page → ids stay unique
  const dim = size === 'hero' ? 'h-40 w-auto sm:h-52' : 'h-12 w-auto';
  return (
    <svg
      viewBox="75 15 350 300"
      className={`${dim} ${className}`}
      role="img"
      aria-label="The Locs & Wellness Co."
    >
      <defs>
        {/* Luminance mask: white logo art → shown, black background → dropped. */}
        <mask id={`logoShape-${uid}`} maskUnits="userSpaceOnUse" x="0" y="0" width="500" height="500">
          <image href={SRC} x="0" y="0" width="500" height="500" preserveAspectRatio="xMidYMid meet" />
        </mask>
        {animate && (
          /* Pen reveal: a thick stroke that draws along the L on load. */
          <mask id={`penReveal-${uid}`} maskUnits="userSpaceOnUse" x="0" y="0" width="500" height="500">
            <path className="loc-pen" d={PEN} fill="none" stroke="#fff" strokeWidth={90}
              strokeLinecap="round" strokeLinejoin="round" pathLength={1} />
          </mask>
        )}
      </defs>
      <g mask={animate ? `url(#penReveal-${uid})` : undefined}>
        <rect x="0" y="0" width="500" height="500" fill="#15120D" mask={`url(#logoShape-${uid})`} />
      </g>
    </svg>
  );
}
