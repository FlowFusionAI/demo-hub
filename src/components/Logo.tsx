/**
 * Site logo: the operator rendered as a node on the Floor.
 * A rounded badge (like the project node cards) with the "SK" monogram and an
 * amber "live" dot, echoing the live-node indicator used across the site.
 * Colours come from globals.css tokens (var(--...)) so it tracks the palette.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="Saurav KC"
    >
      <rect
        x="3"
        y="3"
        width="26"
        height="26"
        rx="6.5"
        fill="var(--paper)"
        stroke="var(--ink)"
        strokeWidth="2"
      />
      <text
        x="15.5"
        y="21.4"
        textAnchor="middle"
        fontFamily="var(--font-fraunces), Georgia, serif"
        fontSize="13"
        fontWeight="700"
        letterSpacing="-0.4"
        fill="var(--ink)"
      >
        SK
      </text>
      <circle
        cx="24.5"
        cy="7.5"
        r="3.2"
        fill="var(--accent)"
        stroke="var(--paper)"
        strokeWidth="1.5"
      />
    </svg>
  );
}
