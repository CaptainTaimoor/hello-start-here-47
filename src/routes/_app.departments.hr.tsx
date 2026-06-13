import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MOCK_EMPLOYEES } from "@/lib/mock-data";
import { StatCard } from "@/components/common/StatCard";
import { Users, UserPlus, Clock, GraduationCap } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/departments/hr")({
  head: () => ({ meta: [{ title: "HR — Orvion Media" }] }),
  component: HRPage,
});

function HRPage() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<typeof MOCK_EMPLOYEES[number] | null>(null);

  return (
    <div>
      <PageHeader
        title="Human Resources"
        description="Manage employees, attendance, hiring and training."
        actions={<Button onClick={() => setOpen(true)}><Plus className="size-4 mr-2"/> Add employee</Button>}
      />
      <Tabs defaultValue="overview">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="records">All Records</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="overtime">Overtime</TabsTrigger>
          <TabsTrigger value="hiring">Hiring</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Active employees" value={48} icon={Users}/>
          <StatCard label="Today's attendance" value="92%" icon={Clock}/>
          <StatCard label="Open hires" value={4} icon={UserPlus}/>
          <StatCard label="Trainings this month" value={3} icon={GraduationCap}/>
        </TabsContent>

        <TabsContent value="records" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">All employee records</CardTitle></CardHeader>
            <CardContent>
              <EmpTable onOpen={setActive}/>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="mt-4">
          <Card><CardContent className="p-4"><EmpTable onOpen={setActive}/></CardContent></Card>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Today's attendance</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead><tr className="text-xs text-muted-foreground text-left border-b"><th className="py-2">Employee</th><th>Check in</th><th>Check out</th><th>Hours</th><th>Status</th></tr></thead>
                <tbody>
                  {MOCK_EMPLOYEES.slice(0,6).map((e,i) => (
                    <tr key={e.id} className="border-b last:border-0">
                      <td className="py-2">{e.name}</td>
                      <td>09:{10+i}</td>
                      <td>18:{20+i}</td>
                      <td>{8 + (i%3)}h</td>
                      <td><Badge variant="outline">Present</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overtime" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Overtime requests</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                { who: "Ben L.", hrs: 3, when: "2026-06-12", st: "Pending" },
                { who: "Aisha K.", hrs: 2, when: "2026-06-11", st: "Approved" },
              ].map((o,i) => (
                <div key={i} className="flex items-center justify-between rounded-md border p-3">
                  <div>{o.who} · {o.hrs}h · {o.when}</div>
                  <Badge variant="outline">{o.st}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hiring" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Hiring pipeline</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                {["Applied","Screening","Interview","Offer"].map((col,i)=>(
                  <div key={col}>
                    <div className="text-xs font-semibold text-muted-foreground mb-2">{col} · {[6,4,2,1][i]}</div>
                    <div className="space-y-2">
                      {Array.from({length:[3,2,1,1][i]}).map((_,j)=>(
                        <div key={j} className="rounded-md border p-3">
                          <div className="font-medium">Candidate {j+1}</div>
                          <div className="text-xs text-muted-foreground">Video Editor · 3 yrs</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Training sessions</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {["Editing best practices","YouTube SEO 101","Adobe After Effects deep dive"].map((t)=>(
                <div key={t} className="rounded-md border p-3 flex justify-between">
                  <span>{t}</span>
                  <Badge variant="outline">Scheduled</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add employee</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Name</Label><Input/></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email"/></div>
            <div className="space-y-1.5"><Label>Department</Label><Input/></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
            <Button onClick={() => { setOpen(false); toast.success("Employee added (mock)"); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={!!active} onOpenChange={(o)=>!o && setActive(null)}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader><SheetTitle>{active?.name}</SheetTitle></SheetHeader>
          {active && (
            <div className="mt-4 space-y-3 text-sm px-1">
              <div className="flex items-center gap-3">
                <Avatar className="size-12"><AvatarFallback>{active.name.split(" ").map(x=>x[0]).join("")}</AvatarFallback></Avatar>
                <div>
                  <div className="font-semibold">{active.name}</div>
                  <div className="text-xs text-muted-foreground">{active.role} · {active.dept}</div>
                </div>
              </div>
              <div><b>Email:</b> {active.email}</div>
              <div><b>Joined:</b> {active.joined}</div>
              <div><b>Status:</b> {active.status}</div>
              <Button size="sm" onClick={() => toast.success("Saved")}>Edit details</Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function EmpTable({ onOpen }: { onOpen: (e: typeof MOCK_EMPLOYEES[number]) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="text-xs text-muted-foreground text-left border-b"><th className="py-2">Name</th><th>Department</th><th>Role</th><th>Email</th><th>Joined</th><th>Status</th></tr></thead>
        <tbody>
          {MOCK_EMPLOYEES.map((e) => (
            <tr key={e.id} className="border-b last:border-0 hover:bg-accent/40 cursor-pointer" onClick={() => onOpen(e)}>
              <td className="py-2 font-medium">{e.name}</td>
              <td>{e.dept}</td>
              <td>{e.role}</td>
              <td className="text-muted-foreground">{e.email}</td>
              <td>{e.joined}</td>
              <td><Badge variant="outline">{e.status}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}