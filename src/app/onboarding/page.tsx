"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Panel } from "@/components/ui/Panel";

export default function OnboardingPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [overseas, setOverseas] = useState(true);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        overseasStatus: overseas,
      }),
    });
    setLoading(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || "Unable to save profile");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AppShell title="Onboarding" subtitle="Set your retirement anchors. No SSN is requested.">
      <Panel
        title="Member profile"
        description="Saving generates or recalculates your 93-task chronological checklist."
      >
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field name="fullName" label="Full name" defaultValue="David Najera" required />
            <Field name="rank" label="Rank" defaultValue="CMSgt" />
            <Field name="branch" label="Branch" defaultValue="USAF" />
            <Field name="component" label="Component" defaultValue="Active Duty" />
            <Field name="installation" label="Installation" defaultValue="Misawa AB" />
            <Field name="timezone" label="Time zone" defaultValue="Asia/Tokyo" />
            <Field
              name="projectedRetirementDate"
              label="Projected retirement date"
              type="date"
              defaultValue="2027-06-01"
              required
            />
            <Field name="retirementLocation" label="Retirement location" defaultValue="Misawa, Japan" />
            <Field name="skillbridgeStart" label="SkillBridge start" type="date" defaultValue="2027-04-01" />
            <Field name="skillbridgeEnd" label="SkillBridge end" type="date" defaultValue="2027-05-15" />
            <Field name="terminalLeaveStart" label="Terminal leave start" type="date" defaultValue="2027-05-22" />
            <Field name="finalDutyDay" label="Final duty day" type="date" defaultValue="2027-05-31" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="overseasStatus"
              checked={overseas}
              onCheckedChange={(value) => setOverseas(value === true)}
            />
            <Label htmlFor="overseasStatus">Overseas / OCONUS retirement location</Label>
          </div>
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Generate my 93-task checklist"}
          </Button>
        </form>
      </Panel>
    </AppShell>
  );
}

function Field({
  name,
  label,
  type = "text",
  defaultValue,
  required,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} defaultValue={defaultValue} required={required} />
    </div>
  );
}
