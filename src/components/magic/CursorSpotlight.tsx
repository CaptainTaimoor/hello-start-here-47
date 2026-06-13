import { useEffect, useRef } from "react";

/**
 * Page-level cursor-following radial glow. Subtle (0.05 opacity).
 * Pointer-events disabled. Updates via rAF on mousemove.
 */
export function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.background = `radial-gradient(620px circle at ${x}px ${y}px, oklch(0.82 0.16 205 / 0.07), oklch(0.55 0.22 285 / 0.04) 35%, transparent 65%)`;
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-500"
    />
  );
}