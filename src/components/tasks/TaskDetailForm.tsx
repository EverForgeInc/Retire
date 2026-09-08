"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Panel } from "@/components/ui/Panel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Task = {
  id: string;
  status: string;
  dateCompleted: string | null;
  notes: string | null;
  waitingOnWho: string | null;
  waitingOnWhat: string | null;
  followUpDate: string | null;
};

export function TaskDetailForm({ task }: { task: Task }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState(task.status);
  const [evidenceType, setEvidenceType] = useState("external_storage_reference");
  const [completeness, setCompleteness] = useState("requested");
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        waitingOnWho: form.get("waitingOnWho") || null,
        waitingOnWhat: form.get("waitingOnWhat") || null,
        followUpDate: form.get("followUpDate") || null,
        dateCompleted: form.get("dateCompleted") || null,
        notes: form.get("notes"),
      }),
    });
    setSaving(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || "Unable to update task");
      return;
    }
    setMessage("Task saved. Completion is audited automatically; initials are not used.");
    router.refresh();
  }

  async function addEvidence(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const response = await fetch("/api/evidence-references", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memberTaskId: task.id,
        evidenceType,
        confirmationNumber: form.get("confirmationNumber") || undefined,
        externalStorageLabel: form.get("externalStorageLabel") || undefined,
        summary: form.get("summary") || undefined,
        recordCategory: form.get("recordCategory") || undefined,
        completeness,
      }),
    });
    setSaving(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || "Unable to save evidence reference");
      return;
    }
    setMessage("Evidence reference saved.");
    formElement.reset();
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-6">
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(value) => value && setStatus(value)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_started">Not started</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="not_applicable">Not applicable</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="waitingOnWho">Waiting on</Label>
          <Input id="waitingOnWho" name="waitingOnWho" defaultValue={task.waitingOnWho ?? ""} placeholder="Person or office" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="waitingOnWhat">Waiting for</Label>
          <Input id="waitingOnWhat" name="waitingOnWhat" defaultValue={task.waitingOnWhat ?? ""} placeholder="Response or item" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="followUpDate">Follow-up date</Label>
          <Input id="followUpDate" name="followUpDate" type="date" defaultValue={task.followUpDate ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateCompleted">Optional completion date</Label>
          <Input
            id="dateCompleted"
            name="dateCompleted"
            type="date"
            defaultValue={task.dateCompleted ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={5}
            defaultValue={task.notes ?? ""}
            placeholder="Optional notes. Do not store passwords, SSN, or medical files here."
          />
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save task"}
        </Button>
      </form>

      <Panel
        title="Add evidence reference"
        description="Medical files stay outside the app. Store confirmations and secure-storage labels only."
      >
        <form className="space-y-3" onSubmit={addEvidence}>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={evidenceType} onValueChange={(value) => value && setEvidenceType(value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="attestation">Attestation</SelectItem>
                <SelectItem value="confirmation_number">Confirmation number</SelectItem>
                <SelectItem value="external_storage_reference">External secure storage reference</SelectItem>
                <SelectItem value="record_request_tracker">Record request tracker</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="recordCategory">Record category</Label>
            <Input
              id="recordCategory"
              name="recordCategory"
              placeholder="Administrative / medical request metadata"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmationNumber">Confirmation number</Label>
            <Input id="confirmationNumber" name="confirmationNumber" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="externalStorageLabel">External secure storage label</Label>
            <Input
              id="externalStorageLabel"
              name="externalStorageLabel"
              placeholder="MHS GENESIS download saved in encrypted personal drive"
            />
          </div>
          <div className="space-y-2">
            <Label>Completeness</Label>
            <Select value={completeness} onValueChange={(value) => value && setCompleteness(value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_requested">Not requested</SelectItem>
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="missing">Missing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea id="summary" name="summary" rows={3} />
          </div>
          <Button type="submit" variant="secondary" disabled={saving}>
            Save evidence reference
          </Button>
        </form>
      </Panel>

      {message ? (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
