import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { SheetTable } from "@/components/common/SheetTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SHEET_DEFS } from "@/lib/sheet-defs";
import { useApp } from "@/lib/app-store";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/team/news")({
  head: () => ({ meta: [{ title: "News Workspace — Team" }] }),
  component: NewsTeamPage,
});

function NewsTeamPage() {
  const { user, channels } = useApp();

  return (
    <div>
      <PageHeader
        title="News — Manager workspace"
        description={`You are working as ${user?.role}. Edits here update the same sheets shown inside the project.`}
        actions={<Badge variant="outline">Manager: Rahul Sharma</Badge>}
      />

      <Tabs defaultValue="current">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="current">Current Affairs</TabsTrigger>
          <TabsTrigger value="entertainment">Entertainment</TabsTrigger>
          <TabsTrigger value="sports">Sports News</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Assigned channels</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                {channels.map((c) => (
                  <div key={c.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.team.length} members</div>
                    </div>
                    <StatusBadge value={c.kpiStatus}/>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Team members</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                {["Aisha K.","Ben L.","Carla R.","David S.","Emma W."].map((m) => (
                  <div key={m} className="flex items-center gap-3">
                    <Avatar className="size-7"><AvatarFallback className="text-[10px]">{m.split(" ").map(x=>x[0]).join("")}</AvatarFallback></Avatar>
                    <div className="flex-1">{m}</div>
                    <Badge variant="outline" className="text-[10px]">Available</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Workload & deadlines</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between"><span>Today's tasks</span><b>12</b></div>
                <div className="flex justify-between"><span>Overdue</span><b className="text-red-600">1</b></div>
                <div className="flex justify-between"><span>Due tomorrow</span><b>4</b></div>
                <div className="flex justify-between"><span>Recent sheet edits</span><b>9</b></div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Task board</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { col: "To Do", items: ["Script: Markets close", "Thumbnail: Weather alert"] },
                  { col: "In Progress", items: ["Edit: G20 cut", "Voiceover: Tech roundup"] },
                  { col: "Review", items: ["Daily wrap — June 12"] },
                  { col: "Done", items: ["Op-Ed: Inflation", "Election explainer"] },
                ].map((c) => (
                  <div key={c.col}>
                    <div className="text-xs font-semibold text-muted-foreground mb-2">{c.col} · {c.items.length}</div>
                    <div className="space-y-2">
                      {c.items.map((t) => (
                        <div key={t} className="rounded-md border bg-card p-3 text-sm">
                          <div className="font-medium">{t}</div>
                          <div className="mt-1 text-xs text-muted-foreground">News · Current Affairs · YouTube</div>
                          <div className="mt-2 flex items-center justify-between text-[11px]">
                            <Badge variant="outline" className="text-[10px]">High</Badge>
                            <span className="text-muted-foreground">Due tomorrow</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue={SHEET_DEFS[0].key}>
            <TabsList className="flex flex-wrap h-auto">
              {SHEET_DEFS.map((s) => (
                <TabsTrigger key={s.key} value={s.key}>{s.name}</TabsTrigger>
              ))}
            </TabsList>
            {SHEET_DEFS.map((s) => (
              <TabsContent key={s.key} value={s.key} className="mt-4">
                <SheetTable sheetKey={s.key}/>
              </TabsContent>
            ))}
          </Tabs>

          <Card>
            <CardHeader><CardTitle className="text-base">Sheet update history</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              {[
                "Aisha K. updated Daily Content (3 rows) — 5m",
                "Ben L. updated Edit Plans status — 30m",
                "Carla R. updated KPI notes — 1h",
              ].map((l) => <div key={l}>{l}</div>)}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => toast.success("All changes synced to project")}>Sync to project</Button>
          </div>
        </TabsContent>

        <TabsContent value="entertainment" className="mt-4">
          <Card><CardContent className="p-12 text-center text-sm text-muted-foreground">Entertainment workspace coming soon.</CardContent></Card>
        </TabsContent>
        <TabsContent value="sports" className="mt-4">
          <Card><CardContent className="p-12 text-center text-sm text-muted-foreground">Sports News workspace coming soon.</CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}