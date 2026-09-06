import { z } from "zod";

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");
export const transitionTypes = ["standard_retirement", "voluntary_normal_separation", "medical_separation", "medical_retirement", "not_yet_determined"] as const;
export const desIdesStatuses = ["not_applicable", "not_started", "referred", "in_process", "found_fit", "found_unfit", "complete"] as const;
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
});

export const digestPreferencesSchema = z
  .object({
    cadence: z.enum(["off", "daily", "weekly"]),
    deliveryLocalTime: z.string().regex(/^\d{2}:\d{2}$/),
    weeklyDay: z.number().int().min(0).max(6).nullable().optional(),
    timezone: z.string().min(1),
    includeActivePhase: z.boolean().optional(),
    includeOverdue: z.boolean().optional(),
    includeWaiting: z.boolean().optional(),
    upcomingDays: z.number().int().min(0).max(90).optional(),
    sendEmptyDigest: z.boolean().optional(),
    pausedUntil: z.string().datetime().nullable().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.cadence === "weekly" && (value.weeklyDay === undefined || value.weeklyDay === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "weeklyDay is required when cadence is weekly",
        path: ["weeklyDay"],
      });
    }
  });
  
export const medicalTransitionEventSchema = z.object({
  eventType: z.enum(["referred", "case_opened", "medical_evaluation", "found_fit", "found_unfit", "separation_or_retirement_ordered", "case_closed"]),
  occurredAt: dateString,
  notes: z.string().optional(),
});

export const incomeScenarioSchema = z.object({
  name: z.string().min(1),
  retirementSystem: z.string().optional(),
  high3Monthly: z.number().optional(),
  yearsService: z.number().optional(),
  multiplier: z.number().optional(),
  estimatedRetiredPay: z.number().optional(),
  memberVaRating: z.number().int().min(0).max(100).optional(),
  memberVaPay: z.number().optional(),
  spouseVaPay: z.number().optional(),
  civilianIncome: z.number().optional(),
  otherIncome: z.number().optional(),
  dependentConfiguration: z.record(z.unknown()).optional(),
});

export const rateImportSchema = z.object({
  benefitType: z.enum(["va_compensation", "military_pay"]),
  effectiveDate: dateString,
  sourceUrl: z.string().url(),
  rows: z.array(z.record(z.union([z.string(), z.number()]))).min(1),
});
