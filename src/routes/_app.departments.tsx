import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Users, Banknote, Briefcase, Cpu, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_app/departments")({
  head: () => ({ meta: [{ title: "Departments — Orvion Media" }] }),
  component: DepartmentsLayout,
});

function DepartmentsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/departments") return <Outlet />;
  return <DepartmentsIndex />;
}

const DEPTS = [
  { to: "/departments/hr", name: "HR", icon: Users, desc: "Employees, attendance, hiring, training." },
  { to: "/departments/finance", name: "Accounts / Finance", icon: Banknote, desc: "Salaries, project records, costs, tax." },
  { to: "/team", name: "Team Workspace", icon: Briefcase, desc: "Manager workspaces and shared sheets." },
  { to: "/departments/it", name: "IT", icon: Cpu, desc: "App health, updates, tickets, database." },
] as const;

function DepartmentsIndex() {
  return (
    <div>
      <PageHeader title="Departments" description="Quick access to all company departments." />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {DEPTS.map((d) => {
          const Icon = d.icon;
          return (
            <Link key={d.to} to={d.to}>
              <Card className="hover:border-primary/60 transition-colors h-full">
                <CardContent className="p-6">
                  <div className="size-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                    <Icon className="size-5"/>
                  </div>
                  <div className="mt-4 font-bold">{d.name}</div>
                  <p className="text-xs text-muted-foreground mt-1">{d.desc}</p>
                  <div className="mt-6 inline-flex items-center gap-1 text-primary text-xs font-medium">
                    Open <ArrowRight className="size-3.5"/>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}