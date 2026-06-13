/**
 * Tiny pulsing "live" indicator. Premium signal of liveness.
 */
export function LiveDot({ label = "Live", tone = "primary" }: { label?: string; tone?: "primary" | "success" | "danger" }) {
  const color =
    tone === "danger" ? "bg-rose-500" : tone === "success" ? "bg-emerald-400" : "bg-primary";
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] font-semibold text-white/70">
      <span className="relative flex size-1.5">
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${color} opacity-60`} />
        <span className={`relative inline-flex size-1.5 rounded-full ${color}`} />
      </span>
      {label}
    </span>
  );
}