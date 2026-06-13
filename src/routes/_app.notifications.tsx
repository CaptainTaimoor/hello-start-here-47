import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/lib/app-store";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Orvion Media" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { notifications, markNotificationRead, markAllRead } = useApp();
  const [type, setType] = useState<string>("all");
  const [readState, setReadState] = useState<string>("all");

  const types = useMemo(() => Array.from(new Set(notifications.map((n) => n.type))), [notifications]);
  const filtered = notifications.filter((n) =>
    (type === "all" || n.type === type) &&
    (readState === "all" || (readState === "unread" ? !n.read : n.read)),
  );

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Sheet updates, tasks, KPIs, approvals, RDP, API and team activity."
        actions={<Button variant="outline" size="sm" onClick={markAllRead}>Mark all as read</Button>}
      />
      <div className="flex flex-wrap gap-2 mb-4">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-44"><SelectValue/></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={readState} onValueChange={setReadState}>
          <SelectTrigger className="w-44"><SelectValue/></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardContent className="p-0 divide-y">
          {filtered.map((n) => (
            <div key={n.id} className="flex items-start gap-3 p-4 hover:bg-accent/30">
              <span className={`mt-2 size-2 rounded-full shrink-0 ${n.read ? "bg-muted-foreground/40" : "bg-primary"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-medium">{n.title}</div>
                  <Badge variant="outline" className="text-[10px]">{n.type}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{n.description}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{n.createdAt}</span>
                {!n.read && <Button size="sm" variant="ghost" onClick={() => markNotificationRead(n.id)}>Mark read</Button>}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-12 text-center text-sm text-muted-foreground">No notifications match.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}