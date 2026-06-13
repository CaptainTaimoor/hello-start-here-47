import { useEffect, type ReactNode } from "react";
import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { useApp } from "@/lib/app-store";
import { Toaster } from "@/components/ui/sonner";

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
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <AppSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <AppHeader />
        <main className="flex-1 min-w-0 p-6 lg:p-8">
          {children ?? <Outlet />}
        </main>
      </div>
      <Toaster />
    </div>
  );
}