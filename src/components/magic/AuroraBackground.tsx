import { useEffect, useState } from "react";

/**
 * Lightweight aurora background — 3 blurred blobs (no mix-blend, smaller blur radii)
 * so compositing stays cheap. Respects prefers-reduced-motion.
 */
export function AuroraBackground() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const fn = () => setReduced(m.matches);
    m.addEventListener("change", fn);
    return () => m.removeEventListener("change", fn);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div
        className="absolute -top-[30%] -left-[20%] size-[50vmax] rounded-full opacity-25 blur-[80px] will-change-transform"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, oklch(0.78 0.17 205 / 0.9), transparent 60%)",
          animation: reduced ? undefined : "aurora-drift-a 32s ease-in-out infinite",
        }}
      />
      <div
        className="absolute top-[-5%] right-[-25%] size-[45vmax] rounded-full opacity-22 blur-[80px] will-change-transform"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, oklch(0.62 0.22 255 / 0.85), transparent 60%)",
          animation: reduced ? undefined : "aurora-drift-b 38s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-[-35%] left-[10%] size-[55vmax] rounded-full opacity-20 blur-[80px] will-change-transform"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, oklch(0.55 0.24 295 / 0.85), transparent 60%)",
          animation: reduced ? undefined : "aurora-drift-c 44s ease-in-out infinite",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, transparent 0%, oklch(0.09 0.02 240 / 0.75) 60%, oklch(0.07 0.02 240 / 0.95) 100%)",
        }}
      />
    </div>
  );
}