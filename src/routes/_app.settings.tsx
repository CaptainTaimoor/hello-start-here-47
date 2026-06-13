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

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — Orvion Media" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, theme, toggleTheme } = useApp();
  return (
    <div>
      <PageHeader title="Settings" description="Profile, workspace, theme and integrations." />
      <Tabs defaultValue="profile">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="notif">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
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
            <CardContent className="flex items-center justify-between max-w-md">
              <div>
                <div className="text-sm font-medium">Dark mode</div>
                <div className="text-xs text-muted-foreground">Current: {theme}</div>
              </div>
              <Switch checked={theme === "dark"} onCheckedChange={toggleTheme}/>
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