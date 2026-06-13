import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const GROUPS: { name: string; items: { keys: string[]; label: string }[] }[] = [
  {
    name: "Navigation",
    items: [
      { keys: ["⌘", "K"], label: "Open command palette" },
      { keys: ["⌘", "B"], label: "Toggle sidebar" },
      { keys: ["G", "D"], label: "Go to dashboard" },
      { keys: ["G", "P"], label: "Go to projects" },
      { keys: ["G", "S"], label: "Go to settings" },
    ],
  },
  {
    name: "View",
    items: [
      { keys: ["F"], label: "Toggle focus mode" },
      { keys: ["⌘", "/"], label: "Search settings" },
      { keys: ["?"], label: "Show this cheatsheet" },
    ],
  },
  {
    name: "Actions",
    items: [
      { keys: ["⌘", "."], label: "Open AI assistant" },
      { keys: ["⌘", "S"], label: "Save sheet" },
      { keys: ["Esc"], label: "Close any panel" },
    ],
  },
];

export function ShortcutsDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (t?.isContentEditable) return;
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl glass border-white/10">
        <DialogHeader>
          <DialogTitle className="serif-display text-3xl font-normal">
            Keyboard shortcuts
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Press <Kbd>?</Kbd> anywhere to summon this list.
          </p>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
          {GROUPS.map((g) => (
            <div key={g.name}>
              <div className="eyebrow mb-3">{g.name}</div>
              <ul className="space-y-2.5">
                {g.items.map((i) => (
                  <li key={i.label} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-foreground/80">{i.label}</span>
                    <span className="flex items-center gap-1">
                      {i.keys.map((k) => (
                        <Kbd key={k}>{k}</Kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex min-w-[20px] justify-center items-center rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-foreground/90 shadow-[0_1px_0_rgb(255_255_255/0.06)_inset]">
      {children}
    </kbd>
  );
}