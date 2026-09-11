import { AppShell } from "@/components/layout/AppShell";
import { DocumentsBrowser } from "@/components/documents/DocumentsBrowser";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
      title="Document Tracker"
      subtitle="Track what you requested, received, and where you securely stored it"
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
          <AlertTitle>What this area is for</AlertTitle>
          <AlertDescription>
            Medical-file uploads are disabled by default to protect user privacy. Use this as a reference tracker for items such as retirement orders, DD214 preparation, medical-record requests, claim confirmations, and other transition documents. The app stores a description, confirmation number, or the name of your secure storage location; it is not intended to be the primary storage location for sensitive files.
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
