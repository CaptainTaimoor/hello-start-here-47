import { useEffect, type ReactNode } from "react";
import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { useApp } from "@/lib/app-store";
import { Toaster } from "@/components/ui/sonner";
import { motion, AnimatePresence } from "motion/react";
import { CommandPalette } from "@/components/CommandPalette";
import { CursorSpotlight } from "@/components/magic/CursorSpotlight";
import { click } from "@/lib/sound";
import { useState } from "react";
import { ShortcutsDialog } from "@/components/ShortcutsDialog";
import { AssistantPanel } from "@/components/AssistantPanel";
import { X } from "lucide-react";

export function AppShell({ children }: { children?: ReactNode }) {
  const { ready, user } = useApp();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    if (ready && !user && pathname !== "/login" && pathname !== "/forgot-password") {
      navigate({ to: "/login" });
    }
  }, [ready, user, pathname, navigate]);

  // Soft sound on route change
  useEffect(() => { click("tick"); }, [pathname]);

  // F toggles focus mode
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (t?.isContentEditable) return;
      if (e.key === "f" || e.key === "F") {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        e.preventDefault();
        setFocusMode((v) => !v);
      }
      if (e.key === "Escape" && focusMode) setFocusMode(false);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [focusMode]);

  if (!ready || !user) return null;

  return (
    <div className={`flex min-h-screen w-screen max-w-full overflow-x-hidden text-foreground relative ${focusMode ? "focus-mode" : ""}`}>
      <CursorSpotlight />
      <CommandPalette />
      <ShortcutsDialog />
      <AssistantPanel />
      <AppSidebar />
      <div className="flex flex-1 basis-full flex-col min-w-0 max-w-full">
        <AppHeader />
        <main className="relative flex-1 min-w-0 p-4 sm:p-6 z-[1]">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial="hidden"
              animate="show"
              exit="exit"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
                exit: { opacity: 0, y: -8, transition: { duration: 0.25 } },
              }}
              className="route-stagger w-full max-w-full"
            >
              {children ?? <Outlet />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      {focusMode && (
        <button
          onClick={() => setFocusMode(false)}
          className="fixed top-5 right-5 z-[100] inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs font-medium text-foreground/90 hover:text-foreground transition-colors"
        >
          <X className="size-3.5" />
          Exit focus  ·  <kbd className="text-[10px] opacity-70">Esc</kbd>
        </button>
      )}
      <Toaster />
    </div>
  );
}