import { useEffect, useId, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function AnimatedGridPattern({
  width = 40,
  height = 40,
  numSquares = 50,
  className,
  maxOpacity = 0.4,
  duration = 4,
}: {
  width?: number;
  height?: number;
  numSquares?: number;
  className?: string;
  maxOpacity?: number;
  duration?: number;
}) {
  const id = useId();
  const containerRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [squares, setSquares] = useState<{ id: number; pos: [number, number] }[]>([]);

  function genPos(): [number, number] {
    return [
      Math.floor((Math.random() * dimensions.width) / width),
      Math.floor((Math.random() * dimensions.height) / height),
    ];
  }

  useEffect(() => {
    if (dimensions.width && dimensions.height) {
      setSquares(
        Array.from({ length: numSquares }, (_, i) => ({ id: i, pos: genPos() })),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensions, numSquares]);

  useEffect(() => {
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        setDimensions({ width: e.contentRect.width, height: e.contentRect.height });
      }
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-white/10 stroke-white/10",
        className,
      )}
    >
      <defs>
        <pattern id={id} width={width} height={height} patternUnits="userSpaceOnUse" x={-1} y={-1}>
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      <svg x={0} y={0} className="overflow-visible">
        {squares.map(({ pos: [x, y], id: sid }, idx) => (
          <motion.rect
            key={`${x}-${y}-${idx}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: maxOpacity }}
            transition={{
              duration,
              repeat: Infinity,
              repeatType: "reverse",
              delay: idx * 0.1,
            }}
            onAnimationComplete={() => {
              setSquares((cur) =>
                cur.map((sq) => (sq.id === sid ? { ...sq, pos: genPos() } : sq)),
              );
            }}
            width={width - 1}
            height={height - 1}
            x={x * width + 1}
            y={y * height + 1}
            fill="currentColor"
            strokeWidth="0"
          />
        ))}
      </svg>
    </svg>
  );
}