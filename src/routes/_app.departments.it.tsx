import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/common/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Activity, Server, HardDrive, Database, Bug, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StatusBadge } from "@/components/common/StatusBadge";
import { MOCK_TICKETS } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/departments/it")({
  head: () => ({ meta: [{ title: "IT — Orvion Media" }] }),
  component: ITPage,
});

function ITPage() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<typeof MOCK_TICKETS[number] | null>(null);

  return (
    <div>
      <PageHeader title="IT" description="System health, updates, tickets and database." />
      <Tabs defaultValue="overview">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">App Settings</TabsTrigger>
          <TabsTrigger value="updates">New Updates</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="db">Database</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="App health" value="Healthy" icon={Activity}/>
            <StatCard label="Server status" value="Online" icon={Server}/>
            <StatCard label="Open tickets" value={MOCK_TICKETS.filter(t=>t.status!=="Closed").length} icon={Bug}/>
            <StatCard label="DB status" value="OK" icon={Database}/>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Recent updates</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between"><span>v1.4.0 — Sheet inline edits, RDP mock</span><Badge variant="outline">Today</Badge></div>
              <div className="flex justify-between"><span>v1.3.2 — Analytics chart polish</span><Badge variant="outline">2d ago</Badge></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">General</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Workspace name</Label><Input defaultValue="Orvion Media"/></div>
              <div className="space-y-1.5"><Label>Timezone</Label><Input defaultValue="Asia/Kolkata"/></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">User permissions</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {["Project access","Channel access","Sheet permissions","API access","Backups","System preferences"].map((p) => (
                <div key={p} className="flex items-center justify-between rounded-md border p-3">
                  <span>{p}</span>
                  <Switch defaultChecked/>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="updates" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Release notes</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                { v: "v1.4.0", n: "Sheet inline edits, RDP mock, talents", st: "Released" },
                { v: "v1.5.0", n: "YouTube API connector, real analytics", st: "Upcoming" },
                { v: "v1.4.1", n: "Bug fix — sidebar collapse on tablet", st: "Released" },
              ].map((r) => (
                <div key={r.v} className="rounded-md border p-3 flex items-center justify-between">
                  <div><b>{r.v}</b> · {r.n}</div>
                  <StatusBadge value={r.st === "Released" ? "Done" : "Pending"}/>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setOpen(true)}><Plus className="size-4 mr-2"/> Create ticket</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead><tr className="text-xs text-muted-foreground text-left border-b"><th className="py-2 px-4">Title</th><th>Priority</th><th>Status</th><th>Assignee</th><th>Created</th></tr></thead>
                <tbody>
                  {MOCK_TICKETS.map((t) => (
                    <tr key={t.id} className="border-b last:border-0 hover:bg-accent/40 cursor-pointer" onClick={() => setActive(t)}>
                      <td className="py-2 px-4 font-medium">{t.title}</td>
                      <td><StatusBadge value={t.priority}/></td>
                      <td><StatusBadge value={t.status}/></td>
                      <td>{t.assignee}</td>
                      <td>{t.created}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="db" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Users table" value="48 rows" icon={Database}/>
            <StatCard label="Projects table" value="1 row" icon={Database}/>
            <StatCard label="Channels table" value="2 rows" icon={Database}/>
            <StatCard label="Sheets table" value="5 rows" icon={Database}/>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><HardDrive className="size-4"/> Storage & health</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Storage used</span><b>184 GB / 500 GB</b></div>
              <div className="flex justify-between"><span>Health</span><Badge variant="outline">OK</Badge></div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toast.success("Backup started (mock)")}>Backup</Button>
                <Button size="sm" variant="outline" onClick={() => toast("Restore (mock)")}>Restore</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create ticket</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Title</Label><Input/></div>
            <div className="space-y-1.5"><Label>Description</Label><Input/></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
            <Button onClick={()=>{ setOpen(false); toast.success("Ticket created (mock)"); }}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={!!active} onOpenChange={(o)=>!o && setActive(null)}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader><SheetTitle>{active?.title}</SheetTitle></SheetHeader>
          {active && (
            <div className="mt-4 space-y-2 text-sm px-1">
              <div><b>Priority:</b> {active.priority}</div>
              <div><b>Status:</b> {active.status}</div>
              <div><b>Assignee:</b> {active.assignee}</div>
              <div><b>Created:</b> {active.created}</div>
              <div className="pt-2 border-t">
                <div className="text-xs font-semibold mb-1">Comments</div>
                <div className="text-xs text-muted-foreground">No comments yet (mock).</div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}