"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Panel } from "@/components/ui/Panel";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BodyPartSelector, type BodyPart } from "./BodyPartSelector";

const RELATIONSHIPS = [
  ["direct", "Direct / in-service"],
  ["presumptive", "Presumptive"],
  ["secondary", "Secondary"],
  ["aggravation", "Pre-service aggravated"],
  ["needs_review", "Other / needs review"],
] as const;

const EVIDENCE_STATUSES = [
  ["member_reported", "Member reported"],
  ["record_expected", "Record expected / not reviewed"],
  ["record_found", "Record found"],
  ["record_confirmed", "Record confirmed"],
  ["needs_assessment", "Needs clinical assessment"],
] as const;

interface FormState {
  bodyPart: BodyPart | null;
  exactLocation: string;
  conditionName: string;
  diagnosisStatus: string;
  evidenceStatus: string;
  primaryRelationship: string;
  alternateRelationship: string;
  relatedCondition: string;
  onsetOrEvent: string;
  actualSymptoms: string;
  actualImpact: string;
  suggestedImpactExample: string;
  appPrompts: string;
  facilityAndDate: string;
  evidenceNeeded: string;
  ratingScreen: string;
  ratingFramework: string;
  activity: string;
  limitation: string;
  frequency: string;
  severity: string;
}

const EMPTY: FormState = {
  bodyPart: null,
  exactLocation: "",
  conditionName: "",
  diagnosisStatus: "",
  evidenceStatus: "member_reported",
  primaryRelationship: "needs_review",
  alternateRelationship: "",
  relatedCondition: "",
  onsetOrEvent: "",
  actualSymptoms: "",
  actualImpact: "",
  suggestedImpactExample: "",
  appPrompts: "",
  facilityAndDate: "",
  evidenceNeeded: "",
  ratingScreen: "",
  ratingFramework: "",
  activity: "",
  limitation: "",
  frequency: "",
  severity: "",
};

function relationshipLabel(value: string) {
  return RELATIONSHIPS.find(([key]) => key === value)?.[1] ?? value;
}

export function VaConditionFormV2() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const planningDetails = useMemo(
    () =>
      [
        `Evidence status: ${form.evidenceStatus || "not set"}`,
        form.facilityAndDate ? `Evidence location/date: ${form.facilityAndDate}` : "",
        form.evidenceNeeded ? `Evidence / assessment still needed: ${form.evidenceNeeded}` : "",
        form.ratingScreen ? `Preliminary rating screen: ${form.ratingScreen}` : "",
        form.ratingFramework ? `Possible rating framework / DC: ${form.ratingFramework}` : "",
        form.suggestedImpactExample
          ? `Suggested impact example — EDIT TO ACTUAL EXPERIENCE: ${form.suggestedImpactExample}`
          : "",
        form.appPrompts ? `App prompts / guide: ${form.appPrompts}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    [form],
  );

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.conditionName.trim()) {
      setError("Condition or issue name is required.");
      return;
    }
    if (!form.bodyPart) {
      setError("Select a body location before saving.");
      return;
    }

    setSaving(true);
    try {
      const relationshipSummary = [
        `Primary relationship: ${relationshipLabel(form.primaryRelationship)}`,
        form.alternateRelationship
          ? `Alternate relationship: ${relationshipLabel(form.alternateRelationship)}`
          : "",
        form.relatedCondition ? `Related condition / event: ${form.relatedCondition}` : "",
        form.onsetOrEvent ? `Onset / service event: ${form.onsetOrEvent}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      const locationAndFlare = [
        form.exactLocation ? `Exact body location: ${form.exactLocation}` : "",
        form.frequency ? `Frequency: ${form.frequency}` : "",
        form.severity ? `Severity: ${form.severity}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      const response = await fetch("/api/va-conditions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conditionName: form.conditionName.trim(),
          bodySystem: `${form.bodyPart.name} — ${form.bodyPart.bodySystem}`,
          diagnosisStatus: form.diagnosisStatus || undefined,
          onsetOrServiceEvent: relationshipSummary || undefined,
          symptoms: form.actualSymptoms || undefined,
          flareUps: locationAndFlare || undefined,
          functionalImpactNarrative: form.actualImpact || undefined,
          treatmentHistory: planningDetails || undefined,
          claimStatus: "not_filed",
          limitations:
            form.activity && form.limitation
              ? [
                  {
                    activity: form.activity,
                    limitationDescription: form.limitation,
                    frequency: form.frequency || undefined,
                    severity: form.severity || undefined,
                  },
                ]
              : [],
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Unable to save condition");
      }

      setSuccess("Condition added to the master VA tracker.");
      setForm(EMPTY);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save condition");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Panel
      title="Add condition — structured intake"
      description="Capture the member's report now; marry it to medical records later without overwriting the original report."
    >
      <form className="space-y-6" onSubmit={submit}>
        <Alert>
          <AlertDescription>
            Keep actual symptoms separate from suggested examples. Rating screens are planning aids only and should never be used to choose or inflate symptoms.
          </AlertDescription>
        </Alert>

        <section className="space-y-3">
          <h3 className="font-semibold">1. Location</h3>
          <BodyPartSelector selectedPart={form.bodyPart} onSelect={(part) => setField("bodyPart", part)} />
          <Field
            label="Exact location / laterality"
            value={form.exactLocation}
            onChange={(value) => setField("exactLocation", value)}
            placeholder="Example: right forefoot, medial plantar ball, directly below great toe"
          />
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field
              label="Condition / issue"
              value={form.conditionName}
              onChange={(value) => setField("conditionName", value)}
              placeholder="Use the diagnosis if known; otherwise describe the issue"
              required
            />
          </div>
          <SelectField
            label="Diagnosis status"
            value={form.diagnosisStatus}
            onChange={(value) => setField("diagnosisStatus", value)}
            options={[
              ["not_diagnosed", "Not diagnosed / needs assessment"],
              ["service_diagnosed", "Diagnosed by military"],
              ["va_diagnosed", "Diagnosed by VA"],
              ["civilian_diagnosed", "Diagnosed by civilian provider"],
            ]}
          />
          <SelectField
            label="Evidence status"
            value={form.evidenceStatus}
            onChange={(value) => setField("evidenceStatus", value)}
            options={EVIDENCE_STATUSES}
          />
        </section>

        <section className="space-y-4">
          <h3 className="font-semibold">2. Claim relationship — planning theory</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Primary relationship"
              value={form.primaryRelationship}
              onChange={(value) => setField("primaryRelationship", value)}
              options={RELATIONSHIPS}
            />
            <SelectField
              label="Alternate relationship"
              value={form.alternateRelationship}
              onChange={(value) => setField("alternateRelationship", value)}
              options={[["", "None / not selected"], ...RELATIONSHIPS]}
            />
          </div>
          <Field
            label="Related condition / event / exposure"
            value={form.relatedCondition}
            onChange={(value) => setField("relatedCondition", value)}
            placeholder="Example: altered gait from right knee; airborne exposure; surgery"
          />
          <TextField
            label="Onset / service event / history"
            value={form.onsetOrEvent}
            onChange={(value) => setField("onsetOrEvent", value)}
            placeholder="Capture what is known now. Records can confirm dates and diagnoses later."
          />
        </section>

        <section className="space-y-4">
          <h3 className="font-semibold">3. Member-reported symptoms and actual impact</h3>
          <TextField
            label="Current symptoms — actual report"
            value={form.actualSymptoms}
            onChange={(value) => setField("actualSymptoms", value)}
            placeholder="Pain, numbness, tingling, locking, drainage, weakness, etc."
          />
          <TextField
            label="My actual impact to daily life / work"
            value={form.actualImpact}
            onChange={(value) => setField("actualImpact", value)}
            placeholder="Describe only what is actually experienced. This is the member's working narrative."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Frequency" value={form.frequency} onChange={(value) => setField("frequency", value)} placeholder="constant, daily, monthly, during flares..." />
            <Field label="Severity" value={form.severity} onChange={(value) => setField("severity", value)} placeholder="Example: baseline 3/10, worst 9/10" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Activity affected" value={form.activity} onChange={(value) => setField("activity", value)} placeholder="walking, sitting, lifting, sleeping..." />
            <Field label="Observable limitation" value={form.limitation} onChange={(value) => setField("limitation", value)} placeholder="What happens / what must change?" />
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
          <h3 className="font-semibold">4. Planning guidance — not a member statement</h3>
          <TextField
            label="Suggested extreme impact example"
            value={form.suggestedImpactExample}
            onChange={(value) => setField("suggestedImpactExample", value)}
            placeholder="Optional brainstorming example. It must be edited down to actual experience before claim use."
          />
          <TextField
            label="App prompts / guide"
            value={form.appPrompts}
            onChange={(value) => setField("appPrompts", value)}
            placeholder="Questions the member should answer to make the functional impact specific and measurable."
          />
        </section>

        <section className="space-y-4">
          <h3 className="font-semibold">5. Evidence and preliminary rating screen</h3>
          <Field
            label="Facility / date / record location"
            value={form.facilityAndDate}
            onChange={(value) => setField("facilityAndDate", value)}
            placeholder="No SSN or unnecessary identifiers"
          />
          <TextField
            label="Evidence / assessment still needed"
            value={form.evidenceNeeded}
            onChange={(value) => setField("evidenceNeeded", value)}
            placeholder="Imaging, ROM, PFT, audiogram, diagnosis, treatment history, nexus review..."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Preliminary rating screen"
              value={form.ratingScreen}
              onChange={(value) => setField("ratingScreen", value)}
              placeholder="Example: 10–20% screening; not predictive"
            />
            <Field
              label="Possible VA DC / framework"
              value={form.ratingFramework}
              onChange={(value) => setField("ratingFramework", value)}
              placeholder="Example: DC 5215; depends on ROM"
            />
          </div>
        </section>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
        <Button type="submit" disabled={saving} className="w-full">
          {saving ? "Saving..." : "Add to master tracker"}
        </Button>
      </form>
    </Panel>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} />
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4} />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly (readonly [string, string])[];
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={(next) => onChange(next ?? "")}>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          {options.map(([key, text]) => (
            <SelectItem key={key || "none"} value={key || "none"}>
              {text}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
