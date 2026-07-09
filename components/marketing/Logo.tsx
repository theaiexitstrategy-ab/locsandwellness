// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Brand logo as VECTOR path data so the calligraphic "L" can draw itself on
// load (stroke-dasharray/​offset trace — see .loc-draw in marketing.css). The
// mark is a single continuous pen-stroke: down the stem, a small loop at the
// foot, then a long tail swash — with a gold baseline flourish drawn after.
// This is a vector recreation of Leslie's lawco-logo.png (a raster PNG can't be
// stroke-drawn); swap in a pixel-exact vectorization of her mark to refine.

export default function Logo({
  className = '',
  size = 'hero',
  animate = false,
  showWordmark = true,
}: { className?: string; size?: 'nav' | 'hero'; animate?: boolean; showWordmark?: boolean }) {
  const svgH = size === 'hero' ? 'h-36 sm:h-48' : 'h-11';
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg
        viewBox="0 0 400 300"
        className={`${svgH} w-auto ${animate ? 'loc-draw' : ''}`}
        fill="none"
        stroke="#15120D"
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-label="The Locs & Wellness Co."
      >
        {/* Single continuous calligraphic "L": stem → foot loop → long tail. */}
        <path pathLength={1}
          d="M212 38 C193 104 164 196 149 234 C142 252 118 260 116 243 C114 228 151 231 180 241 C252 263 332 251 374 232" />
        {/* Gold baseline flourish, drawn just after the L. */}
        <path pathLength={1} className="loc-draw-2" stroke="#BF9D45" strokeWidth={5}
          d="M96 270 C200 256 322 256 386 270" />
      </svg>
      {showWordmark && (
        <span className="mt-3 font-display text-[11px] font-semibold uppercase tracking-[0.30em] text-site-wood2 sm:text-xs">
          The Locs &amp; Wellness Co.
        </span>
      )}
    </div>
  );
}
