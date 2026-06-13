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

export function AppShell({ children }: { children?: ReactNode }) {
  const { user } = useApp();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!user && pathname !== "/login" && pathname !== "/forgot-password") {
      navigate({ to: "/login" });
    }
  }, [user, pathname, navigate]);

  // Soft sound on route change
  useEffect(() => { click("tick"); }, [pathname]);

  if (!user) return null;

  return (
    <div className="flex min-h-screen w-full text-foreground relative">
      <CursorSpotlight />
      <CommandPalette />
      <AppSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <AppHeader />
        <main className="relative flex-1 min-w-0 p-6 lg:p-8 z-[1]">
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
              className="route-stagger"
            >
              {children ?? <Outlet />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <Toaster />
    </div>
  );
}