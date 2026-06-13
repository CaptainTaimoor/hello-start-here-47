import { useEffect, type ReactNode } from "react";
import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { useApp } from "@/lib/app-store";
import { Toaster } from "@/components/ui/sonner";
import { motion, AnimatePresence } from "motion/react";
import { AuroraBackground } from "@/components/magic/AuroraBackground";
import { CommandPalette } from "@/components/CommandPalette";

export function AppShell({ children }: { children?: ReactNode }) {
  const { user } = useApp();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!user && pathname !== "/login" && pathname !== "/forgot-password") {
      navigate({ to: "/login" });
    }
  }, [user, pathname, navigate]);

  if (!user) return null;

  return (
    <div className="flex min-h-screen w-full text-foreground">
      <AuroraBackground />
      <CommandPalette />
      <AppSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <AppHeader />
        <main className="relative flex-1 min-w-0 p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
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