"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Panel } from "@/components/ui/Panel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type VaMatrixOption = { rating: number; monthlyAmount: number | null };

export function IncomeScenarioEditor({
  rank,
  initial,
  vaMatrix,
}: {
  rank: string | null;
  initial: {
    name: string;
    retirementSystem: string;
    high3Monthly: number | null;
    yearsService: number | null;
    multiplier: number | null;
    memberVaRating: number | null;
    civilianIncome: number | null;
    otherIncome: number | null;
  };
  vaMatrix: VaMatrixOption[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [rating, setRating] = useState(String(initial.memberVaRating ?? 0));
  const selectedVa = useMemo(() => vaMatrix.find((item) => item.rating === Number(rating))?.monthlyAmount ?? 0, [rating, vaMatrix]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const multiplierPercent = Number(form.get("multiplierPercent") || 0);
    const response = await fetch("/api/income", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name") || "Primary retirement scenario"),
        retirementSystem: String(form.get("retirementSystem") || "High-3"),
        high3Monthly: Number(form.get("high3Monthly") || 0),
        yearsService: Number(form.get("yearsService") || 0),
        multiplier: multiplierPercent / 100,
        memberVaRating: Number(rating),
        civilianIncome: Number(form.get("civilianIncome") || 0),
        otherIncome: Number(form.get("otherIncome") || 0),
      }),
    });
    setSaving(false);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(data.error || "Unable to save income assumptions.");
      return;
    }
    setMessage("Income assumptions saved. Retired pay and VA pay were recalculated from the inputs below.");
    router.refresh();
  }

  return (
    <Panel title="Edit income assumptions" description="These are planning inputs. Change them here instead of wondering where the numbers came from.">
      <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">Scenario name</Label>
          <Input id="name" name="name" defaultValue={initial.name} />
        </div>
        <div className="space-y-2">
          <Label>Rank / pay grade</Label>
          <Input value={rank || "Not set"} readOnly />
          <p className="text-xs text-muted-foreground">Update rank/pay grade in your profile. It is shown here so the pay estimate has context.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="retirementSystem">Retirement system</Label>
          <Select name="retirementSystem" defaultValue={initial.retirementSystem || "High-3"}>
            <SelectTrigger id="retirementSystem"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="High-3">High-3 / legacy</SelectItem>
              <SelectItem value="BRS">Blended Retirement System</SelectItem>
              <SelectItem value="Other">Other / manual planning</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="high3Monthly">High-3 average monthly basic pay</Label>
          <Input id="high3Monthly" name="high3Monthly" type="number" min="0" step="0.01" defaultValue={initial.high3Monthly ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="yearsService">Years of service used in calculation</Label>
          <Input id="yearsService" name="yearsService" type="number" min="0" step="0.01" defaultValue={initial.yearsService ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="multiplierPercent">Multiplier per year (%)</Label>
          <Input id="multiplierPercent" name="multiplierPercent" type="number" min="0" step="0.1" defaultValue={initial.multiplier != null ? initial.multiplier * 100 : 2.5} />
          <p className="text-xs text-muted-foreground">Example: 2.5% for legacy High-3; verify the multiplier that applies to your retirement system.</p>
        </div>
        <div className="space-y-2">
          <Label>VA planning rating</Label>
          <Select value={rating} onValueChange={(value) => value && setRating(value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{vaMatrix.map((item) => <SelectItem key={item.rating} value={String(item.rating)}>{item.rating}%{item.monthlyAmount != null ? ` — $${item.monthlyAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}/mo` : " — rate unavailable"}</SelectItem>)}</SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">VA amount uses the same approved table shown below for the displayed dependent scenario.</p>
        </div>
        <div className="space-y-2">
          <Label>Calculated member VA pay</Label>
          <Input value={`$${selectedVa.toLocaleString("en-US", { maximumFractionDigits: 2 })} / month`} readOnly />
        </div>
        <div className="space-y-2">
          <Label htmlFor="civilianIncome">Civilian monthly income</Label>
          <Input id="civilianIncome" name="civilianIncome" type="number" min="0" step="0.01" defaultValue={initial.civilianIncome ?? 0} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="otherIncome">Other monthly income</Label>
          <Input id="otherIncome" name="otherIncome" type="number" min="0" step="0.01" defaultValue={initial.otherIncome ?? 0} />
        </div>
        <div className="md:col-span-2">
          <Button type="submit" disabled={saving}>{saving ? "Saving assumptions..." : "Save and recalculate"}</Button>
          {message ? <p className="mt-2 text-sm text-muted-foreground" role="status">{message}</p> : null}
        </div>
      </form>
    </Panel>
  );
}
