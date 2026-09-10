"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { buttonVariants, Button } from "@/components/ui/button";
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

type LookupResult = {
  providerPlaceId?: string;
  displayName?: string;
  city: string;
  state?: string;
  country: string;
  countryCode: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  source: string;
  currency?: string;
};

const EMPTY_FORM = {
  displayName: "",
  city: "",
  state: "",
  country: "",
  countryCode: "",
  postalCode: "",
  providerPlaceId: "",
  currency: "USD",
  latitude: undefined as number | undefined,
  longitude: undefined as number | undefined,
  isPreferred: false,
};

export function LocationBrowser({ locations, savedLocations }: { locations: LocationCard[]; savedLocations: SavedLocationCard[] }) {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("all");
  const [saved, setSaved] = useState(savedLocations);
  const [form, setForm] = useState(EMPTY_FORM);
  const [message, setMessage] = useState<string | null>(null);
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupResults, setLookupResults] = useState<LookupResult[]>([]);
  const [lookupBusy, setLookupBusy] = useState(false);

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

  async function searchLocations() {
    const q = lookupQuery.trim();
    if (q.length < 2) {
      setMessage("Enter at least two characters to search for a location.");
      return;
    }
    setLookupBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/location-search?q=${encodeURIComponent(q)}`);
      if (!response.ok) throw new Error("lookup failed");
      const data = await response.json();
      setLookupResults(data.results ?? []);
      if ((data.results ?? []).length === 0) setMessage("No matching locations found. You can still enter the location manually.");
    } catch {
      setMessage("Automatic lookup is temporarily unavailable. Manual entry is still available.");
    } finally {
      setLookupBusy(false);
    }
  }

  function chooseLookupResult(result: LookupResult) {
    setForm((current) => ({
      ...current,
      displayName: result.displayName ?? "",
      city: result.city,
      state: result.state ?? "",
      country: result.country,
      countryCode: result.countryCode,
      postalCode: result.postalCode ?? "",
      providerPlaceId: result.providerPlaceId ?? "",
      currency: result.currency ?? current.currency,
      latitude: result.latitude,
      longitude: result.longitude,
    }));
    setLookupResults([]);
    setMessage(result.currency ? "Location details filled automatically. Review and save." : "Location details filled automatically. Please confirm the currency before saving.");
  }

  return (
    <div className="space-y-4">
      <Panel
        title="My retirement locations"
        description="Search for a city to fill location details automatically, or enter them manually. Cost values remain blank until an approved source or manual override is provided."
      >
        <div className="mb-4 rounded-lg border bg-muted/20 p-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={lookupQuery}
              onChange={(event) => setLookupQuery(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void searchLocations(); } }}
              placeholder="Search city, state, or country"
              aria-label="Automatic retirement location search"
            />
            <Button type="button" variant="outline" disabled={lookupBusy} onClick={() => void searchLocations()}>
              {lookupBusy ? "Searching..." : "Find location"}
            </Button>
          </div>
          {lookupResults.length > 0 ? (
            <div className="mt-3 grid gap-2">
              {lookupResults.map((result) => (
                <button
                  key={`${result.providerPlaceId ?? result.displayName}-${result.city}`}
                  type="button"
                  className="rounded-md border bg-background p-3 text-left text-sm hover:bg-muted/50"
                  onClick={() => chooseLookupResult(result)}
                >
                  <strong>{result.city}</strong>{result.state ? `, ${result.state}` : ""} · {result.country}
                  {result.displayName ? <span className="mt-1 block text-xs text-muted-foreground">{result.displayName}</span> : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <form className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6" onSubmit={async (event) => {
          event.preventDefault();
          setMessage(null);
          const response = await fetch("/api/locations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
          if (!response.ok) { setMessage("Unable to save location."); return; }
          const data = await response.json();
          setSaved((current) => form.isPreferred ? [data.location, ...current.map((item) => ({ ...item, isPreferred: false }))] : [data.location, ...current]);
          setForm(EMPTY_FORM);
          setLookupQuery("");
          setMessage("Location saved.");
        }}>
          <Input required placeholder="City" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} aria-label="New location city" />
          <Input placeholder="State or region" value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} aria-label="New location state" />
          <Input required placeholder="Country" value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} aria-label="New location country" />
          <Input required maxLength={2} placeholder="US" value={form.countryCode} onChange={(event) => setForm({ ...form, countryCode: event.target.value.toUpperCase() })} aria-label="New location country code" />
          <Input required maxLength={3} placeholder="USD" value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value.toUpperCase() })} aria-label="New location currency" />
          <Button type="submit">Add location</Button>
          <label className="flex items-center gap-2 text-sm sm:col-span-2 lg:col-span-6"><input type="checkbox" checked={form.isPreferred} onChange={(event) => setForm({ ...form, isPreferred: event.target.checked })} /> Make preferred location</label>
        </form>
        {message ? <p className="mt-3 text-sm text-muted-foreground" role="status">{message}</p> : null}
        {saved.length > 0 ? <div className="mt-4 grid gap-2 sm:grid-cols-2">{saved.map((location) => <div key={location.id} className="flex items-center justify-between rounded-lg border p-3 text-sm"><span><strong>{location.city}</strong>{location.state ? `, ${location.state}` : ""} · {location.country}{location.isPreferred ? " · Preferred" : ""}</span><button type="button" className="text-destructive underline" onClick={async () => { const response = await fetch(`/api/locations/${location.id}`, { method: "DELETE" }); if (response.ok) setSaved((current) => current.filter((item) => item.id !== location.id)); }}>Remove</button></div>)}</div> : null}
      </Panel>

      <Panel
        title="Saved locations"
        description="Open Income Planner for ranked remaining-cash comparisons with source provenance."
        action={<Link href="/income" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>Open income planner</Link>}
      >
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search city or region" aria-label="Search locations" className="sm:flex-1" />
          <Select value={country} onValueChange={(value) => setCountry(value ?? "all")}>
            <SelectTrigger className="sm:w-48" aria-label="Filter by country"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All countries</SelectItem>
              {countries.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="No matching locations" description="Try a different country or search term." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((location) => (
              <article key={location.id} className="rounded-xl border border-border/70 p-4">
                <h2 className="font-semibold">{location.city}{location.region ? `, ${location.region}` : ""}</h2>
                <p className="text-sm text-muted-foreground">{location.country} · {location.currency}</p>
                <Badge variant="secondary" className="mt-3">{location.approvedCostCount} approved cost categories</Badge>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
