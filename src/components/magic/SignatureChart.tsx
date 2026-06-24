import { useMemo, useState } from "react";
import { motion } from "motion/react";

type Series = { name: string; color: string; data: number[] };

export function SignatureChart({
  labels,
  series,
  height = 240,
}: {
  labels: string[];
  series: Series[];
  height?: number;
}) {
  const W = 800;
  const H = 200;
  const PAD = 8;
  const [hover, setHover] = useState<number | null>(null);

  // stack
  const stacked = useMemo(() => {
    const n = labels.length;
    const totals = Array(n).fill(0);
    const layers = series.map((s) => {
      const lower = totals.slice();
      for (let i = 0; i < n; i++) totals[i] += s.data[i] ?? 0;
      const upper = totals.slice();
      return { ...s, lower, upper };
    });
    const max = Math.max(...totals, 1);
    return { layers, max, totals };
  }, [series, labels]);

  const x = (i: number) => PAD + (i / (labels.length - 1)) * (W - PAD * 2);
  const y = (v: number) => H - PAD - (v / stacked.max) * (H - PAD * 2);

  const areaPath = (lower: number[], upper: number[]) => {
    let d = "";
    upper.forEach((v, i) => { d += `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)} `; });
    for (let i = lower.length - 1; i >= 0; i--) {
      d += `L${x(i).toFixed(1)},${y(lower[i]).toFixed(1)} `;
    }
    return d + "Z";
  };

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - PAD) / (W - PAD * 2)) * (labels.length - 1));
    setHover(Math.max(0, Math.min(labels.length - 1, i)));
  }

  return (
    <div className="relative" style={{ height }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          {stacked.layers.map((l, idx) => (
            <linearGradient key={idx} id={`sig-grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={l.color} stopOpacity={0.55} />
              <stop offset="100%" stopColor={l.color} stopOpacity={0.05} />
            </linearGradient>
          ))}
        </defs>

        {/* horizontal gridlines */}
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={PAD}
            x2={W - PAD}
            y1={H * t}
            y2={H * t}
            stroke="white"
            strokeOpacity={0.08}
            strokeDasharray="2 4"
          />
        ))}
        {/* y-axis tick labels */}
        {[0.25, 0.5, 0.75].map((t) => (
          <text
            key={`tl-${t}`}
            x={W - PAD + 2}
            y={H * t - 2}
            fill="white"
            fillOpacity={0.25}
            fontSize={8}
            fontFamily="monospace"
            textAnchor="end"
          >
            {Math.round(stacked.max * (1 - t)).toLocaleString()}
          </text>
        ))}

        {/* stacked areas */}
        {stacked.layers.map((l, idx) => (
          <g key={l.name}>
            <motion.path
              d={areaPath(l.lower, l.upper)}
              fill={`url(#sig-grad-${idx})`}
              stroke="none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.4 + idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
            />
            <path
              d={l.upper.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ")}
              fill="none"
              stroke={l.color}
              strokeWidth={1.6}
              strokeLinejoin="round"
              strokeLinecap="round"
              className="line-draw"
              style={{ ["--draw-len" as string]: "2000", animationDelay: `${0.5 + idx * 0.18}s` }}
            />
          </g>
        ))}

        {/* crosshair */}
        {hover !== null && (
          <>
            <line x1={x(hover)} x2={x(hover)} y1={0} y2={H} stroke="oklch(0.82 0.16 205)" strokeOpacity={0.5} strokeDasharray="2 3" />
            {stacked.layers.map((l, idx) => (
              <circle
                key={idx}
                cx={x(hover)}
                cy={y(l.upper[hover])}
                r={3.5}
                fill={l.color}
                stroke="oklch(0.10 0.02 240)"
                strokeWidth={1.5}
              />
            ))}
          </>
        )}
      </svg>

      {/* tooltip */}
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-2 px-3 py-2 rounded-xl bg-card/80 backdrop-blur-xl border border-white/10 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.6)] text-[11px] z-10"
          style={{ left: `min(calc(${(hover / (labels.length - 1)) * 100}% + 12px), calc(100% - 180px))` }}
        >
          <div className="font-mono text-muted-foreground/70 mb-1.5 tracking-wider uppercase text-[10px]">{labels[hover]}</div>
          {stacked.layers.map((l) => (
            <div key={l.name} className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-2 text-foreground">
                <span className="size-2 rounded-full" style={{ background: l.color }} />
                {l.name}
              </span>
              <span className="font-mono tabular-nums text-foreground/90">{l.data[hover].toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t border-white/10 mt-1.5 pt-1.5 flex items-center justify-between gap-4">
            <span className="text-muted-foreground/70 text-[10px] uppercase tracking-wider">Total</span>
            <span className="font-mono tabular-nums text-primary font-semibold">{stacked.totals[hover].toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* x-axis */}
      <div className="flex justify-between mt-3 text-[10px] font-bold text-white/20 uppercase tracking-widest">
        {labels.filter((_, i) => i % Math.ceil(labels.length / 6) === 0).map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      {/* legend */}
      <div className="absolute top-0 right-0 flex gap-3 text-[11px] text-muted-foreground">
        {series.map((s) => (
          <span key={s.name} className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}