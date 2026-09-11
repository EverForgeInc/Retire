"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: form.get("displayName"),
        email: form.get("email"),
        password: form.get("password"),
        accessCode: form.get("accessCode"),
      }),
    });
    const data = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "Unable to create your account");
      return;
    }
    router.push(data.next || "/onboarding");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">
      <Card className="shadow-sm">
        <CardHeader>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-700">Retire closed beta</p>
          <CardTitle className="font-[family-name:var(--font-source-serif)] text-3xl font-semibold">Create your account</CardTitle>
          <CardDescription>
            Beta access is currently invitation-only. Retire is an independent planning tool and is not an official DoD or VA system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="displayName">Name</Label>
              <Input id="displayName" name="displayName" required autoComplete="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required minLength={12} autoComplete="new-password" />
              <p className="text-xs text-muted-foreground">At least 12 characters with uppercase, lowercase, and a number.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accessCode">Beta access code</Label>
              <Input id="accessCode" name="accessCode" type="password" required autoComplete="off" />
            </div>
            {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
            <Button type="submit" className="w-full" disabled={loading} size="lg">
              {loading ? "Creating account..." : "Create beta account"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account? <Link className="underline" href="/login">Sign in</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
