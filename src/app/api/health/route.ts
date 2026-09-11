import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getProductionReadinessIssues } from "@/lib/runtime-config";

export async function GET() {
  const configurationIssues = getProductionReadinessIssues();
  let databaseReady = false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    databaseReady = true;
  } catch {
    databaseReady = false;
  }

  const ready = configurationIssues.length === 0 && databaseReady;

  return NextResponse.json(
    {
      status: ready ? "ready" : "not_ready",
      database: databaseReady ? "ready" : "unavailable",
      configuration: configurationIssues.map((issue) => issue.code),
      version: process.env.npm_package_version ?? "unknown",
    },
    {
      status: ready ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
