import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { ArrowRight, Newspaper } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";

export const Route = createFileRoute("/_app/projects/news")({
  head: () => ({ meta: [{ title: "News — Orvion Media" }] }),
  component: NewsLayout,
});

function NewsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/projects/news") return <Outlet />;
  return <NewsOverview />;
}

const SUBS = [
  { slug: "current-affairs", name: "Current Affairs", status: "Active", desc: "Daily news production and analysis." },
  { slug: "entertainment", name: "Entertainment", status: "Coming Soon", desc: "Pop culture, film and TV coverage." },
  { slug: "sports-news", name: "Sports News", status: "Coming Soon", desc: "Live scores, highlights and analysis." },
];

function NewsOverview() {
  return (
    <div>
      <PageHeader
        title="News"
        description="Active project for Orvion Media news operations."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SUBS.map((s) => {
          const enabled = s.status === "Active";
          const card = (
            <Card className={`h-full ${enabled ? "hover:border-primary/60" : "opacity-70"} transition-colors`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="size-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                    <Newspaper className="size-5" />
                  </div>
                  <StatusBadge value={s.status} />
                </div>
                <div className="mt-4 text-lg font-bold">{s.name}</div>
                <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
                {enabled && (
                  <div className="mt-6 inline-flex items-center gap-1 text-primary text-xs font-medium">
                    Open <ArrowRight className="size-3.5" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
          return enabled ? (
            <Link key={s.slug} to="/projects/news/current-affairs">
              {card}
            </Link>
          ) : (
            <div key={s.slug}>{card}</div>
          );
        })}
      </div>
    </div>
  );
}