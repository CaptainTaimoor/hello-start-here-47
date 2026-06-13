import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/common/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Banknote, Wallet, ReceiptText, FileText, Plus } from "lucide-react";
import { MOCK_SALARIES } from "@/lib/mock-data";
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/departments/finance")({
  head: () => ({ meta: [{ title: "Finance — Orvion Media" }] }),
  component: FinancePage,
});

function FinancePage() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <PageHeader
        title="Accounts / Finance"
        description="Track salaries, project records, operation costs and tax."
        actions={<Button onClick={()=>setOpen(true)}><Plus className="size-4 mr-2"/> Add expense</Button>}
      />
      <Tabs defaultValue="overview">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="salaries">Employee Salaries</TabsTrigger>
          <TabsTrigger value="projects">Project Records</TabsTrigger>
          <TabsTrigger value="ops">Operation Costs</TabsTrigger>
          <TabsTrigger value="tax">Tax Information</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Monthly salary cost" value="$612K" icon={Wallet}/>
            <StatCard label="Operation cost" value="$184K" icon={ReceiptText}/>
            <StatCard label="Project budget" value="$1.2M" icon={Banknote}/>
            <StatCard label="Tax due" value="$92K" icon={FileText}/>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Monthly expenses</CardTitle></CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer>
                <BarChart data={[
                  { m: "Jan", salary: 580, ops: 160 },
                  { m: "Feb", salary: 600, ops: 170 },
                  { m: "Mar", salary: 615, ops: 175 },
                  { m: "Apr", salary: 608, ops: 180 },
                  { m: "May", salary: 620, ops: 182 },
                  { m: "Jun", salary: 612, ops: 184 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                  <XAxis dataKey="m" fontSize={11} stroke="var(--muted-foreground)"/>
                  <YAxis fontSize={11} stroke="var(--muted-foreground)"/>
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}/>
                  <Bar dataKey="salary" fill="var(--primary)" radius={3}/>
                  <Bar dataKey="ops" fill="var(--chart-2)" radius={3}/>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salaries" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Salaries — June 2026</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead><tr className="text-xs text-muted-foreground text-left border-b"><th className="py-2">Employee</th><th>Role</th><th>Base</th><th>Bonus</th><th>Status</th></tr></thead>
                <tbody>
                  {MOCK_SALARIES.map((s) => (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="py-2">{s.employee}</td>
                      <td>{s.role}</td>
                      <td>${s.base.toLocaleString()}</td>
                      <td>${s.bonus.toLocaleString()}</td>
                      <td><Badge variant="outline">{s.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Project records</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead><tr className="text-xs text-muted-foreground text-left border-b"><th className="py-2">Project</th><th>Budget</th><th>Spent</th><th>Remaining</th></tr></thead>
                <tbody>
                  {[{p:"News",b:1200000,s:842000},{p:"Documentary (Planned)",b:300000,s:0}].map((r)=>(
                    <tr key={r.p} className="border-b last:border-0">
                      <td className="py-2">{r.p}</td>
                      <td>${r.b.toLocaleString()}</td>
                      <td>${r.s.toLocaleString()}</td>
                      <td>${(r.b-r.s).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ops" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Operation costs</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead><tr className="text-xs text-muted-foreground text-left border-b"><th className="py-2">Item</th><th>Vendor</th><th>Amount</th><th>Date</th></tr></thead>
                <tbody>
                  {[
                    {it:"Cloud rendering",v:"Compute Co.",a:18400,d:"2026-06-01"},
                    {it:"Studio rent",v:"Realty LLC",a:42000,d:"2026-06-01"},
                    {it:"Software licenses",v:"Adobe",a:9800,d:"2026-06-05"},
                  ].map((r,i)=>(
                    <tr key={i} className="border-b last:border-0"><td className="py-2">{r.it}</td><td>{r.v}</td><td>${r.a.toLocaleString()}</td><td>{r.d}</td></tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Tax information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="rounded-md border p-4"><div className="text-xs text-muted-foreground">VAT Registration</div><div className="font-medium">OM-VAT-22847</div></div>
              <div className="rounded-md border p-4"><div className="text-xs text-muted-foreground">Tax due this quarter</div><div className="font-medium">$92,400</div></div>
              <div className="rounded-md border p-4"><div className="text-xs text-muted-foreground">Last filing</div><div className="font-medium">2026-04-15</div></div>
              <div className="rounded-md border p-4"><div className="text-xs text-muted-foreground">Next filing</div><div className="font-medium">2026-07-15</div></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add expense</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Item</Label><Input/></div>
            <div className="space-y-1.5"><Label>Amount</Label><Input type="number"/></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
            <Button onClick={()=>{ setOpen(false); toast.success("Expense added (mock)"); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}