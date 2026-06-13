import { cn } from "@/lib/utils";

/**
 * Signature mark — an aurora-tinted asterisk/hexagram.
 * Recurs across empty states, loading, toasts, the favicon.
 */
export function AuroraMark({
  className,
  size = 24,
  spin = false,
}: {
  className?: string;
  size?: number;
  spin?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn(spin && "animate-[spin_8s_linear_infinite]", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="am-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.82 0.16 205)" />
          <stop offset="55%" stopColor="oklch(0.7 0.2 240)" />
          <stop offset="100%" stopColor="oklch(0.55 0.22 295)" />
        </linearGradient>
      </defs>
      <g stroke="url(#am-grad)" strokeWidth={1.6} strokeLinecap="round">
        <line x1="12" y1="2" x2="12" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="4.9" y1="4.9" x2="19.1" y2="19.1" />
        <line x1="19.1" y1="4.9" x2="4.9" y2="19.1" />
      </g>
      <circle cx="12" cy="12" r="2.2" fill="url(#am-grad)" />
    </svg>
  );
}