import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
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
import { useApp } from "@/lib/app-store";
import { ALL_ROLES, type Role } from "@/lib/types";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { AuroraMark } from "@/components/magic/AuroraMark";

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
    <div className="min-h-screen flex flex-col lg:flex-row text-foreground relative">
      <Toaster />
      {/* LEFT: editorial canvas */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden p-12 flex-col justify-between"
      >
        <div className="relative flex items-center gap-3 z-10 h-10">
          <AuroraMark size={32} spin />
          <img src={orvionLogo} alt="Orvion Media" className="h-9 w-auto block" />
        </div>
        <div className="relative z-10 max-w-xl">
          <div className="eyebrow text-primary/80 mb-6">Newsroom OS · v2.6</div>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="serif-display text-6xl xl:text-7xl text-foreground leading-[0.95] tracking-[-0.03em]"
          >
            One panel for the <span className="italic text-primary">entire</span> newsroom.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-6 text-base text-muted-foreground max-w-md leading-relaxed font-light"
          >
            Plan content, run channels, manage editing pipelines and connect
            every department — choreographed in one place.
          </motion.p>
        </div>
        <div className="relative z-10 flex items-center justify-between text-xs text-muted-foreground/70 font-mono">
          <span>© {new Date().getFullYear()} Orvion Media</span>
          <span className="tracking-[0.2em] uppercase">Internal · Encrypted</span>
        </div>
      </motion.div>

      {/* RIGHT: glass form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="tile w-full max-w-md p-10"
        >
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <AuroraMark size={24} />
            <img src={orvionLogo} alt="Orvion Media" className="h-7 w-auto" />
          </div>
          <div className="eyebrow text-primary/80 mb-3">Sign in</div>
          <h1 className="serif-display text-4xl text-foreground">
            Welcome <span className="italic text-primary">back.</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Sign in to your workspace. Mock login — pick any role.
          </p>

          <form
            className="mt-8 space-y-4 relative"
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
              <Label htmlFor="email" className="eyebrow">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="eyebrow">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot?
                </Link>
              </div>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label className="eyebrow">Sign in as</Label>
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
            <Button type="submit" variant="premium" size="lg" className="w-full mt-2">Sign in →</Button>
          </form>
          <p className="text-[11px] text-muted-foreground/70 mt-6 text-center font-mono tracking-wide">
            This is a mock authentication. No credentials are validated.
          </p>
        </motion.div>
      </div>
    </div>
  );
}