import { useEffect, useRef, useState } from "react";

/**
 * Premium custom cursor: a 6px dot + 28px ring that lags behind.
 * Tints to accent when hovering interactive elements.
 * Disabled on touch / coarse pointer devices.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      }
      const t = e.target as HTMLElement | null;
      const isInteractive = !!t?.closest(
        'a, button, [role="button"], input, textarea, select, [data-interactive], label, summary, [contenteditable="true"]',
      );
      setHovering(isInteractive);
    };

    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] -ml-[3px] -mt-[3px] size-1.5 rounded-full bg-primary transition-[background-color,opacity] duration-200"
        style={{ willChange: "transform" }}
      />
      <div
        ref={ringRef}
        aria-hidden
        className={`pointer-events-none fixed left-0 top-0 z-[9998] -ml-[14px] -mt-[14px] size-7 rounded-full border transition-[width,height,margin,border-color,background-color] duration-200 ease-out ${
          hovering
            ? "size-12 -ml-[24px] -mt-[24px] border-primary/80 bg-primary/[0.06] backdrop-blur-[2px]"
            : "border-white/40"
        }`}
        style={{ willChange: "transform" }}
      />
    </>
  );
}