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
        "hidden lg:flex flex-col border-r border-border bg-sidebar transition-all duration-200",
        sidebarOpen ? "w-64" : "w-16",
      )}
    >
      <div className="flex items-center gap-2 h-16 px-4 border-b border-sidebar-border">
        {sidebarOpen ? (
          <img src={orvionLogo} alt="Orvion Media" className="h-7 w-auto" />
        ) : (
          <div className="size-9 rounded-lg bg-primary/15 grid place-items-center text-primary font-bold">
            O
          </div>
        )}
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {ITEMS.map((it) => {
          const Icon = it.icon;
          const active = pathname === it.to || pathname.startsWith(it.to + "/");
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {sidebarOpen && <span className="truncate flex-1">{it.label}</span>}
              {sidebarOpen && it.to === "/notifications" && unread > 0 && (
                <span className="ml-auto rounded-full bg-primary text-primary-foreground text-[10px] px-2 py-0.5">
                  {unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      {sidebarOpen && (
        <div className="p-3 m-3 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-border">
          <div className="text-xs font-semibold">Active Project</div>
          <div className="text-sm font-bold mt-0.5">News</div>
          <div className="text-[11px] text-muted-foreground mt-1">Current Affairs · YouTube</div>
        </div>
      )}
    </aside>
  );
}