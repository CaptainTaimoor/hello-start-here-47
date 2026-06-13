import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Meteors({ number = 20, className }: { number?: number; className?: string }) {
  const [meteors, setMeteors] = useState<{ left: string; delay: string; duration: string }[]>([]);

  useEffect(() => {
    setMeteors(
      Array.from({ length: number }).map(() => ({
        left: Math.floor(Math.random() * 100) + "%",
        delay: (Math.random() * 5).toFixed(2) + "s",
        duration: (Math.random() * 8 + 4).toFixed(2) + "s",
      })),
    );
  }, [number]);

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {meteors.map((m, i) => (
        <span
          key={i}
          style={{
            top: "-10%",
            left: m.left,
            animationDelay: m.delay,
            animationDuration: m.duration,
          }}
          className="absolute h-0.5 w-0.5 rounded-full bg-white shadow-[0_0_0_1px_#ffffff10] animate-[meteor_5s_linear_infinite] before:absolute before:top-1/2 before:h-px before:w-[60px] before:-translate-y-1/2 before:bg-gradient-to-r before:from-white/80 before:to-transparent before:content-['']"
        />
      ))}
    </div>
  );
}