type StampProps = {
  children: React.ReactNode;
  tone?: "ink" | "accent" | "live";
  tilt?: number;
  className?: string;
};

const tones = {
  ink: "text-ink/70",
  accent: "text-accent",
  live: "text-live",
};

export function Stamp({ children, tone = "ink", tilt = -2, className = "" }: StampProps) {
  return (
    <span
      className={`stamp ${tones[tone]} ${className}`}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      {children}
    </span>
  );
}
