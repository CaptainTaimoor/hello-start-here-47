import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Youtube, Facebook, Instagram, Twitter, Music2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";

export const Route = createFileRoute("/_app/projects/news/current-affairs")({
  head: () => ({ meta: [{ title: "Current Affairs — News" }] }),
  component: CALayout,
});

function CALayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/projects/news/current-affairs") return <Outlet />;
  return <CAOverview />;
}

const PLATFORMS = [
  { slug: "youtube", name: "YouTube", icon: Youtube, status: "Active", enabled: true },
  { slug: "facebook", name: "Facebook", icon: Facebook, status: "Coming Soon", enabled: false },
  { slug: "instagram", name: "Instagram", icon: Instagram, status: "Coming Soon", enabled: false },
  { slug: "twitter", name: "Twitter / X", icon: Twitter, status: "Coming Soon", enabled: false },
  { slug: "tiktok", name: "TikTok", icon: Music2, status: "Coming Soon", enabled: false },
];

function CAOverview() {
  return (
    <div>
      <PageHeader title="Current Affairs" description="Choose a platform to manage its channels and workflow." />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {PLATFORMS.map((p) => {
          const Icon = p.icon;
          const card = (
            <Card className={`h-full ${p.enabled ? "hover:border-primary/60" : "opacity-70"} transition-colors`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="size-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                    <Icon className="size-5" />
                  </div>
                  <StatusBadge value={p.status} />
                </div>
                <div className="mt-4 text-lg font-bold">{p.name}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {p.enabled ? "Manage all channels, analytics, sheets and editing." : "Coming soon."}
                </p>
              </CardContent>
            </Card>
          );
          return p.enabled ? (
            <Link key={p.slug} to="/projects/news/current-affairs/youtube">{card}</Link>
          ) : (
            <div key={p.slug}>{card}</div>
          );
        })}
      </div>
    </div>
  );
}