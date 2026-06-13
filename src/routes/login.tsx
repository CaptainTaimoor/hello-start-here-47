import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import orvionLogo from "@/assets/orvion-logo.png";
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
    <div className="min-h-screen flex flex-col lg:flex-row text-foreground">
      <Toaster />
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[linear-gradient(135deg,oklch(0.18_0.05_235),oklch(0.28_0.1_215),oklch(0.42_0.15_205))] text-white p-12 flex-col justify-between">
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_20%,oklch(0.78_0.17_205)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,oklch(0.6_0.2_220)_0%,transparent_50%)]" />
        <div className="relative flex items-center gap-2">
          <img src={orvionLogo} alt="Orvion Media" className="h-9 w-auto" />
        </div>
        <div className="relative">
          <div className="text-4xl font-bold leading-tight max-w-md">
            One control panel for the entire newsroom.
          </div>
          <p className="mt-4 text-white/75 max-w-md text-sm">
            Plan content, run channels, manage editing pipelines and connect to
            your team across every department — all in one place.
          </p>
        </div>
        <div className="relative text-xs text-white/60">
          © {new Date().getFullYear()} Orvion Media · Internal use only
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <Card className="w-full max-w-md p-8">
          <div className="lg:hidden flex items-center gap-2 mb-6 bg-[oklch(0.18_0.05_235)] rounded-lg p-3">
            <img src={orvionLogo} alt="Orvion Media" className="h-7 w-auto" />
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