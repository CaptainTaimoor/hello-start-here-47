import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [{ title: "Forgot password — Orvion Media" }],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen grid place-items-center bg-background text-foreground p-6">
      <Toaster />
      <Card className="w-full max-w-md p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="size-9 rounded-lg bg-primary text-primary-foreground grid place-items-center">
            <Sparkles className="size-5" />
          </div>
          <div className="font-bold">Orvion Media</div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Reset your password</h1>
        <p className="text-sm text-muted-foreground mt-1">
          We'll send a recovery link to your work email.
        </p>
        {!sent ? (
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
              toast.success("Recovery link sent (mock)");
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button className="w-full" type="submit">Send recovery link</Button>
          </form>
        ) : (
          <div className="mt-6 rounded-md border bg-muted/40 p-4 text-sm">
            If an account exists for <b>{email}</b>, a recovery link has been sent.
          </div>
        )}
        <div className="mt-6 text-sm text-center">
          <Link to="/login" className="text-primary hover:underline">Back to sign in</Link>
        </div>
      </Card>
    </div>
  );
}