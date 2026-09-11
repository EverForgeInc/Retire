"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buttonVariants, Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState, Panel } from "@/components/ui/Panel";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type LocationCard = { id: string; city: string; region: string | null; country: string; currency: string; approvedCostCount: number };
export type SavedLocationCard = { id: string; city: string; state: string | null; country: string; countryCode: string; currency: string; isPreferred: boolean };
type LookupResult = { providerPlaceId?: string; displayName?: string; city: string; state?: string; country: string; countryCode: string; postalCode?: string; latitude?: number; longitude?: number; source: string; currency?: string };
type CostPreview = { category: string; amountUsd: number; currency: string; source: string; retrievedAt: string };
type InternationalBenchmark = { kind: "country_price_level_index"; value: number; year: number; countryName: string; source: string; retrievedAt: string; license: string; note: string };
type InternationalCategoryBenchmark = { category: string; label: string; value: number; year: number; base: string; source: string; retrievedAt: string; license: string; note: string };

const EMPTY_FORM = { displayName: "", city: "", state: "", country: "", countryCode: "", postalCode: "", providerPlaceId: "", currency: "USD", latitude: undefined as number | undefined, longitude: undefined as number | undefined, isPreferred: false };
const COST_LABELS: Record<string, string> = {
  housing: "Housing / rent",
  groceries: "Groceries",
  electricity: "Electricity",
  internet: "Internet",
  utilities: "Other utilities (combined)",
  transportation: "Transportation",
  estimated_total: "Estimated monthly total",
};

export function LocationBrowser({ locations, savedLocations }: { locations: LocationCard[]; savedLocations: SavedLocationCard[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("all");
  const [saved, setSaved] = useState(savedLocations);
  const [form, setForm] = useState(EMPTY_FORM);
  const [message, setMessage] = useState<string | null>(null);
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupResults, setLookupResults] = useState<LookupResult[]>([]);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [previewBusyId, setPreviewBusyId] = useState<string | null>(null);
  const [adoptBusyId, setAdoptBusyId] = useState<string | null>(null);
  const [costPreviews, setCostPreviews] = useState<Record<string, CostPreview[]>>({});
  const [internationalBenchmarks, setInternationalBenchmarks] = useState<Record<string, InternationalBenchmark | null>>({});
  const [internationalCategories, setInternationalCategories] = useState<Record<string, InternationalCategoryBenchmark[]>>({});
  const [previewMessages, setPreviewMessages] = useState<Record<string, string>>({});

  const countries = useMemo(() => Array.from(new Set(locations.map((l) => l.country))).sort(), [locations]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return locations.filter((location) => {
      if (country !== "all" && location.country !== country) return false;
      if (!q) return true;
      return `${location.city} ${location.region ?? ""} ${location.country}`.toLowerCase().includes(q);
    });
  }, [locations, query, country]);

  async function searchLocations() {
    const q = lookupQuery.trim();
    if (q.length < 2) { setMessage("Enter at least two characters to search for a location."); return; }
    setLookupBusy(true); setMessage(null);
    try {
      const response = await fetch(`/api/location-search?q=${encodeURIComponent(q)}`);
      if (!response.ok) throw new Error("lookup failed");
      const data = await response.json();
      setLookupResults(data.results ?? []);
      if ((data.results ?? []).length === 0) setMessage("No matching locations found. You can still enter the location manually.");
    } catch { setMessage("Automatic lookup is temporarily unavailable. Manual entry is still available."); }
    finally { setLookupBusy(false); }
  }

  async function previewCosts(location: SavedLocationCard) {
    setPreviewBusyId(location.id);
    setPreviewMessages((current) => ({ ...current, [location.id]: "" }));
    try {
      const response = await fetch(`/api/location-cost-preview?savedLocationId=${encodeURIComponent(location.id)}`);
      if (!response.ok) throw new Error("preview failed");
      const data = await response.json();
      const costs = (data.costs ?? []) as CostPreview[];
      const benchmark = (data.benchmark ?? null) as InternationalBenchmark | null;
      const categoryBenchmarks = (data.categoryBenchmarks ?? []) as InternationalCategoryBenchmark[];
      setCostPreviews((current) => ({ ...current, [location.id]: costs }));
      setInternationalBenchmarks((current) => ({ ...current, [location.id]: benchmark }));
      setInternationalCategories((current) => ({ ...current, [location.id]: categoryBenchmarks }));
      if (categoryBenchmarks.length > 0) {
        const latestYear = Math.max(...categoryBenchmarks.map((item) => item.year));
        setPreviewMessages((current) => ({ ...current, [location.id]: `Relative price comparison by category · OECD · ${latestYear}. These are comparison indexes, not monthly bills.` }));
      } else if (benchmark) {
        setPreviewMessages((current) => ({ ...current, [location.id]: `Overall household price comparison · World Bank · ${benchmark.year} · ${benchmark.license}` }));
      } else if (!data.supported || costs.length === 0) {
        setPreviewMessages((current) => ({ ...current, [location.id]: data.reason ?? "No free public data was available for this location." }));
      } else {
        setPreviewMessages((current) => ({ ...current, [location.id]: "Free monthly cost preview · CostOfLivingData.com · CC BY 4.0" }));
      }
    } catch {
      setPreviewMessages((current) => ({ ...current, [location.id]: "The free data preview could not be loaded. Your saved location and manual costs were not changed." }));
    } finally { setPreviewBusyId(null); }
  }

  async function adoptCosts(location: SavedLocationCard) {
    setAdoptBusyId(location.id);
    setPreviewMessages((current) => ({ ...current, [location.id]: "" }));
    try {
      const response = await fetch("/api/location-cost-adopt", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ savedLocationId: location.id }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "adoption failed");
      setPreviewMessages((current) => ({ ...current, [location.id]: `${data.adopted?.length ?? 0} verified monthly categories adopted. Reference totals and combined utility values are excluded when they would double count itemized costs.` }));
      router.refresh();
    } catch (error) {
      setPreviewMessages((current) => ({ ...current, [location.id]: error instanceof Error ? error.message : "Unable to adopt these estimates." }));
    } finally { setAdoptBusyId(null); }
  }

  function chooseLookupResult(result: LookupResult) {
    setForm((current) => ({ ...current, displayName: result.displayName ?? "", city: result.city, state: result.state ?? "", country: result.country, countryCode: result.countryCode, postalCode: result.postalCode ?? "", providerPlaceId: result.providerPlaceId ?? "", currency: result.currency ?? current.currency, latitude: result.latitude, longitude: result.longitude }));
    setLookupResults([]);
    setMessage(result.currency ? "Location details filled automatically in English when the provider supplies an English name. Review and save." : "Location details filled automatically. Please confirm the currency before saving.");
  }

  return (
    <div className="space-y-4">
      <Panel title="My retirement locations" description="Search for a city to fill location details automatically. U.S. locations can adopt free monthly estimates; international locations use relative price comparisons when free reusable data is available.">
        <div className="mb-4 rounded-lg border bg-muted/20 p-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input value={lookupQuery} onChange={(event) => setLookupQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void searchLocations(); } }} placeholder="Search city, state, or country" aria-label="Automatic retirement location search" />
            <Button type="button" variant="outline" disabled={lookupBusy} onClick={() => void searchLocations()}>{lookupBusy ? "Searching..." : "Find location"}</Button>
          </div>
          {lookupResults.length > 0 ? <div className="mt-3 grid gap-2">{lookupResults.map((result) => (
            <button key={`${result.providerPlaceId ?? result.displayName}-${result.city}`} type="button" className="rounded-md border bg-background p-3 text-left text-sm hover:bg-muted/50" onClick={() => chooseLookupResult(result)}>
              <strong>{result.city}</strong>{result.state ? `, ${result.state}` : ""} · {result.country}
              {result.displayName ? <span className="mt-1 block text-xs text-muted-foreground">{result.displayName}</span> : null}
            </button>
          ))}</div> : null}
        </div>

        <form className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6" onSubmit={async (event) => {
          event.preventDefault(); setMessage(null);
          const response = await fetch("/api/locations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
          if (!response.ok) { setMessage("Unable to save location."); return; }
          const data = await response.json();
          setSaved((current) => form.isPreferred ? [data.location, ...current.map((item) => ({ ...item, isPreferred: false }))] : [data.location, ...current]);
          setForm(EMPTY_FORM); setLookupQuery(""); setMessage("Location saved.");
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

        {saved.length > 0 ? <div className="mt-4 grid gap-3 md:grid-cols-2">{saved.map((location) => {
          const preview = costPreviews[location.id] ?? [];
          const benchmark = internationalBenchmarks[location.id] ?? null;
          const categoryBenchmarks = internationalCategories[location.id] ?? [];
          return (
            <article key={location.id} className="rounded-lg border p-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <div><strong>{location.city}</strong>{location.state ? `, ${location.state}` : ""} · {location.country}{location.isPreferred ? <span className="block text-xs text-muted-foreground">Preferred location</span> : null}</div>
                <button type="button" className="text-destructive underline" onClick={async () => { const response = await fetch(`/api/locations/${location.id}`, { method: "DELETE" }); if (response.ok) setSaved((current) => current.filter((item) => item.id !== location.id)); }}>Remove</button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline" disabled={previewBusyId === location.id || adoptBusyId === location.id} onClick={() => void previewCosts(location)}>{previewBusyId === location.id ? "Checking free data..." : location.countryCode === "US" ? "Preview free cost data" : "Preview relative costs"}</Button>
                {preview.length > 0 && location.countryCode === "US" ? <Button type="button" size="sm" disabled={adoptBusyId === location.id || previewBusyId === location.id} onClick={() => void adoptCosts(location)}>{adoptBusyId === location.id ? "Adopting..." : "Use these estimates"}</Button> : null}
              </div>
              {previewMessages[location.id] ? <p className="mt-2 text-xs text-muted-foreground">{previewMessages[location.id]}</p> : null}

              {categoryBenchmarks.length > 0 ? (
                <div className="mt-3">
                  <div className="mb-2 flex items-center justify-between"><div className="font-medium">Relative cost by category</div><span className="text-xs text-muted-foreground">Comparison indexes</span></div>
                  <div className="grid grid-cols-2 gap-2">
                    {categoryBenchmarks.map((item) => (
                      <div key={item.category} className={cn("rounded-md border p-2", item.category === "overall" && "col-span-2 bg-muted/30")}>
                        <div className="text-xs text-muted-foreground">{item.label}</div>
                        <div className="font-semibold">{item.value.toLocaleString("en-US", { maximumFractionDigits: 1 })}</div>
                        <div className="text-[11px] text-muted-foreground">{item.year} · comparison base: {item.base || "OECD"}</div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">These numbers tell you whether a category is relatively more or less expensive than the published comparison base. They are not dollar amounts and are not added to your monthly budget.</p>
                  <a className="mt-1 inline-block text-xs underline" href={categoryBenchmarks[0].source} target="_blank" rel="noreferrer">View OECD source</a>
                </div>
              ) : null}

              {benchmark ? <div className="mt-3 rounded-md border bg-muted/30 p-3">
                <div className="text-xs text-muted-foreground">Overall household price comparison</div>
                <div className="text-xl font-semibold">{benchmark.value.toLocaleString("en-US", { maximumFractionDigits: 1 })}</div>
                <div className="mt-1 text-xs text-muted-foreground">{benchmark.countryName} · {benchmark.year}. This is a relative price-level indicator, not a monthly expense. {benchmark.note}</div>
                <a className="mt-2 inline-block text-xs underline" href={benchmark.source} target="_blank" rel="noreferrer">View World Bank source</a>
              </div> : null}

              {preview.length > 0 ? <div className="mt-3 grid grid-cols-2 gap-2">{preview.map((cost) => (
                <div key={cost.category} className={cn("rounded-md border p-2", cost.category === "estimated_total" && "col-span-2 bg-muted/30")}>
                  <div className="text-xs text-muted-foreground">{COST_LABELS[cost.category] ?? cost.category.replace(/_/g, " ")}</div>
                  <div className="font-semibold">${cost.amountUsd.toLocaleString("en-US", { maximumFractionDigits: 0 })}/mo</div>
                  {cost.category === "housing" ? <div className="text-[11px] text-muted-foreground">Generic rent estimate. No bedroom count is assumed unless the source specifically states one.</div> : null}
                  {cost.category === "utilities" ? <div className="text-[11px] text-muted-foreground">Combined only when the source does not provide a reliable electricity/internet split.</div> : null}
                  {cost.category === "estimated_total" ? <div className="text-[11px] text-muted-foreground">Reference only; not added again to planner expenses.</div> : null}
                </div>
              ))}<a className="col-span-2 text-xs underline" href={preview[0].source} target="_blank" rel="noreferrer">View source data</a></div> : null}
            </article>
          );
        })}</div> : null}
      </Panel>

      <Panel title="Saved locations" description="Cost categories become available only after source data is reviewed/adopted. Missing data stays unknown instead of being treated as $0." action={<Link href="/income" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>Open income planner</Link>}>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search city or region" aria-label="Search locations" className="sm:flex-1" />
          <Select value={country} onValueChange={(value) => setCountry(value ?? "all")}><SelectTrigger className="sm:w-48" aria-label="Filter by country"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All countries</SelectItem>{countries.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
        </div>
        {filtered.length === 0 ? <EmptyState title="No matching locations" description="Try a different country or search term." /> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{filtered.map((location) => <article key={location.id} className="rounded-xl border border-border/70 p-4"><h2 className="font-semibold">{location.city}{location.region ? `, ${location.region}` : ""}</h2><p className="text-sm text-muted-foreground">{location.country} · {location.currency}</p>{location.approvedCostCount > 0 ? <Badge variant="secondary" className="mt-3">{location.approvedCostCount} cost categories ready</Badge> : <Badge variant="outline" className="mt-3">Cost data not yet adopted</Badge>}</article>)}</div>}
      </Panel>
    </div>
  );
}
