"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Panel } from "@/components/ui/Panel";
import { Textarea } from "@/components/ui/textarea";

export function VaConditionForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const activity = String(form.get("activity") || "");
    const limitationDescription = String(form.get("limitationDescription") || "");
    const response = await fetch("/api/va-conditions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conditionName: form.get("conditionName"),
        bodySystem: form.get("bodySystem") || undefined,
        claimStatus: form.get("claimStatus") || undefined,
        examStatus: form.get("examStatus") || undefined,
        functionalImpactNarrative: form.get("functionalImpactNarrative") || undefined,
        limitations:
          activity && limitationDescription
            ? [
                {
                  activity,
                  limitationDescription,
                  thresholdValue: form.get("thresholdValue")
                    ? Number(form.get("thresholdValue"))
                    : undefined,
                  thresholdUnit: form.get("thresholdUnit") || undefined,
                  frequency: form.get("frequency") || undefined,
                  severity: form.get("severity") || undefined,
                },
              ]
            : [],
      }),
    });
    setSaving(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || "Unable to save condition");
      return;
    }
    event.currentTarget.reset();
    router.refresh();
  }

  return (
    <Panel
      title="Add condition"
      description='Example only (not copied automatically): knee arthritis limits walking to about 0.5 miles before you must rest.'
    >
      <form className="space-y-3" onSubmit={onSubmit}>
        <Field name="conditionName" label="Condition name" required />
        <Field name="bodySystem" label="Body system" />
        <div className="space-y-2">
          <Label htmlFor="functionalImpactNarrative">Functional impact narrative</Label>
          <Textarea
            id="functionalImpactNarrative"
            name="functionalImpactNarrative"
            rows={4}
            placeholder="Describe how this issue affects everyday life or work."
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field name="activity" label="Activity" placeholder="walking" />
          <Field name="limitationDescription" label="Limitation" />
          <Field name="thresholdValue" label="Threshold value" type="number" step="0.1" />
          <Field name="thresholdUnit" label="Threshold unit" placeholder="miles" />
          <Field name="frequency" label="Frequency" />
          <Field name="severity" label="Severity" />
          <Field name="claimStatus" label="Claim status" />
          <Field name="examStatus" label="Exam status" />
        </div>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save condition"}
        </Button>
      </form>
    </Panel>
  );
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  required,
  step,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  step?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        step={step}
      />
    </div>
  );
}
