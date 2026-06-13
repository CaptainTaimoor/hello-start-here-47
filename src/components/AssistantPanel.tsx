import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LOADING_COPY } from "@/lib/copy";

/**
 * Signature moment: ⌘. opens a glass slide-over with an AI assistant.
 * Mocked replies for now — wires up later to Lovable AI Gateway.
 */
export function AssistantPanel() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "I'm Aurora — your workspace co-pilot. Ask me anything about your projects, sheets or team." },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "." && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMsgs((m) => [...m, { role: "user", text }]);
    setInput("");
    setPending(true);
    const loading = LOADING_COPY[Math.floor(Math.random() * LOADING_COPY.length)];
    setMsgs((m) => [...m, { role: "ai", text: loading }]);
    setTimeout(() => {
      setMsgs((m) => [
        ...m.slice(0, -1),
        { role: "ai", text: `Here's a thought on "${text}" — let's wire this to the AI gateway next.` },
      ]);
      setPending(false);
    }, 900);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md glass border-white/10 p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="grid place-items-center size-8 rounded-xl bg-primary/15 text-primary">
              <Sparkles className="size-4" />
            </span>
            <div>
              <SheetTitle className="serif-display text-2xl font-normal">Aurora</SheetTitle>
              <p className="text-[11px] text-muted-foreground">Your workspace assistant · ⌘.</p>
            </div>
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {msgs.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "ml-auto bg-primary/15 text-foreground border border-primary/20"
                  : "bg-white/[0.04] border border-white/[0.06] text-foreground/90"
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 focus-within:border-primary/40">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
              placeholder="Ask Aurora anything…"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground/70"
            />
            <Button size="icon" variant="ghost" onClick={send} disabled={pending} aria-label="Send">
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}