import { AppShell } from "@/components/layout/AppShell";
import { DocumentsBrowser } from "@/components/documents/DocumentsBrowser";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { prisma } from "@/lib/db";
import { getDashboardForPage } from "@/lib/server-data";

export default async function DocumentsPage() {
  const { ctx, dashboard } = await getDashboardForPage();
  const refs = await prisma.evidenceReference.findMany({
    where: { memberProfileId: ctx.profile!.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AppShell
      title="Documents"
      subtitle="Privacy-preserving evidence and medical-record request tracker"
      progress={{
        percent: dashboard.metrics.progressPercent,
        complete: dashboard.metrics.completeCount,
        total: dashboard.metrics.applicableCount,
        days: dashboard.metrics.daysToRetirement,
        retirementDate: dashboard.profile.projectedRetirementDate,
      }}
    >
      <div className="mb-4">
        <Alert>
          <AlertDescription>
            Medical-file uploads are disabled by default to protect user privacy.
          </AlertDescription>
        </Alert>
      </div>
      <DocumentsBrowser
        items={refs.map((ref) => ({
          id: ref.id,
          evidenceType: ref.evidenceType,
          completeness: ref.completeness,
          recordCategory: ref.recordCategory,
          externalStorageLabel: ref.externalStorageLabel,
          confirmationNumber: ref.confirmationNumber,
          summary: ref.summary,
        }))}
      />
    </AppShell>
  );
}
