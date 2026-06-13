import { useEffect, useRef } from "react";
import { animate, useInView, useMotionValue, useTransform, motion } from "motion/react";

export function NumberTicker({
  value,
  decimals = 0,
  suffix = "",
}: {
  value: number;
  decimals?: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => v.toFixed(decimals) + suffix);

  useEffect(() => {
    if (inView) {
      animate(mv, value, { duration: 1.4, ease: [0.16, 1, 0.3, 1] });
    }
  }, [inView, value, mv]);

  return <motion.span ref={ref}>{display}</motion.span>;
}