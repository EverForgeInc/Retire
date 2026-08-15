import { AppShell } from "@/components/layout/AppShell";
import { LocationBrowser } from "@/components/locations/LocationBrowser";
import { prisma } from "@/lib/db";
import { getDashboardForPage } from "@/lib/server-data";

export default async function LocationsPage() {
  const { dashboard } = await getDashboardForPage();
  const locations = await prisma.location.findMany({
    where: { active: true },
    include: { costVersions: { where: { approved: true } } },
    orderBy: [{ country: "asc" }, { city: "asc" }],
  });

  return (
    <AppShell
      title="Location Comparison"
      subtitle="Compare at least 10 retirement locations"
      progress={{
        percent: dashboard.metrics.progressPercent,
        complete: dashboard.metrics.completeCount,
        total: dashboard.metrics.applicableCount,
        days: dashboard.metrics.daysToRetirement,
        retirementDate: dashboard.profile.projectedRetirementDate,
      }}
    >
      <LocationBrowser
        locations={locations.map((location) => ({
          id: location.id,
          city: location.city,
          region: location.region,
          country: location.country,
          currency: location.currency,
          approvedCostCount: location.costVersions.length,
        }))}
      />
    </AppShell>
  );
}
