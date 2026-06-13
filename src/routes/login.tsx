import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useApp } from "@/lib/app-store";
import { ALL_ROLES, type Role } from "@/lib/types";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Orvion Media" },
      { name: "description", content: "Sign in to the Orvion Media control panel." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useApp();
  const nav = useNavigate();
  const [email, setEmail] = useState("rahul@orvion.media");
  const [password, setPassword] = useState("••••••••");
  const [role, setRole] = useState<Role>("Super Admin");

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background text-foreground">
      <Toaster />
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-primary/90 via-primary to-primary/70 text-primary-foreground p-12 flex-col justify-between">
        <div className="flex items-center gap-2">
          <div className="size-10 rounded-xl bg-primary-foreground/15 grid place-items-center backdrop-blur">
            <Sparkles className="size-5" />
          </div>
          <div className="font-bold text-lg">Orvion Media</div>
        </div>
        <div>
          <div className="text-4xl font-bold leading-tight max-w-md">
            One control panel for the entire newsroom.
          </div>
          <p className="mt-4 text-primary-foreground/80 max-w-md text-sm">
            Plan content, run channels, manage editing pipelines and connect to
            your team across every department — all in one place.
          </p>
        </div>
        <div className="text-xs text-primary-foreground/70">
          © {new Date().getFullYear()} Orvion Media · Internal use only
        </div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <Card className="w-full max-w-md p-8">
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="size-9 rounded-lg bg-primary text-primary-foreground grid place-items-center">
              <Sparkles className="size-5" />
            </div>
            <div className="font-bold">Orvion Media</div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to your workspace. Mock login — pick any role.
          </p>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              login({
                name: email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
                email,
                role,
              });
              toast.success(`Signed in as ${role}`);
              nav({ to: "/dashboard" });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot?
                </Link>
              </div>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Sign in as</Label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">Sign in</Button>
          </form>
          <p className="text-[11px] text-muted-foreground mt-6 text-center">
            This is a mock authentication. No credentials are validated.
          </p>
        </Card>
      </div>
    </div>
  );
}