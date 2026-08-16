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

export function RateImportForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [benefitType, setBenefitType] = useState("va_compensation");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setBusy(true);
    const form = new FormData(event.currentTarget);
    let rows: Record<string, string | number>[];
    try {
      rows = JSON.parse(String(form.get("rows") || "[]"));
    } catch {
      setBusy(false);
      setError("Rows must be valid JSON");
      return;
    }

    const response = await fetch("/api/admin/rates/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        benefitType,
        effectiveDate: form.get("effectiveDate"),
        sourceUrl: form.get("sourceUrl"),
        rows,
      }),
    });
    const data = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setError(data.error || "Import failed");
      return;
    }
    setMessage(data.message || "Staged import created");
    router.refresh();
  }

  return (
    <Panel
      title="Stage official rate import"
      description="Calculations use administrator-approved versions only. Live scraping is not used during normal user calculations."
    >
      <form className="space-y-3" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label>Benefit type</Label>
          <Select value={benefitType} onValueChange={(value) => value && setBenefitType(value)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="va_compensation">VA compensation</SelectItem>
              <SelectItem value="military_pay">Military pay</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="effectiveDate">Effective date</Label>
          <Input id="effectiveDate" name="effectiveDate" type="date" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sourceUrl">Source URL</Label>
          <Input
            id="sourceUrl"
            name="sourceUrl"
            type="url"
            required
            defaultValue="https://www.va.gov/disability/compensation-rates/"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rows">Rows JSON</Label>
          <Textarea
            id="rows"
            name="rows"
            rows={6}
            className="font-mono text-xs"
            defaultValue={JSON.stringify(
              [
                { rating: 100, dependentKey: "veteran_alone", monthlyAmount: 3737 },
                { rating: 90, dependentKey: "veteran_alone", monthlyAmount: 2241 },
              ],
              null,
              2,
            )}
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
        <Button type="submit" disabled={busy}>
          {busy ? "Staging..." : "Stage import"}
        </Button>
      </form>
    </Panel>
  );
}
