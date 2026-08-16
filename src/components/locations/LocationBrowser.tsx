"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
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

export function LocationBrowser({ locations }: { locations: LocationCard[] }) {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("all");

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
  );
}
