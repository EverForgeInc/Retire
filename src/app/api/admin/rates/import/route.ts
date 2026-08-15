import { createHash } from "crypto";
import { handleRouteError, jsonError, jsonOk } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { parseDateOnly } from "@/lib/rules/date-engine";
import { assertNoSsnFields, rateImportSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);
    if (session.role !== "admin" && session.role !== "member") {
      // Demo: members can stage imports for local MVP; production should restrict to admin.
      return jsonError("Forbidden", 403);
    }

    const body = await request.json();
    assertNoSsnFields(body);
    const data = rateImportSchema.parse(body);
    const sourceHash = createHash("sha256").update(JSON.stringify(data.rows)).digest("hex");

    const version = await prisma.benefitRateVersion.create({
      data: {
        benefitType: data.benefitType,
        effectiveDate: parseDateOnly(data.effectiveDate),
        sourceUrl: data.sourceUrl,
        sourceHash,
        status: "staged",
      },
    });

    if (data.benefitType === "va_compensation") {
      for (const row of data.rows) {
        await prisma.vaCompensationRate.create({
          data: {
            versionId: version.id,
            rating: Number(row.rating),
            dependentKey: String(row.dependentKey ?? "veteran_alone"),
            monthlyAmount: Number(row.monthlyAmount),
            additionalChildUnder18:
              row.additionalChildUnder18 != null ? Number(row.additionalChildUnder18) : null,
            additionalChildSchool:
              row.additionalChildSchool != null ? Number(row.additionalChildSchool) : null,
            spouseAidAttendance:
              row.spouseAidAttendance != null ? Number(row.spouseAidAttendance) : null,
          },
        });
      }
    } else {
      for (const row of data.rows) {
        await prisma.militaryPayTable.create({
          data: {
            versionId: version.id,
            payGrade: String(row.payGrade),
            yearsServiceBand: String(row.yearsServiceBand),
            monthlyBasicPay: Number(row.monthlyBasicPay),
          },
        });
      }
    }

    await writeAudit({
      userId: session.userId,
      entityType: "benefit_rate_version",
      entityId: version.id,
      action: "staged_import",
      afterValue: { benefitType: data.benefitType, rows: data.rows.length, sourceHash },
    });

    return jsonOk({
      version,
      message:
        "Rate table staged. Approve before calculations use it. Live scraping is not used for user calculations.",
    }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
