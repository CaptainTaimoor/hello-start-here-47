import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { ArrowRight, Newspaper } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";

export const Route = createFileRoute("/_app/team")({
  head: () => ({ meta: [{ title: "Team Workspace — Orvion Media" }] }),
  component: TeamLayout,
});

function TeamLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/team") return <Outlet />;
  return <TeamIndex />;
}

function TeamIndex() {
  return (
    <div>
      <PageHeader title="Team Workspace" description="Active project workspaces shared with their assigned managers and teams." />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Link to="/team/news">
          <Card className="hover:border-primary/60 transition-colors h-full">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="size-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                  <Newspaper className="size-5"/>
                </div>
                <StatusBadge value="Active"/>
              </div>
              <div className="mt-4 text-lg font-bold">News</div>
              <div className="text-xs text-muted-foreground mt-1">Manager: Rahul Sharma · 3 sub-projects</div>
              <div className="mt-6 inline-flex items-center gap-1 text-primary text-xs font-medium">
                Open workspace <ArrowRight className="size-3.5"/>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}