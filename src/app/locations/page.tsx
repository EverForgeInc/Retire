import { AppShell } from "@/components/layout/AppShell";
import { LocationBrowser } from "@/components/locations/LocationBrowser";
import { Panel } from "@/components/ui/Panel";
import { prisma } from "@/lib/db";
import { getDashboardForPage } from "@/lib/server-data";

export default async function LocationsPage() {
  const { ctx, dashboard } = await getDashboardForPage();
  const locations = await prisma.location.findMany({
    where: { active: true },
    include: { costVersions: { where: { approved: true } } },
    orderBy: [{ country: "asc" }, { city: "asc" }],
  });
  const savedLocations = await prisma.savedLocation.findMany({
    where: { memberProfileId: ctx.profile!.id },
    orderBy: [{ isPreferred: "desc" }, { city: "asc" }],
  });

  return (
    <AppShell
      title="Location Comparison"
      subtitle="Compare retirement locations using transparent cost sources and assumptions"
      progress={{
        percent: dashboard.metrics.progressPercent,
        complete: dashboard.metrics.completeCount,
        total: dashboard.metrics.applicableCount,
        days: dashboard.metrics.daysToRetirement,
        retirementDate: dashboard.profile.projectedRetirementDate,
      }}
    >
      <Panel title="How to read the cost data" className="mb-4">
        <div className="grid gap-3 text-sm md:grid-cols-3">
          <div><strong>Approved cost categories</strong><p className="mt-1 text-muted-foreground">A zero does not mean the city costs $0. It means no monthly source values have been reviewed/adopted for that location yet.</p></div>
          <div><strong>International price comparison</strong><p className="mt-1 text-muted-foreground">International indexes compare relative price levels with a published benchmark. They are not monthly bills and are not automatically treated as expenses.</p></div>
          <div><strong>Housing and utilities</strong><p className="mt-1 text-muted-foreground">Generic rent is shown only when the source does not identify a bedroom count. The app will not pretend it is a 2-, 3-, or 4-bedroom home. Electricity and internet are treated as separate needs when source data supports a reliable split.</p></div>
        </div>
      </Panel>
      <LocationBrowser
        locations={locations.map((location) => ({
          id: location.id,
          city: location.city,
          region: location.region,
          country: location.country,
          currency: location.currency,
          approvedCostCount: location.costVersions.length,
        }))}
        savedLocations={savedLocations.map((location) => ({
          id: location.id,
          city: location.city,
          state: location.state,
          country: location.country,
          countryCode: location.countryCode,
          currency: location.currency,
          isPreferred: location.isPreferred,
        }))}
      />
    </AppShell>
  );
}
