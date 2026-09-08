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
            <Field name="service" label="Service" defaultValue="Air Force" />
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
            <Field name="intendedPostServiceCountry" label="Intended post-service country" defaultValue="Japan" />
            <Field name="dependents" label="Dependents" type="number" defaultValue="1" min={0} max={20} />
            <Field name="skillbridgeStart" label="SkillBridge start" type="date" defaultValue="2027-04-01" />
            <Field name="skillbridgeEnd" label="SkillBridge end" type="date" defaultValue="2027-05-15" />
            <Field name="terminalLeaveStart" label="Terminal leave start" type="date" defaultValue="2027-05-22" />
            <Field name="finalDutyDay" label="Final duty day" type="date" defaultValue="2027-05-31" />
            <Field name="officialSeparationDate" label="Official retirement/separation date" type="date" />
            <SelectField name="transitionType" label="Transition type" defaultValue="not_yet_determined" options={[
              ["standard_retirement", "Standard Retirement"],
              ["voluntary_normal_separation", "Voluntary/Normal Separation"],
              ["medical_separation", "Medical Separation"],
              ["medical_retirement", "Medical Retirement"],
              ["not_yet_determined", "Not Yet Determined"],
            ]} />
            <SelectField name="desIdesStatus" label="Medical Disability Evaluation (DES/IDES)" defaultValue="not_applicable" options={[
              ["not_applicable", "No / Not applicable"], ["referred", "Referred / Just started"],
              ["in_process", "MEB or PEB in progress"], ["found_fit", "Found fit"],
              ["found_unfit", "Found unfit"], ["complete", "Complete"],
            ]} />
            <SelectField name="claimWorkflowState" label="VA claim workflow" defaultValue="not_started" options={[
              ["not_started", "Not started"], ["planning", "Planning"], ["bdd_eligible", "BDD eligible"],
              ["bdd_filed", "BDD filed"], ["fdc", "Fully Developed Claim (FDC)"],
              ["standard_claim", "Standard claim"], ["ides_controlled", "IDES controlled"],
              ["claim_submitted", "Claim submitted"], ["exams_evidence_in_progress", "Exams / evidence requests in progress"],
              ["decision_pending", "Decision pending"], ["complete", "Complete"],
            ]} />
            <SelectField name="skillbridgeIntent" label="SkillBridge intent" defaultValue="not_yet" options={[
              ["not_yet", "Not yet decided"], ["yes", "Yes"], ["no", "No"], ["maybe", "Maybe"],
            ]} />
            <SelectField name="vaClaimIntent" label="VA claim intent" defaultValue="not_yet" options={[
              ["not_yet", "Not yet decided"], ["yes", "Yes"], ["no", "No"], ["maybe", "Maybe"],
            ]} />
            <SelectField name="vaHealthCareIntent" label="VA health-care intent" defaultValue="not_yet" options={[
              ["not_yet", "Not yet decided"], ["yes", "Yes"], ["no", "No"], ["maybe", "Maybe"],
            ]} />
            <SelectField name="civilianEmployment" label="Civilian employment" defaultValue="not_yet" options={[
              ["not_yet", "Not yet decided"], ["employed", "Already employed"], ["planning", "Planning"], ["seeking", "Seeking"], ["none", "No plans"],
            ]} />
            <SelectField name="federalEmployment" label="Federal employment" defaultValue="not_yet" options={[
              ["not_yet", "Not yet decided"], ["yes", "Yes"], ["no", "No"], ["considering", "Considering"],
            ]} />
            <SelectField name="ceremony" label="Retirement ceremony" defaultValue="not_yet" options={[
              ["not_yet", "Not yet decided"], ["yes", "Yes"], ["no", "No"], ["maybe", "Maybe"],
            ]} />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <Checkbox id="moving" name="moving" defaultChecked={false} />
              <Label htmlFor="moving">Planning a move</Label>
            </div>
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <Checkbox id="spouse" name="spouse" defaultChecked={false} />
              <Label htmlFor="spouse">Spouse or family support</Label>
            </div>
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <Checkbox id="overseasStatus" name="overseasStatus" checked={overseas} onCheckedChange={(value) => setOverseas(value === true)} />
              <Label htmlFor="overseasStatus">Overseas / OCONUS retirement location</Label>
            </div>
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
  min,
  max,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  min?: number;
  max?: number;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} defaultValue={defaultValue} required={required} min={min} max={max} />
    </div>
  );
}

function SelectField({ name, label, options, defaultValue }: { name: string; label: string; options: string[][]; defaultValue: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <select id={name} name={name} defaultValue={defaultValue} className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm">
        {options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
      </select>
    </div>
  );
}
