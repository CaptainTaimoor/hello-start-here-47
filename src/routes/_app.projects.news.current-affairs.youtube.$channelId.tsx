import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BarChart3, FileSpreadsheet, Film, MonitorPlay, Image as ImageIcon,
  Users as UsersIcon, Settings as SettingsIcon, Plug, RefreshCw, Cpu,
  HardDrive, Wifi, Power, Play, UploadCloud,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { SheetTable } from "@/components/common/SheetTable";
import { useApp } from "@/lib/app-store";
import { SHEET_DEFS } from "@/lib/sheet-defs";
import { MOCK_ANALYTICS } from "@/lib/mock-data";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, CartesianGrid,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute(
  "/_app/projects/news/current-affairs/youtube/$channelId",
)({
  head: () => ({ meta: [{ title: "Channel — Orvion Media" }] }),
  component: ChannelPage,
});

function ChannelPage() {
  const { channelId } = Route.useParams();
  const { channels, updateChannel } = useApp();
  const channel = useMemo(() => channels.find((c) => c.id === channelId), [channels, channelId]);
  const navigate = useNavigate();

  if (!channel) {
    return (
      <div className="text-sm">
        Channel not found.{" "}
        <button className="underline" onClick={() => navigate({ to: "/projects/news/current-affairs/youtube" })}>
          Go back
        </button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={channel.name}
        description={`${channel.platform} · ${channel.mode} mode · Manager: ${channel.manager}`}
        actions={<StatusBadge value={channel.status} />}
      />
      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="analytics"><BarChart3 className="size-4 mr-1.5"/>Analytics</TabsTrigger>
          <TabsTrigger value="content"><FileSpreadsheet className="size-4 mr-1.5"/>Content Planning</TabsTrigger>
          <TabsTrigger value="editing"><Film className="size-4 mr-1.5"/>Editing Software</TabsTrigger>
          <TabsTrigger value="rdp"><MonitorPlay className="size-4 mr-1.5"/>RDP Connection</TabsTrigger>
          <TabsTrigger value="creatives"><ImageIcon className="size-4 mr-1.5"/>Creatives</TabsTrigger>
          <TabsTrigger value="talents"><UsersIcon className="size-4 mr-1.5"/>Talents</TabsTrigger>
          <TabsTrigger value="settings"><SettingsIcon className="size-4 mr-1.5"/>Channel Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="mt-4">
          <AnalyticsTab apiConnected={channel.apiConnected} onConnect={() => updateChannel(channel.id, { apiConnected: !channel.apiConnected, mode: !channel.apiConnected ? "API" : "Manual" })}/>
        </TabsContent>

        <TabsContent value="content" className="mt-4">
          <Tabs defaultValue={SHEET_DEFS[0].key}>
            <TabsList className="flex flex-wrap h-auto">
              {SHEET_DEFS.map((s) => (
                <TabsTrigger key={s.key} value={s.key}>{s.name}</TabsTrigger>
              ))}
            </TabsList>
            {SHEET_DEFS.map((s) => (
              <TabsContent key={s.key} value={s.key} className="mt-4">
                <SheetTable sheetKey={s.key} />
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        <TabsContent value="editing" className="mt-4">
          <EditingTab />
        </TabsContent>

        <TabsContent value="rdp" className="mt-4">
          <RdpTab />
        </TabsContent>

        <TabsContent value="creatives" className="mt-4">
          <CreativesTab />
        </TabsContent>

        <TabsContent value="talents" className="mt-4">
          <TalentsTab />
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <ChannelSettingsTab channelId={channel.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AnalyticsTab({ apiConnected, onConnect }: { apiConnected: boolean; onConnect: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <Badge variant="outline" className={apiConnected ? "border-emerald-500/40 text-emerald-600" : ""}>
          {apiConnected ? "API Connected" : "API Not Connected"}
        </Badge>
        <span className="text-xs text-muted-foreground">Last sync: 12 min ago</span>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={onConnect}>
            <Plug className="size-4 mr-2"/> {apiConnected ? "Disconnect" : "Connect YouTube API"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.success("Synced")}>
            <RefreshCw className="size-4 mr-2"/> Sync now
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { l: "Views (14d)", v: "184.2K", d: "+12%" },
          { l: "Subscribers (14d)", v: "+1.8K", d: "+4.1%" },
          { l: "Watch time", v: "12.4k hrs", d: "+7%" },
          { l: "Avg. CTR", v: "5.8%", d: "+0.6pp" },
        ].map((s) => (
          <Card key={s.l}>
            <CardContent className="p-5">
              <div className="text-xs text-muted-foreground">{s.l}</div>
              <div className="text-2xl font-bold mt-1">{s.v}</div>
              <div className="text-xs text-emerald-600 mt-1">{s.d}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Views</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer>
              <AreaChart data={MOCK_ANALYTICS.views}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                <XAxis dataKey="day" fontSize={11} stroke="var(--muted-foreground)"/>
                <YAxis fontSize={11} stroke="var(--muted-foreground)"/>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}/>
                <Area dataKey="value" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2}/>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Subscribers</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer>
              <LineChart data={MOCK_ANALYTICS.subs}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                <XAxis dataKey="day" fontSize={11} stroke="var(--muted-foreground)"/>
                <YAxis fontSize={11} stroke="var(--muted-foreground)"/>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}/>
                <Line dataKey="value" stroke="var(--primary)" strokeWidth={2} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Watch time</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer>
              <BarChart data={MOCK_ANALYTICS.watch}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                <XAxis dataKey="day" fontSize={11} stroke="var(--muted-foreground)"/>
                <YAxis fontSize={11} stroke="var(--muted-foreground)"/>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}/>
                <Bar dataKey="value" fill="var(--primary)" radius={3}/>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Likes vs Comments</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer>
              <BarChart data={MOCK_ANALYTICS.engagement}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                <XAxis dataKey="day" fontSize={11} stroke="var(--muted-foreground)"/>
                <YAxis fontSize={11} stroke="var(--muted-foreground)"/>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}/>
                <Bar dataKey="likes" fill="var(--primary)" radius={3}/>
                <Bar dataKey="comments" fill="var(--chart-2)" radius={3}/>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Manual analytics entry</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b">
                  <th className="py-2">Date</th><th>Views</th><th>Subs</th><th>Watch</th><th>Likes</th><th>Comments</th><th>CTR</th>
                </tr>
              </thead>
              <tbody>
                {[1,2,3,4].map((i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 text-xs">2026-06-{12-i}</td>
                    {Array.from({length: 6}).map((_, j) => (
                      <td key={j}><Input className="h-7 text-xs" defaultValue={String(100 + i * j * 7)}/></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex justify-end">
            <Button size="sm" onClick={() => toast.success("Saved")}>Save entries</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EditingTab() {
  const cols: Array<{ name: string; cards: string[] }> = [
    { name: "Pending", cards: ["Markets close", "Weather alert"] },
    { name: "In Progress", cards: ["G20 summit cut", "Election explainer"] },
    { name: "Review", cards: ["Tech roundup"] },
    { name: "Completed", cards: ["Daily wrap — June 12", "Op-Ed: Inflation"] },
  ];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Editing backend: not connected</Badge>
        <span className="text-xs text-muted-foreground">Connect your editing software backend later (mock).</span>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={() => toast("Open project (mock)")}>Open project</Button>
          <Button size="sm" variant="outline" onClick={() => toast("Assigned editor (mock)")}>Assign editor</Button>
          <Button size="sm" variant="outline" onClick={() => toast.success("Sent to review")}>Send to review</Button>
          <Button size="sm" onClick={() => toast.success("Edit marked complete")}>Mark complete</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {cols.map((col) => (
          <Card key={col.name}>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{col.name} <span className="text-muted-foreground">· {col.cards.length}</span></CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {col.cards.map((c) => (
                <div key={c} className="rounded-md border p-3 text-sm bg-card">
                  <div className="font-medium">{c}</div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Editor: Ben L.</span>
                    <Badge variant="outline" className="text-[10px]">Render: 60%</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function RdpTab() {
  const [connected, setConnected] = useState(false);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Apache Guacamole gateway: not connected</Badge>
        <span className="text-xs text-muted-foreground">Prepared for browser-based RDP integration later.</span>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={() => { setConnected(true); toast.success("Connected (mock)"); }}>
            <Power className="size-4 mr-2"/> Connect
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setConnected(false); toast("Disconnected"); }}>
            Disconnect
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast("Session restarted")}>
            Restart session
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader><CardTitle className="text-base">Remote desktop</CardTitle></CardHeader>
          <CardContent>
            <div className="aspect-video rounded-lg border bg-gradient-to-br from-muted to-card grid place-items-center">
              {connected ? (
                <div className="text-center">
                  <Play className="mx-auto size-10 text-primary"/>
                  <div className="mt-2 text-sm font-medium">Edit-Station-02 · 10.0.12.42</div>
                  <div className="text-xs text-muted-foreground">Mock remote desktop preview</div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Not connected. Click Connect to start a session.</div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Session info</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span>Server</span><span className="font-medium">orvion-edit-02</span></div>
            <div className="flex justify-between"><span>IP</span><span className="font-medium">10.0.12.42</span></div>
            <div className="flex justify-between"><span>Status</span><Badge variant="outline">{connected ? "Online" : "Offline"}</Badge></div>
            <div className="flex justify-between"><span>Latency</span><span className="font-medium flex items-center gap-1"><Wifi className="size-3.5"/>32ms</span></div>
            <div>
              <div className="flex justify-between mb-1"><span>CPU</span><span>42%</span></div>
              <Progress value={42}/>
            </div>
            <div>
              <div className="flex justify-between mb-1"><span>RAM</span><span>61%</span></div>
              <Progress value={61}/>
            </div>
            <div>
              <div className="flex justify-between mb-1"><span>Storage</span><span>78%</span></div>
              <Progress value={78}/>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Cpu className="size-4"/> Active sessions</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-muted-foreground border-b text-left"><th className="py-2">User</th><th>Machine</th><th>Started</th><th>Status</th></tr></thead>
              <tbody>
                {[
                  { u: "Ben L.", m: "edit-02", t: "09:14", s: "Active" },
                  { u: "Aisha K.", m: "edit-01", t: "08:30", s: "Idle" },
                ].map((r) => (
                  <tr key={r.u} className="border-b last:border-0">
                    <td className="py-2">{r.u}</td><td>{r.m}</td><td>{r.t}</td>
                    <td><Badge variant="outline">{r.s}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><HardDrive className="size-4"/> Session logs & audit</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-xs">
              <li className="flex justify-between"><span>Ben L. connected to edit-02</span><span className="text-muted-foreground">09:14</span></li>
              <li className="flex justify-between"><span>File transferred: project.aep (210MB)</span><span className="text-muted-foreground">09:32</span></li>
              <li className="flex justify-between text-red-600"><span>Latency spike detected on edit-02</span><span className="text-muted-foreground">10:04</span></li>
              <li className="flex justify-between"><span>Aisha K. logged out of edit-01</span><span className="text-muted-foreground">10:20</span></li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">File transfer</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Drag-and-drop file transfer will be available once the gateway is connected.</div>
          <Button variant="outline" size="sm" onClick={() => toast("File transfer (mock)")}>
            <UploadCloud className="size-4 mr-2"/> Send file
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function CreativesTab() {
  const items = [
    { name: "Channel logo", count: 1 },
    { name: "Banners", count: 4 },
    { name: "Thumbnail templates", count: 12 },
    { name: "Lower thirds", count: 8 },
    { name: "Pointers", count: 6 },
    { name: "Intros", count: 3 },
    { name: "Outros", count: 3 },
    { name: "Background graphics", count: 9 },
  ];
  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline" onClick={() => toast.success("Uploaded (mock)")}>
          <UploadCloud className="size-4 mr-2"/> Upload creative
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((it) => (
          <Card key={it.name}>
            <CardContent className="p-4">
              <div className="aspect-video rounded-md bg-gradient-to-br from-primary/20 to-accent grid place-items-center">
                <ImageIcon className="size-8 text-primary"/>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm font-medium">{it.name}</div>
                <Badge variant="outline" className="text-[10px]">{it.count}</Badge>
              </div>
              <div className="mt-3 flex gap-1 text-xs">
                <Button size="sm" variant="outline" className="h-7 flex-1" onClick={() => toast("Preview")}>Preview</Button>
                <Button size="sm" variant="outline" className="h-7 flex-1" onClick={() => toast.success("Set as default")}>Default</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Brand</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Brand colors</Label>
            <div className="flex gap-2 mt-2">
              {["#2563eb", "#0f172a", "#f97316", "#22c55e"].map((c) => (
                <div key={c} className="size-8 rounded-md border" style={{ background: c }}/>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs">Fonts</Label>
            <div className="mt-2 text-sm">Inter / Geist Mono <span className="text-muted-foreground text-xs">(placeholder)</span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TalentsTab() {
  const talents = [
    { name: "Riya Singh", role: "Anchor", lang: "EN / HI", style: "Formal", avail: "Mon–Fri" },
    { name: "Daniel Park", role: "Correspondent", lang: "EN", style: "Field reports", avail: "Flexible" },
    { name: "Aria Voice", role: "Voiceover", lang: "EN", style: "Calm narrator", avail: "Remote" },
  ];
  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline" onClick={() => toast.success("Talent added (mock)")}>Add talent</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {talents.map((t) => (
          <Card key={t.name}>
            <CardContent className="p-5 flex gap-4">
              <Avatar className="size-14">
                <AvatarFallback>{t.name.split(" ").map((x)=>x[0]).join("")}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="font-semibold">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role} · {t.lang}</div>
                <div className="text-xs mt-1">{t.style}</div>
                <div className="text-xs text-muted-foreground mt-1">Available: {t.avail}</div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="h-7" onClick={() => toast("Preview")}>Preview</Button>
                  <Button size="sm" variant="outline" className="h-7" onClick={() => toast("Edit")}>Edit</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ChannelSettingsTab({ channelId }: { channelId: string }) {
  const { channels, updateChannel } = useApp();
  const ch = channels.find((c) => c.id === channelId)!;
  const [name, setName] = useState(ch.name);
  const [manager, setManager] = useState(ch.manager);
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Channel settings</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Channel name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)}/>
        </div>
        <div className="space-y-1.5">
          <Label>Assigned manager</Label>
          <Input value={manager} onChange={(e) => setManager(e.target.value)}/>
        </div>
        <div className="space-y-1.5">
          <Label>Analytics mode</Label>
          <div className="flex items-center gap-3">
            <Switch checked={ch.mode === "API"} onCheckedChange={(v) => updateChannel(ch.id, { mode: v ? "API" : "Manual" })}/>
            <span className="text-sm">{ch.mode}</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Platform status</Label>
          <div className="flex items-center gap-3">
            <Switch checked={ch.status === "Active"} onCheckedChange={(v) => updateChannel(ch.id, { status: v ? "Active" : "Paused" })}/>
            <span className="text-sm">{ch.status}</span>
          </div>
        </div>
        <div className="md:col-span-2 flex flex-wrap gap-2 text-xs">
          <Badge variant="outline">Sheets: enabled</Badge>
          <Badge variant="outline">Editing assignment: Edit-Station-02</Badge>
          <Badge variant="outline">RDP assignment: edit-02</Badge>
          <Badge variant="outline">Creatives: assigned</Badge>
          <Badge variant="outline">Talents: assigned</Badge>
          <Badge variant="outline">KPI targets: set</Badge>
        </div>
        <div className="md:col-span-2 flex justify-end">
          <Button onClick={() => { updateChannel(ch.id, { name, manager }); toast.success("Settings saved"); }}>Save settings</Button>
        </div>
      </CardContent>
    </Card>
  );
}