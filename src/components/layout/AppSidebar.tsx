import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Building2,
  Shield,
  Bell,
  Settings,
} from "lucide-react";
import orvionLogo from "@/assets/orvion-logo.png";
import { useApp } from "@/lib/app-store";
import { cn } from "@/lib/utils";

const ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/team", label: "Team Workspace", icon: Users },
  { to: "/departments", label: "Departments", icon: Building2 },
  { to: "/admin", label: "Admin Panel", icon: Shield },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppSidebar() {
  const { sidebarOpen, notifications } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r border-sidebar-border bg-sidebar/80 backdrop-blur-xl transition-all duration-300 sticky top-0 h-screen",
        sidebarOpen ? "w-64" : "w-16",
      )}
    >
      <div className="flex items-center gap-2 h-16 px-4 border-b border-sidebar-border/60">
        {sidebarOpen ? (
          <img src={orvionLogo} alt="Orvion Media" className="h-7 w-auto drop-shadow-[0_0_12px_oklch(0.78_0.17_205/0.4)]" />
        ) : (
          <div className="size-9 rounded-xl bg-primary/15 grid place-items-center text-primary font-bold shadow-[inset_0_1px_0_rgb(255_255_255/0.1)]">
            O
          </div>
        )}
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {ITEMS.map((it) => {
          const Icon = it.icon;
          const active = pathname === it.to || pathname.startsWith(it.to + "/");
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-gradient-to-r from-primary/15 to-primary/5 text-sidebar-accent-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.06)] ring-1 ring-inset ring-primary/15"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r bg-primary shadow-[0_0_8px_var(--primary)]" />
              )}
              <Icon className="size-4 shrink-0" />
              {sidebarOpen && <span className="truncate flex-1">{it.label}</span>}
              {sidebarOpen && it.to === "/notifications" && unread > 0 && (
                <span className="ml-auto rounded-full bg-primary text-primary-foreground text-[10px] px-2 py-0.5 font-semibold shadow-[0_0_12px_var(--primary)]">
                  {unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      {sidebarOpen && (
        <div className="m-3 rounded-xl p-4 relative overflow-hidden border border-sidebar-border/60 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(0.82_0.16_205/0.25),transparent_60%)]" />
          <div className="relative">
            <div className="text-[10px] uppercase tracking-[0.16em] text-primary/80 font-semibold">Active Project</div>
            <div className="text-base font-semibold mt-1 text-sidebar-foreground">News</div>
            <div className="text-[11px] text-sidebar-foreground/60 mt-0.5">Current Affairs · YouTube</div>
          </div>
        </div>
      )}
    </aside>
  );
}