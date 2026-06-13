import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Users, Activity, Cable } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useApp } from "@/lib/app-store";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/projects/news/current-affairs/youtube")({
  head: () => ({ meta: [{ title: "YouTube — Current Affairs" }] }),
  component: YouTubeLayout,
});

function YouTubeLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/projects/news/current-affairs/youtube") return <Outlet />;
  return <YouTubeIndex />;
}

function YouTubeIndex() {
  const { channels, addChannel } = useApp();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  return (
    <div>
      <PageHeader
        title="YouTube workspace"
        description="Channels under Current Affairs — manage analytics, content, editing and creatives."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4 mr-2" /> Add channel
          </Button>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {channels.map((c) => (
          <Link key={c.id} to="/projects/news/current-affairs/youtube/$channelId" params={{ channelId: c.id }}>
            <Card className="hover:border-primary/60 transition-colors h-full">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-bold">{c.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{c.platform}</div>
                  </div>
                  <StatusBadge value={c.status} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-muted-foreground">Manager</div>
                    <div className="font-medium">{c.manager}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Mode</div>
                    <div className="font-medium">{c.mode} {c.apiConnected ? "· Connected" : ""}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Today</div>
                    <div className="font-medium">{c.todayCount} videos</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Pending sheets</div>
                    <div className="font-medium">{c.pendingSheets}</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground"><Users className="size-3.5"/>{c.team.length}</div>
                  <div className="flex items-center gap-1 text-muted-foreground"><Activity className="size-3.5"/>{c.kpiStatus}</div>
                  <div className="flex items-center gap-1 text-muted-foreground"><Cable className="size-3.5"/>{c.apiConnected ? "API" : "Manual"}</div>
                </div>
              </CardContent>
              <CardFooter className="text-[11px] text-muted-foreground border-t py-2">
                Last updated {c.lastUpdated}
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add YouTube channel</DialogTitle>
            <DialogDescription>Mock form — channel will be added locally.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Channel name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Orvion Tech" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!name) return;
                addChannel({
                  id: `c${Date.now()}`,
                  name,
                  platform: "YouTube",
                  status: "Active",
                  manager: "Unassigned",
                  team: [],
                  mode: "Manual",
                  apiConnected: false,
                  todayCount: 0,
                  pendingSheets: 0,
                  kpiStatus: "On Track",
                  lastUpdated: "just now",
                });
                setName("");
                setOpen(false);
                toast.success("Channel added");
              }}
            >
              Add channel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}