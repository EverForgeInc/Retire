"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Switch } from "@/components/ui/switch";

type Prefs = {
  cadence: string;
  deliveryLocalTime: string;
  weeklyDay: number | null;
  timezone: string;
  includeActivePhase: boolean;
  includeOverdue: boolean;
  includeWaiting: boolean;
  upcomingDays: number;
  sendEmptyDigest: boolean;
};

export function DigestSettingsForm({ initial }: { initial: Prefs }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cadence, setCadence] = useState(initial.cadence);
  const [includeActivePhase, setIncludeActivePhase] = useState(initial.includeActivePhase);
  const [includeOverdue, setIncludeOverdue] = useState(initial.includeOverdue);
  const [includeWaiting, setIncludeWaiting] = useState(initial.includeWaiting);
  const [sendEmptyDigest, setSendEmptyDigest] = useState(initial.sendEmptyDigest);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/notification-preferences/digest", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cadence,
        deliveryLocalTime: form.get("deliveryLocalTime"),
        weeklyDay: cadence === "weekly" ? Number(form.get("weeklyDay")) : null,
        timezone: form.get("timezone"),
        includeActivePhase,
        includeOverdue,
        includeWaiting,
        upcomingDays: Number(form.get("upcomingDays") || 7),
        sendEmptyDigest,
      }),
    });
    setBusy(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || "Unable to save preferences");
      return;
    }
    setMessage("Digest preferences saved.");
    router.refresh();
  }

  async function sendTest() {
    setMessage(null);
    setError(null);
    setBusy(true);
    const response = await fetch("/api/notification-preferences/digest/test", { method: "POST" });
    const data = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setError(data.error || "Unable to queue test digest");
      return;
    }
    setMessage(
      `Test digest ${data.queued ? "queued" : "skipped"} with ${data.preview?.taskCount ?? 0} tasks.`,
    );
    router.refresh();
  }

  return (
    <Panel
      title="Checklist digest email"
      description="Digests include neutral checklist titles and deep links only. Medical and VA narratives are never emailed."
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label>Cadence</Label>
          <Select value={cadence} onValueChange={(value) => value && setCadence(value)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="off">Off</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="deliveryLocalTime">Delivery time (local)</Label>
          <Input
            id="deliveryLocalTime"
            name="deliveryLocalTime"
            type="time"
            defaultValue={initial.deliveryLocalTime}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weeklyDay">Weekly day (0=Sunday)</Label>
          <Input
            id="weeklyDay"
            name="weeklyDay"
            type="number"
            min={0}
            max={6}
            defaultValue={initial.weeklyDay ?? 1}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone">Time zone</Label>
          <Input id="timezone" name="timezone" defaultValue={initial.timezone} />
        </div>
        <div className="space-y-3 rounded-xl border border-border/70 p-3">
          <ToggleRow
            id="includeActivePhase"
            label="Include active-phase tasks"
            checked={includeActivePhase}
            onCheckedChange={setIncludeActivePhase}
          />
          <ToggleRow
            id="includeOverdue"
            label="Include overdue tasks"
            checked={includeOverdue}
            onCheckedChange={setIncludeOverdue}
          />
          <div className="flex items-center gap-2">
            <Checkbox
              id="includeWaiting"
              checked={includeWaiting}
              onCheckedChange={(value) => setIncludeWaiting(value === true)}
            />
            <Label htmlFor="includeWaiting">Include waiting tasks</Label>
          </div>
          <ToggleRow
            id="sendEmptyDigest"
            label="Send email when nothing is due"
            checked={sendEmptyDigest}
            onCheckedChange={setSendEmptyDigest}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="upcomingDays">Upcoming look-ahead days</Label>
          <Input
            id="upcomingDays"
            name="upcomingDays"
            type="number"
            min={0}
            max={90}
            defaultValue={initial.upcomingDays}
          />
        </div>
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
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={busy}>
            Save preferences
          </Button>
          <Button type="button" variant="secondary" disabled={busy} onClick={sendTest}>
            Send test digest
          </Button>
        </div>
      </form>
    </Panel>
  );
}

function ToggleRow({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label htmlFor={id}>{label}</Label>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
