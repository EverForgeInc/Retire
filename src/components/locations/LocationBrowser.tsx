"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState, Panel } from "@/components/ui/Panel";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type LocationCard = {
  id: string;
  city: string;
  region: string | null;
  country: string;
  currency: string;
  approvedCostCount: number;
};

export type SavedLocationCard = {
  id: string;
  city: string;
  state: string | null;
  country: string;
  countryCode: string;
  currency: string;
  isPreferred: boolean;
};

export function LocationBrowser({ locations, savedLocations }: { locations: LocationCard[]; savedLocations: SavedLocationCard[] }) {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("all");
  const [saved, setSaved] = useState(savedLocations);
  const [form, setForm] = useState({ city: "", state: "", country: "", countryCode: "", currency: "USD", isPreferred: false });
  const [message, setMessage] = useState<string | null>(null);

  const countries = useMemo(
    () => Array.from(new Set(locations.map((l) => l.country))).sort(),
    [locations],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return locations.filter((location) => {
      if (country !== "all" && location.country !== country) return false;
      if (!q) return true;
      const haystack = `${location.city} ${location.region ?? ""} ${location.country}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [locations, query, country]);

  return (
    <div className="space-y-4">
    <Panel
      title="My retirement locations"
      description="Add locations to your private list. Cost values remain blank until an approved source or manual override is provided."
    >
      <form className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6" onSubmit={async (event) => {
        event.preventDefault();
        setMessage(null);
        const response = await fetch("/api/locations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        if (!response.ok) { setMessage("Unable to save location."); return; }
        const data = await response.json();
        setSaved((current) => form.isPreferred ? [data.location, ...current.map((item) => ({ ...item, isPreferred: false }))] : [data.location, ...current]);
        setForm({ city: "", state: "", country: "", countryCode: "", currency: "USD", isPreferred: false });
        setMessage("Location saved.");
      }}>
        <Input required placeholder="City" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} aria-label="New location city" />
        <Input placeholder="State or region" value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} aria-label="New location state" />
        <Input required placeholder="Country" value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} aria-label="New location country" />
        <Input required maxLength={2} placeholder="US" value={form.countryCode} onChange={(event) => setForm({ ...form, countryCode: event.target.value })} aria-label="New location country code" />
        <Input required maxLength={3} placeholder="USD" value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })} aria-label="New location currency" />
        <Button type="submit">Add location</Button>
        <label className="flex items-center gap-2 text-sm sm:col-span-2 lg:col-span-6"><input type="checkbox" checked={form.isPreferred} onChange={(event) => setForm({ ...form, isPreferred: event.target.checked })} /> Make preferred location</label>
      </form>
      {message ? <p className="mt-3 text-sm text-muted-foreground" role="status">{message}</p> : null}
      {saved.length > 0 ? <div className="mt-4 grid gap-2 sm:grid-cols-2">{saved.map((location) => <div key={location.id} className="flex items-center justify-between rounded-lg border p-3 text-sm"><span><strong>{location.city}</strong>{location.state ? `, ${location.state}` : ""} · {location.country}{location.isPreferred ? " · Preferred" : ""}</span><button type="button" className="text-destructive underline" onClick={async () => { const response = await fetch(`/api/locations/${location.id}`, { method: "DELETE" }); if (response.ok) setSaved((current) => current.filter((item) => item.id !== location.id)); }}>Remove</button></div>)}</div> : null}
    </Panel>
    <Panel
      title="Saved locations"
      description="Open Income Planner for ranked remaining-cash comparisons with source provenance."
      action={
        <Link href="/income" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          Open income planner
        </Link>
      }
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search city or region"
          aria-label="Search locations"
          className="sm:flex-1"
        />
        <Select value={country} onValueChange={(value) => setCountry(value ?? "all")}>
          <SelectTrigger className="sm:w-48" aria-label="Filter by country">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All countries</SelectItem>
            {countries.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No matching locations"
          description="Try a different country or search term."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((location) => (
            <article key={location.id} className="rounded-xl border border-border/70 p-4">
              <h2 className="font-semibold">
                {location.city}
                {location.region ? `, ${location.region}` : ""}
              </h2>
              <p className="text-sm text-muted-foreground">
                {location.country} · {location.currency}
              </p>
              <Badge variant="secondary" className="mt-3">
                {location.approvedCostCount} approved cost categories
              </Badge>
            </article>
          ))}
        </div>
      )}
    </Panel>
    </div>
  );
}
