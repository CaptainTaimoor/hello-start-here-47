/**
 * Tiny soft "click" sound via WebAudio. No assets.
 * Persisted on/off in localStorage, default OFF.
 */
const KEY = "orvion.sound";
let ctx: AudioContext | null = null;

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "1";
}

export function setSoundEnabled(v: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, v ? "1" : "0");
}

export function click(kind: "soft" | "tick" = "soft") {
  if (!isSoundEnabled()) return;
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(kind === "soft" ? 880 : 1320, t);
    osc.frequency.exponentialRampToValueAtTime(kind === "soft" ? 440 : 660, t + 0.08);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.06, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.13);
  } catch {
    /* noop */
  }
}