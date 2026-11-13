import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/** Logo mark: a squircle with a pulse glyph and a breathing glow. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative grid size-9 shrink-0 place-items-center rounded-[0.3rem] bg-gradient-primary shadow-glow",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-[60%] text-primary-foreground" fill="none">
        <path
          d="M2 12h4.5l2-4.5 3.5 10 3-7 1.5 1.5H22"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="absolute inset-0 rounded-[inherit] ring-1 ring-foreground/20 ring-inset" />
    </span>
  );
}

export function Brand({
  to = "/",
  compact = false,
  className,
}: {
  to?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link to={to} className={cn("group flex items-center gap-3", className)} aria-label="BioPulse">
      <BrandMark className="transition-transform duration-500 group-hover:rotate-[-8deg]" />
      {!compact && (
        <span className="leading-none">
          <span className="font-wide text-[0.95rem] font-medium tracking-[0.04em] text-foreground">
            BIO<span className="text-primary-glow">PULSE</span>
          </span>
          <span className="mt-1 block font-mono text-[0.55rem] tracking-[0.28em] text-faint">
            ATHLETE INTELLIGENCE
          </span>
        </span>
      )}
    </Link>
  );
}
