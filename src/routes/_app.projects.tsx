import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, FolderKanban, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/projects")({
  head: () => ({ meta: [{ title: "Projects — Orvion Media" }] }),
  component: ProjectsLayout,
});

function ProjectsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/projects") return <Outlet />;
  return <ProjectsIndex />;
}

function ProjectsIndex() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <PageHeader
        title="Projects"
        description="All Orvion Media projects across the organization."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4 mr-2" /> Add project
          </Button>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Link to="/projects/news">
          <Card className="hover:border-primary/60 transition-colors h-full">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="size-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                  <FolderKanban className="size-5" />
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30" variant="outline">Active</Badge>
              </div>
              <div className="mt-4 text-lg font-bold">News</div>
              <div className="text-xs text-muted-foreground mt-1">
                Current Affairs · Entertainment · Sports News
              </div>
              <div className="mt-6 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">3 sub-projects</span>
                <span className="inline-flex items-center gap-1 text-primary font-medium">
                  Open <ArrowRight className="size-3.5" />
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a new project</DialogTitle>
            <DialogDescription>This is a mock form — no project is created.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Project name</Label>
              <Input placeholder="e.g. Documentary" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input placeholder="What is this project about?" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => { setOpen(false); toast.success("Project created (mock)"); }}>
              Create project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}