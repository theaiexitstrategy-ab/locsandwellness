// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Signature visual motif — concentric "loc coil" rings. Calm, unhurried,
// abstract (no literal iconography). Used as a soft backdrop accent. Purely
// decorative, so it's aria-hidden.

export default function Motif({
  className = '',
  color = '#0B5E52',
  breathe = false,
}: { className?: string; color?: string; breathe?: boolean }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`${className} ${breathe ? 'animate-breathe' : ''}`}
      fill="none"
      stroke={color}
      aria-hidden="true"
    >
      {[92, 74, 56, 38, 20].map((r, i) => (
        <circle key={r} cx="100" cy="100" r={r}
          strokeWidth={1.25}
          strokeOpacity={0.5 - i * 0.06}
          strokeDasharray={i % 2 ? '2 7' : undefined} />
      ))}
    </svg>
  );
}
