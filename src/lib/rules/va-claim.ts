import { isBddOpen, parseDateOnly } from "@/lib/rules/date-engine";

export type VaClaimRoute = "ides" | "filed" | "bdd" | "standard" | "pre_bdd";
export type ClaimWorkflowState = "not_started" | "planning" | "bdd_eligible" | "bdd_filed" | "fdc" | "standard_claim" | "ides_controlled" | "claim_submitted" | "exams_evidence_in_progress" | "decision_pending" | "complete";

const activeIdesStatuses = new Set(["referred", "in_process", "found_unfit"]);
const filedWorkflowStates = new Set<ClaimWorkflowState>(["bdd_filed", "fdc", "standard_claim", "claim_submitted", "exams_evidence_in_progress", "decision_pending", "complete"]);

export function getVaClaimRoute(params: {
  separationDate: Date | string;
  today: Date;
  claimFiled: boolean;
  desIdesStatus?: string;
  workflowState?: ClaimWorkflowState;
}): VaClaimRoute {
  if (params.workflowState === "ides_controlled" || (params.desIdesStatus && activeIdesStatuses.has(params.desIdesStatus))) return "ides";
  if (params.claimFiled || (params.workflowState && filedWorkflowStates.has(params.workflowState))) return "filed";

  const separationDate = parseDateOnly(params.separationDate);
  const today = parseDateOnly(params.today);
  const daysRemaining = Math.ceil((separationDate.getTime() - today.getTime()) / 86_400_000);
  if (isBddOpen(separationDate, today)) return "bdd";
  return daysRemaining > 180 ? "pre_bdd" : "standard";
}
