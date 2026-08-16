import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { buildDashboard } from "@/lib/dashboard";

export async function requirePageContext() {
  const ctx = await getSessionProfile();
  if (!ctx) redirect("/login");
  if (!ctx.profile) redirect("/onboarding");
  return ctx;
}

export async function getDashboardForPage() {
  const ctx = await requirePageContext();
  const dashboard = await buildDashboard(ctx.profile!.id);
  return { ctx, dashboard };
}
