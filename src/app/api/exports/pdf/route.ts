import { handleRouteError, requireMemberContext } from "@/lib/api";
import { prisma } from "@/lib/db";
import { toDateOnly } from "@/lib/rules/date-engine";

/** Generates a printable HTML document (PDF-ready via browser print). */
export async function POST() {
  try {
    const { profile, user } = await requireMemberContext();
    const tasks = await prisma.memberTask.findMany({
      where: { memberProfileId: profile.id },
      orderBy: { sortOrder: "asc" },
    });

    const rows = tasks
      .map(
        (t) => `<tr>
          <td>${escapeHtml(t.sectionName ?? "")}</td>
          <td>${escapeHtml(t.title)}</td>
          <td>${escapeHtml(t.status)}</td>
          <td>${t.calculatedStart ? toDateOnly(t.calculatedStart) : ""}</td>
          <td>${t.calculatedEnd ? toDateOnly(t.calculatedEnd) : ""}</td>
          <td>${t.dateCompleted ? toDateOnly(t.dateCompleted) : ""}</td>
          <td>${escapeHtml(t.notes ?? "")}</td>
        </tr>`,
      )
      .join("");

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Retirement Checklist Export</title>
  <style>
    body { font-family: Georgia, "Times New Roman", serif; color: #12243a; margin: 24px; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .meta { margin-bottom: 16px; font-size: 13px; }
    .disclaimer { font-size: 12px; color: #555; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #cbd5e1; padding: 6px 8px; vertical-align: top; }
    th { background: #e8eef6; text-align: left; }
  </style>
</head>
<body>
  <h1>Military Retirement Planner Checklist</h1>
  <div class="meta">
    <div><strong>Member:</strong> ${escapeHtml(profile.fullName ?? user.displayName ?? "")}</div>
    <div><strong>Rank:</strong> ${escapeHtml(profile.rank ?? "")}</div>
    <div><strong>Projected retirement:</strong> ${toDateOnly(profile.projectedRetirementDate)}</div>
  </div>
  <p class="disclaimer">Not an official Department of Defense or U.S. government system. No Social Security number is collected or exported.</p>
  <table>
    <thead>
      <tr>
        <th>Section</th><th>Task</th><th>Status</th><th>Start</th><th>End</th><th>Completed</th><th>Notes</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": 'inline; filename="retirement-checklist.html"',
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
