import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/lib/app-store";
import { ALL_ROLES, type Role } from "@/lib/types";
import { toast } from "sonner";
import { StatusBadge } from "@/components/common/StatusBadge";

export const Route = createFileRoute("/_app/admin")({
  head: () => ({ meta: [{ title: "Admin Panel — Orvion Media" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { users, addUser, updateUser } = useApp();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("Viewer");

  return (
    <div>
      <PageHeader
        title="Admin Panel"
        description="Manage users, roles, access and audit activity."
        actions={<Button onClick={()=>setOpen(true)}><Plus className="size-4 mr-2"/> Add user</Button>}
      />
      <Tabs defaultValue="users">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="projects">Project Access</TabsTrigger>
          <TabsTrigger value="channels">Channel Access</TabsTrigger>
          <TabsTrigger value="sheets">Sheet Access</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <Card><CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-xs text-muted-foreground text-left border-b">
                  <th className="py-2 px-4">Name</th><th>Email</th><th>Role</th><th>Projects</th><th>Channels</th><th>Sheets</th><th>Status</th><th>Last login</th><th></th>
                </tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b last:border-0">
                      <td className="py-2 px-4 font-medium">{u.name}</td>
                      <td className="text-muted-foreground">{u.email}</td>
                      <td><Badge variant="secondary">{u.role}</Badge></td>
                      <td>{u.projects.join(", ") || "—"}</td>
                      <td>{u.channels.join(", ") || "—"}</td>
                      <td>{u.sheets.join(", ") || "—"}</td>
                      <td><StatusBadge value={u.status}/></td>
                      <td className="text-xs text-muted-foreground">{u.lastLogin}</td>
                      <td>
                        <Button size="sm" variant="ghost" onClick={() => {
                          updateUser(u.id, { status: u.status === "Active" ? "Inactive" : "Active" });
                          toast.success("Updated");
                        }}>Toggle</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Roles</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {ALL_ROLES.map((r) => (
                <div key={r} className="rounded-md border p-3">
                  <div className="font-medium text-sm">{r}</div>
                  <div className="text-xs text-muted-foreground mt-1">Permission preset (mock)</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="mt-4">
          <Card><CardContent className="p-6 text-sm">Per-user project assignment (mock). Pick a user from Users tab to edit access.</CardContent></Card>
        </TabsContent>
        <TabsContent value="channels" className="mt-4">
          <Card><CardContent className="p-6 text-sm">Per-user channel assignment (mock).</CardContent></Card>
        </TabsContent>
        <TabsContent value="sheets" className="mt-4">
          <Card><CardContent className="p-6 text-sm">Per-user sheet permissions (mock).</CardContent></Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead><tr className="text-xs text-muted-foreground text-left border-b"><th className="py-2 px-4">Time</th><th>Actor</th><th>Action</th><th>Target</th></tr></thead>
                <tbody>
                  {[
                    {t:"10:14",a:"Rahul S.",ac:"Updated KPI row",tg:"Orvion News HQ"},
                    {t:"09:50",a:"Omar I.",ac:"Granted channel access",tg:"Ben L."},
                    {t:"09:14",a:"Aisha K.",ac:"Edited Daily Content",tg:"3 rows"},
                  ].map((l,i)=>(
                    <tr key={i} className="border-b last:border-0"><td className="py-2 px-4">{l.t}</td><td>{l.a}</td><td>{l.ac}</td><td>{l.tg}</td></tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add user</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Name</Label><Input value={name} onChange={(e)=>setName(e.target.value)}/></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)}/></div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v)=>setRole(v as Role)}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{ALL_ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (!name || !email) return;
              addUser({ id: `u${Date.now()}`, name, email, role, projects: [], channels: [], sheets: [], status: "Active", lastLogin: "—" });
              setName(""); setEmail(""); setRole("Viewer"); setOpen(false);
              toast.success("User added");
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}