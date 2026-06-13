import { useEffect, useRef } from "react";

/**
 * Cheap cursor-following glow: a fixed-size pre-rendered element translated
 * via transform (composited only — no paint per frame). Disabled on touch.
 */
export function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let raf = 0;
    let pending = false;
    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (pending) return;
      pending = true;
      raf = requestAnimationFrame(() => {
        pending = false;
        el.style.transform = `translate3d(${x - 360}px, ${y - 360}px, 0)`;
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-0 size-[720px] rounded-full will-change-transform"
      style={{
        background:
          "radial-gradient(circle, oklch(0.82 0.16 205 / 0.08), oklch(0.55 0.22 285 / 0.04) 40%, transparent 70%)",
        transform: "translate3d(-9999px, -9999px, 0)",
      }}
    />
  );
}