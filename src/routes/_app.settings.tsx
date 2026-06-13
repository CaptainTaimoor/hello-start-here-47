import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-store";
import { toast } from "sonner";
import { useEffect, useMemo, useRef, useState } from "react";
import { isSoundEnabled, setSoundEnabled, click } from "@/lib/sound";
import { User, Building, Palette, Bell, Lock, Plug, Briefcase, Search, Sparkles } from "lucide-react";

const TABS = [
  { value: "profile", label: "Profile", icon: User, hint: "name email role avatar" },
  { value: "workspace", label: "Workspace", icon: Building, hint: "team workspace default project" },
  { value: "theme", label: "Theme", icon: Palette, hint: "dark light sound color appearance" },
  { value: "notif", label: "Notifications", icon: Bell, hint: "alerts kpi email push" },
  { value: "security", label: "Security", icon: Lock, hint: "sso mfa password session" },
  { value: "integrations", label: "Integrations", icon: Plug, hint: "google youtube api rdp database" },
  { value: "company", label: "Company", icon: Briefcase, hint: "billing company legal" },
] as const;

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — Orvion Media" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, theme, toggleTheme } = useApp();
  const [sound, setSound] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setSound(isSoundEnabled()); }, []);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.key === "/" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const visibleTabs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TABS;
    return TABS.filter((t) => t.label.toLowerCase().includes(q) || t.hint.includes(q));
  }, [query]);

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" description="Profile, workspace, theme and integrations." />

      {/* What's new */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-card/40 backdrop-blur-xl p-5 flex items-start gap-4">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -left-16 size-56 rounded-full blur-3xl opacity-50"
          style={{ background: "radial-gradient(circle, oklch(0.78 0.17 205 / 0.45), oklch(0.55 0.22 285 / 0.25) 60%, transparent 75%)" }}
        />
        <div className="relative grid place-items-center size-10 rounded-2xl bg-primary/15 text-primary ring-1 ring-inset ring-primary/20">
          <Sparkles className="size-5" />
        </div>
        <div className="relative flex-1">
          <div className="eyebrow mb-1">What's new · v2.4</div>
          <div className="serif-display text-xl">Focus mode, Aurora assistant, and a brand new cursor.</div>
          <p className="text-sm text-muted-foreground mt-1.5">
            Press <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-white/10 bg-white/[0.04]">F</kbd> for focus, <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-white/10 bg-white/[0.04]">⌘.</kbd> for Aurora, and <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-white/10 bg-white/[0.04]">?</kbd> for all shortcuts.
          </p>
        </div>
      </div>

      {/* Settings search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          ref={searchRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search settings…"
          className="pl-9 h-10 bg-muted/30 border-border/50 rounded-xl"
        />
        <kbd className="hidden md:inline-flex absolute right-2 top-1/2 -translate-y-1/2 items-center gap-1 rounded-md border border-border/60 bg-background/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          ⌘/
        </kbd>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0">
          {visibleTabs.map((t) => {
            const Icon = t.icon;
            return (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="gap-2 rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                <span className="grid place-items-center size-5 rounded-md bg-gradient-to-br from-primary/30 to-purple-500/20 text-primary">
                  <Icon className="size-3" strokeWidth={2} />
                </span>
                {t.label}
              </TabsTrigger>
            );
          })}
          {visibleTabs.length === 0 && (
            <span className="text-xs text-muted-foreground px-2 py-1">No settings match "{query}".</span>
          )}
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Name</Label><Input defaultValue={user?.name}/></div>
              <div className="space-y-1.5"><Label>Email</Label><Input defaultValue={user?.email}/></div>
              <div className="space-y-1.5"><Label>Role</Label><Input defaultValue={user?.role} disabled/></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workspace" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Workspace</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Workspace name</Label><Input defaultValue="Orvion Media"/></div>
              <div className="space-y-1.5"><Label>Default project</Label><Input defaultValue="News"/></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Theme</CardTitle></CardHeader>
            <CardContent className="space-y-6 max-w-md">
              <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Dark mode</div>
                <div className="text-xs text-muted-foreground">Current: {theme}</div>
              </div>
              <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                <div>
                  <div className="text-sm font-medium">Soft UI sounds</div>
                  <div className="text-xs text-muted-foreground">Subtle click on ⌘K and route changes.</div>
                </div>
                <Switch
                  checked={sound}
                  onCheckedChange={(v) => {
                    setSoundEnabled(v);
                    setSound(v);
                    if (v) click("soft");
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notif" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Notification preferences</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm max-w-lg">
              {["Sheet updates","Task assignments","KPI alerts","Approvals","RDP & API issues"].map((p) => (
                <div key={p} className="flex justify-between items-center rounded-md border p-3">
                  <span>{p}</span>
                  <Switch defaultChecked/>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Security</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">SSO, MFA and session security (placeholder).</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Integrations</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {["Google Sheets","YouTube API","Editing backend","Apache Guacamole RDP","Database service"].map((i) => (
                <div key={i} className="flex items-center justify-between rounded-md border p-3">
                  <span>{i}</span>
                  <Button size="sm" variant="outline" onClick={() => toast("Connect (mock)")}>Connect</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Company</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Company</Label><Input defaultValue="Orvion Media"/></div>
              <div className="space-y-1.5"><Label>Billing email</Label><Input defaultValue="billing@orvion.media"/></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}