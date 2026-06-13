import { useEffect, useState } from "react";

/**
 * Fixed, full-viewport animated aurora. Slow-drifting blurred blobs
 * (cyan → indigo → violet) on a near-black canvas + SVG grain overlay.
 * GPU-cheap: only `transform` is animated, never `filter` or `background`.
 * Respects prefers-reduced-motion.
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
      {/* base wash */}
      <div className="absolute inset-0 bg-background" />
      {/* aurora blobs */}
      <div
        className="absolute -top-[20%] -left-[10%] size-[60vmax] rounded-full opacity-60 mix-blend-screen blur-[120px] will-change-transform"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, oklch(0.78 0.17 205 / 0.9), transparent 60%)",
          animation: reduced ? undefined : "aurora-drift-a 28s ease-in-out infinite",
        }}
      />
      <div
        className="absolute top-[10%] right-[-15%] size-[55vmax] rounded-full opacity-55 mix-blend-screen blur-[120px] will-change-transform"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, oklch(0.62 0.22 255 / 0.85), transparent 60%)",
          animation: reduced ? undefined : "aurora-drift-b 34s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-[-25%] left-[20%] size-[65vmax] rounded-full opacity-50 mix-blend-screen blur-[140px] will-change-transform"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, oklch(0.55 0.24 295 / 0.85), transparent 60%)",
          animation: reduced ? undefined : "aurora-drift-c 40s ease-in-out infinite",
        }}
      />
      <div
        className="absolute top-[40%] left-[35%] size-[40vmax] rounded-full opacity-40 mix-blend-screen blur-[120px] will-change-transform"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, oklch(0.7 0.2 180 / 0.7), transparent 60%)",
          animation: reduced ? undefined : "aurora-drift-d 46s ease-in-out infinite",
        }}
      />
      {/* darken vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, transparent 0%, oklch(0.10 0.02 240 / 0.55) 70%, oklch(0.08 0.02 240 / 0.85) 100%)",
        }}
      />
      {/* grain — inline SVG, fixed at 2.5% */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          backgroundSize: "160px 160px",
        }}
      />
    </div>
  );
}