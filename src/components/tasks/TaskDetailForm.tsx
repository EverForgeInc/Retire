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

const EVIDENCE_HELP: Record<string, string> = {
  attestation: "Use this when your own confirmation that an action was completed is sufficient.",
  confirmation_number: "Use this when an office or website gave you a confirmation, case, or request number.",
  external_storage_reference: "Use this when the actual file is stored somewhere secure outside this app. Enter a simple label describing where you saved it; do not paste passwords, SSNs, or sensitive medical content here.",
  record_request_tracker: "Use this to track a request for records while you wait for the records to arrive.",
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
        waitingOnWho: status === "waiting" ? form.get("waitingOnWho") || null : null,
        waitingOnWhat: status === "waiting" ? form.get("waitingOnWhat") || null : null,
        followUpDate: status === "waiting" ? form.get("followUpDate") || null : null,
        dateCompleted: status === "complete" ? form.get("dateCompleted") || null : null,
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
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="not_started">Not started</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="not_applicable">Not applicable</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {status === "waiting" ? (
          <div className="space-y-4 rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Waiting details are only needed while a task is in Waiting status.</p>
            <div className="space-y-2"><Label htmlFor="waitingOnWho">Waiting on</Label><Input id="waitingOnWho" name="waitingOnWho" defaultValue={task.waitingOnWho ?? ""} placeholder="Person or office" /></div>
            <div className="space-y-2"><Label htmlFor="waitingOnWhat">Waiting for</Label><Input id="waitingOnWhat" name="waitingOnWhat" defaultValue={task.waitingOnWhat ?? ""} placeholder="Response or item" /></div>
            <div className="space-y-2"><Label htmlFor="followUpDate">Follow-up date</Label><Input id="followUpDate" name="followUpDate" type="date" defaultValue={task.followUpDate ?? ""} /></div>
          </div>
        ) : null}

        {status === "complete" ? (
          <div className="space-y-2"><Label htmlFor="dateCompleted">Completion date</Label><Input id="dateCompleted" name="dateCompleted" type="date" defaultValue={task.dateCompleted ?? ""} /><p className="text-xs text-muted-foreground">Leave blank when first marking complete and the app will record today automatically.</p></div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" rows={5} defaultValue={task.notes ?? ""} placeholder="Optional notes. Do not store passwords, SSN, or medical files here." />
        </div>
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save task"}</Button>
      </form>

      <Panel
        title="Add evidence reference"
        description="This records proof that something exists or was requested. It does not upload the sensitive file itself."
      >
        <form className="space-y-3" onSubmit={addEvidence}>
          <div className="space-y-2">
            <Label>What kind of evidence are you tracking?</Label>
            <Select value={evidenceType} onValueChange={(value) => value && setEvidenceType(value)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="attestation">Personal confirmation</SelectItem>
                <SelectItem value="confirmation_number">Confirmation or case number</SelectItem>
                <SelectItem value="external_storage_reference">File stored securely outside the app</SelectItem>
                <SelectItem value="record_request_tracker">Records request tracker</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{EVIDENCE_HELP[evidenceType]}</p>
          </div>
          <div className="space-y-2"><Label htmlFor="recordCategory">Record category</Label><Input id="recordCategory" name="recordCategory" placeholder="Example: retirement orders, medical records request, finance confirmation" /></div>
          <div className="space-y-2"><Label htmlFor="confirmationNumber">Confirmation or case number</Label><Input id="confirmationNumber" name="confirmationNumber" /></div>
          <div className="space-y-2"><Label htmlFor="externalStorageLabel">Where is the file stored?</Label><Input id="externalStorageLabel" name="externalStorageLabel" placeholder="Example: encrypted personal drive / VA folder" /><p className="text-xs text-muted-foreground">Enter only a label that helps you find the file later. Do not enter passwords or sensitive record contents.</p></div>
          <div className="space-y-2">
            <Label>Record status</Label>
            <Select value={completeness} onValueChange={(value) => value && setCompleteness(value)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="not_requested">Not requested</SelectItem>
                <SelectItem value="requested">Requested / waiting</SelectItem>
                <SelectItem value="partial">Partially received</SelectItem>
                <SelectItem value="complete">Complete / received</SelectItem>
                <SelectItem value="missing">Missing / needs follow-up</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label htmlFor="summary">Notes about this reference</Label><Textarea id="summary" name="summary" rows={3} /></div>
          <Button type="submit" variant="secondary" disabled={saving}>Save evidence reference</Button>
        </form>
      </Panel>

      {message ? <Alert><AlertDescription>{message}</AlertDescription></Alert> : null}
      {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
    </div>
  );
}
