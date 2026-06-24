import { useEffect, useState } from "react";
import { Activity, TrendingUp, Users, Zap, Radio, Eye, CheckCircle2, AlertCircle } from "lucide-react";

type Item = { icon: React.ComponentType<{ className?: string }>; label: string; value: string; tone: string };

const SEED: Item[] = [
  { icon: Radio,        label: "Live streams",   value: "6 on-air",       tone: "text-rose-400" },
  { icon: Eye,          label: "Watching now",   value: "12,480",         tone: "text-sky-400" },
  { icon: TrendingUp,   label: "Views · 24h",    value: "1.42M  ▲ 8.3%",  tone: "text-emerald-400" },
  { icon: Users,        label: "Team online",    value: "23 / 41",        tone: "text-violet-400" },
  { icon: CheckCircle2, label: "Tasks shipped",  value: "47 today",       tone: "text-emerald-400" },
  { icon: Zap,          label: "Avg render",     value: "1.8s",           tone: "text-amber-400" },
  { icon: AlertCircle,  label: "Open incidents", value: "0",              tone: "text-emerald-400" },
  { icon: Activity,     label: "API health",     value: "200 OK",         tone: "text-emerald-400" },
];

function jitter(v: string) {
  // tiny number jitter on numeric leading values for "live" feel
  return v.replace(/^([\d,]+)/, (m) => {
    const n = Number(m.replace(/,/g, ""));
    if (!Number.isFinite(n)) return m;
    const d = Math.round((Math.random() - 0.5) * Math.max(2, n * 0.002));
    return (n + d).toLocaleString();
  });
}

export function LiveTicker() {
  const [items, setItems] = useState(SEED);
  useEffect(() => {
    const id = setInterval(() => {
      setItems((prev) => prev.map((it) => ({ ...it, value: jitter(it.value) })));
    }, 2200);
    return () => clearInterval(id);
  }, []);

  // Duplicate list so the marquee loops seamlessly
  const loop = [...items, ...items];

  return (
    <div
      aria-label="Live activity ticker"
      className="relative overflow-hidden border-y border-white/[0.05] bg-background/40 backdrop-blur-xl"
      style={{
        maskImage:
          "linear-gradient(90deg, transparent 0, black 6%, black 94%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent 0, black 6%, black 94%, transparent 100%)",
      }}
    >
      <div className="flex items-center gap-2 px-6 py-1.5">
        <span className="inline-flex items-center gap-1.5 shrink-0 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase text-rose-400 ring-1 ring-rose-500/30">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-rose-400" />
          </span>
          Live
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div className="flex w-max items-center gap-8 ticker-track">
            {loop.map((it, i) => {
              const Icon = it.icon;
              return (
                <div key={i} className="flex items-center gap-2 text-xs whitespace-nowrap">
                  <Icon className={`size-3.5 ${it.tone}`} />
                  <span className="text-muted-foreground">{it.label}</span>
                  <span className="font-medium text-foreground/90 tabular-nums">{it.value}</span>
                  <span className="text-border">·</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}