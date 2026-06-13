import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useApp } from "@/lib/app-store";
import { click } from "@/lib/sound";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Building2,
  Shield,
  Bell,
  Settings,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/team", label: "Team Workspace", icon: Users },
  { to: "/departments", label: "Departments", icon: Building2 },
  { to: "/admin", label: "Admin Panel", icon: Shield },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { toggleTheme, theme, logout } = useApp();

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => {
          click("soft");
          return !o;
        });
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  function go(to: string) {
    setOpen(false);
    navigate({ to });
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, actions, settings…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {NAV.map((n) => {
            const Icon = n.icon;
            return (
              <CommandItem key={n.to} onSelect={() => go(n.to)}>
                <Icon className="mr-2 size-4" />
                {n.label}
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => { toggleTheme(); setOpen(false); }}>
            {theme === "dark" ? <Sun className="mr-2 size-4" /> : <Moon className="mr-2 size-4" />}
            Toggle theme
          </CommandItem>
          <CommandItem onSelect={() => { logout(); setOpen(false); }}>
            <LogOut className="mr-2 size-4" />
            Sign out
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}