import { z } from "zod";

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");
export const transitionTypes = ["standard_retirement", "voluntary_normal_separation", "medical_separation", "medical_retirement", "not_yet_determined"] as const;
export const desIdesStatuses = ["not_applicable", "not_started", "referred", "in_process", "peb_in_progress", "awaiting_final_decision", "found_fit", "found_unfit", "complete"] as const;
export const claimWorkflowStates = ["not_started", "planning", "bdd_eligible", "bdd_filed", "fdc", "standard_claim", "ides_controlled", "claim_submitted", "exams_evidence_in_progress", "decision_pending", "complete"] as const;
export const relationshipTheories = ["direct_in_service", "presumptive", "secondary", "pre_service_aggravated", "unsure_needs_review"] as const;

/** Reject any accidental SSN-shaped fields at the API boundary. */
export function assertNoSsnFields(payload: unknown) {
  const banned = ["ssn", "socialSecurity", "social_security", "last4", "lastFour", "last_4"];
  const json = JSON.stringify(payload ?? {});
  for (const key of banned) {
    if (json.toLowerCase().includes(`"${key.toLowerCase()}"`)) {
      throw new Error(`Forbidden field detected: ${key}. This application does not collect SSN data.`);
    }
  }
}

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registrationSchema = z.object({
  email: z.string().email(),
  displayName: z.string().trim().min(1).max(80),
  password: z
    .string()
    .min(12, "Use at least 12 characters")
    .regex(/[a-z]/, "Include a lowercase letter")
    .regex(/[A-Z]/, "Include an uppercase letter")
    .regex(/[0-9]/, "Include a number"),
  accessCode: z.string().trim().min(1),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().min(1).optional(),
  rank: z.string().optional(),
  branch: z.string().optional(),
  component: z.string().optional(),
  installation: z.string().optional(),
  timezone: z.string().optional(),
  projectedRetirementDate: dateString,
  officialSeparationDate: dateString.nullable().optional(),
  transitionType: z.enum(transitionTypes).optional(),
  desIdesStatus: z.enum(desIdesStatuses).optional(),
  claimWorkflowState: z.enum(claimWorkflowStates).optional(),
  skillbridgeStart: dateString.nullable().optional(),
  skillbridgeEnd: dateString.nullable().optional(),
  terminalLeaveStart: dateString.nullable().optional(),
  finalDutyDay: dateString.nullable().optional(),
  retirementLocation: z.string().optional(),
  overseasStatus: z.boolean().optional(),
});

export const taskUpdateSchema = z.object({
  status: z
    .enum(["not_started", "in_progress", "waiting", "complete", "not_applicable"])
    .optional(),
  waitingOnWho: z.string().nullable().optional(),
  waitingOnWhat: z.string().nullable().optional(),
  followUpDate: dateString.nullable().optional(),
  dateCompleted: dateString.nullable().optional(),
  notes: z.string().nullable().optional(),
  manualDueDate: dateString.nullable().optional(),
  dateOverride: z.boolean().optional(),
});

export const evidenceReferenceSchema = z.object({
  memberTaskId: z.string().uuid().optional(),
  evidenceType: z.enum([
    "attestation",
    "confirmation_number",
    "external_storage_reference",
    "record_request_tracker",
    "permitted_nonmedical_attachment",
  ]),
  recordCategory: z.string().optional(),
  facilityOrOffice: z.string().optional(),
  requestDate: dateString.optional(),
  receivedDate: dateString.optional(),
  completeness: z
    .enum(["not_requested", "requested", "partial", "complete", "missing"])
    .optional(),
  confirmationNumber: z.string().optional(),
  summary: z.string().optional(),
  externalStorageLabel: z.string().optional(),
});

export const functionalLimitationSchema = z.object({
  activity: z.string().min(1),
  limitationDescription: z.string().min(1),
  thresholdValue: z.number().optional(),
  thresholdUnit: z.string().optional(),
  frequency: z.string().optional(),
  severity: z.string().optional(),
  flareImpact: z.string().optional(),
  accommodationOrDevice: z.string().optional(),
});

export const vaConditionSchema = z.object({
  conditionName: z.string().min(1),
  bodySystem: z.string().optional(),
  bodyRegion: z.string().optional(),
  laterality: z.enum(["left", "right", "bilateral", "midline", "unspecified"]).optional(),
  diagnosisStatus: z.string().optional(),
  onsetOrServiceEvent: z.string().optional(),
  symptoms: z.string().optional(),
  flareUps: z.string().optional(),
  functionalImpactNarrative: z.string().optional(),
  treatmentHistory: z.string().optional(),
  claimStatus: z.string().optional(),
  examStatus: z.string().optional(),
  memberPrimaryTheory: z.enum(relationshipTheories).optional(),
  memberAlternateTheory: z.enum(relationshipTheories).optional(),
  representativePrimaryTheory: z.enum(relationshipTheories).nullable().optional(),
  representativeAlternateTheory: z.enum(relationshipTheories).nullable().optional(),
  vaFinalPrimaryDetermination: z.enum(relationshipTheories).nullable().optional(),
  vaFinalAlternateDetermination: z.enum(relationshipTheories).nullable().optional(),
  secondaryConditionId: z.string().uuid().nullable().optional(),
  limitations: z.array(functionalLimitationSchema).optional(),
}).superRefine((value, ctx) => {
  if (value.memberPrimaryTheory === "secondary" && !value.secondaryConditionId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "A secondary theory must reference another condition", path: ["secondaryConditionId"] });
  }
  if (value.memberPrimaryTheory !== "secondary" && value.secondaryConditionId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "A secondary condition reference requires a secondary theory", path: ["secondaryConditionId"] });
  }
});

export const digestPreferencesSchema = z.object({
  cadence: z.enum(["off", "daily", "weekly"]),
  deliveryLocalTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  weeklyDay: z.number().int().min(0).max(6).nullable().optional(),
  timezone: z.string().min(1),
  includeActivePhase: z.boolean(),
  includeOverdue: z.boolean(),
  includeWaiting: z.boolean(),
  upcomingDays: z.number().int().min(1).max(90),
  sendEmptyDigest: z.boolean(),
  pausedUntil: z.string().datetime().nullable().optional(),
});
