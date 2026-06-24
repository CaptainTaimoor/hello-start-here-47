import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, CheckCircle2, Clock as ClockIcon, Sparkles } from "lucide-react";
import { motion } from "motion/react";
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
import { DigitalPlatformTrainingCenter } from "@/components/hr/DigitalPlatformTrainingCenter";
import { BorderBeam } from "@/components/magic/BorderBeam";
import { Meteors } from "@/components/magic/Meteors";
import { LiveDot } from "@/components/magic/LiveDot";

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
          <Card className="relative overflow-hidden">
            <BorderBeam size={180} duration={9} />
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Today's attendance</CardTitle>
              <LiveDot label="Live" tone="success" />
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead><tr className="text-xs text-muted-foreground text-left border-b"><th className="py-2">Employee</th><th>Check in</th><th>Check out</th><th>Hours</th><th>Status</th></tr></thead>
                <tbody>
                  {MOCK_EMPLOYEES.slice(0,6).map((e,i) => (
                    <motion.tr
                      key={e.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16,1,0.3,1] }}
                      whileHover={{ backgroundColor: "color-mix(in oklab, var(--primary) 6%, transparent)" }}
                      className="border-b last:border-0"
                    >
                      <td className="py-2">{e.name}</td>
                      <td>09:{10+i}</td>
                      <td>18:{20+i}</td>
                      <td>{8 + (i%3)}h</td>
                      <td>
                        <Badge variant="outline" className="gap-1.5">
                          <span className="relative flex size-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
                          </span>
                          Present
                        </Badge>
                      </td>
                    </motion.tr>
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
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16,1,0.3,1] }}
                  whileHover={{ y: -2, boxShadow: "0 8px 24px -12px color-mix(in oklab, var(--primary) 50%, transparent)" }}
                  className="flex items-center justify-between rounded-md border p-3 transition-colors hover:border-primary/30"
                >
                  <div className="flex items-center gap-2">
                    {o.st === "Pending"
                      ? <ClockIcon className="size-4 text-amber-400 animate-pulse" />
                      : <CheckCircle2 className="size-4 text-emerald-400" />}
                    <span>{o.who} · {o.hrs}h · {o.when}</span>
                  </div>
                  <Badge variant="outline" className={o.st === "Pending" ? "border-amber-400/40 text-amber-300" : "border-emerald-400/40 text-emerald-300"}>{o.st}</Badge>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hiring" className="mt-4">
          <Card className="relative overflow-hidden">
            <BorderBeam size={200} duration={11} />
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Hiring pipeline</CardTitle>
              <Badge variant="outline" className="gap-1.5 border-primary/30 text-primary">
                <Sparkles className="size-3" /> 13 candidates
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                {["Applied","Screening","Interview","Offer"].map((col,i)=>(
                  <motion.div
                    key={col}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16,1,0.3,1] }}
                  >
                    <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                      {col} · {[6,4,2,1][i]}
                    </div>
                    <div className="space-y-2">
                      {Array.from({length:[3,2,1,1][i]}).map((_,j)=>(
                        <motion.div
                          key={j}
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 + j * 0.05 + 0.2, duration: 0.4 }}
                          whileHover={{ y: -3, boxShadow: "0 12px 28px -12px color-mix(in oklab, var(--primary) 55%, transparent)" }}
                          className="rounded-md border p-3 cursor-pointer transition-colors hover:border-primary/40 bg-gradient-to-br from-card to-card/60"
                        >
                          <div className="font-medium">Candidate {j+1}</div>
                          <div className="text-xs text-muted-foreground">Video Editor · 3 yrs</div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="mt-4">
          <div className="space-y-4">
            <Card className="relative overflow-hidden">
              <Meteors number={8} />
              <CardHeader><CardTitle className="text-base">Training sessions</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {["Editing best practices","YouTube SEO 101","Adobe After Effects deep dive"].map((t,i)=>(
                <motion.div
                  key={t}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  whileHover={{ x: 4 }}
                  className="rounded-md border p-3 flex justify-between transition-colors hover:border-primary/30 hover:bg-primary/5"
                >
                  <span>{t}</span>
                  <Badge variant="outline">Scheduled</Badge>
                </motion.div>
              ))}
            </CardContent>
            </Card>
            <DigitalPlatformTrainingCenter />
          </div>
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
          {MOCK_EMPLOYEES.map((e, i) => (
            <motion.tr
              key={e.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 12) * 0.03, duration: 0.35, ease: [0.16,1,0.3,1] }}
              whileHover={{ x: 2 }}
              className="border-b last:border-0 hover:bg-primary/5 cursor-pointer transition-colors"
              onClick={() => onOpen(e)}
            >
              <td className="py-2 font-medium">{e.name}</td>
              <td>{e.dept}</td>
              <td>{e.role}</td>
              <td className="text-muted-foreground">{e.email}</td>
              <td>{e.joined}</td>
              <td><Badge variant="outline">{e.status}</Badge></td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}