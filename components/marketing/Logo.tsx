// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Brand logo. The calligraphic swoosh is real SVG path data so it can
// stroke-draw on load (see .loc-draw in marketing.css). NOTE: these paths are a
// hand-approximated placeholder of Leslie's single-stroke calligraphic mark —
// swap in the true vector export for a pixel-accurate draw-on before launch.

export default function Logo({
  className = '',
  animate = false,
  showWordmark = true,
}: { className?: string; animate?: boolean; showWordmark?: boolean }) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg
        viewBox="0 0 240 120"
        className={`h-14 w-auto ${animate ? 'loc-draw' : ''}`}
        fill="none"
        stroke="#5C3C24"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-label="The Locs & Wellness Co."
      >
        {/* Big calligraphic "L" — descending swoosh into a rising hook. */}
        <path pathLength={1} d="M70 14 C48 38 44 82 74 96 C98 108 128 92 138 66" />
        {/* Long tail swash under the wordmark. */}
        <path pathLength={1} className="loc-draw-2" stroke="#D9A441"
          d="M34 104 C96 94 176 94 214 104" />
      </svg>
      {showWordmark && (
        <span className="mt-1 font-display text-[11px] font-semibold uppercase tracking-[0.28em] text-site-wood2">
          The Locs &amp; Wellness Co.
        </span>
      )}
    </div>
  );
}
