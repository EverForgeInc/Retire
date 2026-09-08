import { isBddOpen, parseDateOnly } from "@/lib/rules/date-engine";

export type VaClaimRoute = "ides" | "filed" | "bdd" | "standard" | "pre_bdd";

const activeIdesStatuses = new Set(["referred", "in_process", "found_unfit"]);

export function getVaClaimRoute(params: {
  separationDate: Date | string;
  today: Date;
  claimFiled: boolean;
  desIdesStatus?: string;
}): VaClaimRoute {
  if (params.desIdesStatus && activeIdesStatuses.has(params.desIdesStatus)) return "ides";
  if (params.claimFiled) return "filed";

  const separationDate = parseDateOnly(params.separationDate);
  const today = parseDateOnly(params.today);
  const daysRemaining = Math.ceil((separationDate.getTime() - today.getTime()) / 86_400_000);
  if (isBddOpen(separationDate, today)) return "bdd";
  return daysRemaining > 180 ? "pre_bdd" : "standard";
}
