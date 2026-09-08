import { describe, expect, it } from "vitest";
import { bddWindow, isBddOpen, parseDateOnly, toDateOnly } from "@/lib/rules/date-engine";
import { getTaskStatusAfterApplicabilityChange, shouldSuppressTask } from "@/lib/tasks";
import { statusByEvent } from "@/lib/rules/medical-transition";
import { getVaClaimRoute } from "@/lib/rules/va-claim";
import { profileUpdateSchema, taskUpdateSchema, vaConditionSchema } from "@/lib/validation";

describe("medical transition and VA rules", () => {
  it("anchors BDD dates to the official separation date", () => {
    const window = bddWindow("2027-06-01");
    expect(toDateOnly(window.opens)).toBe("2026-12-03");
    expect(toDateOnly(window.closes)).toBe("2027-03-03");
    expect(isBddOpen("2027-06-01", parseDateOnly("2026-12-03"))).toBe(true);
    expect(isBddOpen("2027-06-01", parseDateOnly("2027-02-17"))).toBe(true);
    expect(isBddOpen("2027-06-01", parseDateOnly("2027-03-03"))).toBe(true);
    expect(isBddOpen("2027-06-01", parseDateOnly("2027-03-04"))).toBe(false);
  });

  it("suppresses BDD routing while an active IDES case controls the claim", () => {
    expect(shouldSuppressTask({ externalKey: "va_bdd_window", title: "Confirm BDD eligibility", desIdesStatus: "in_process" })).toBe(true);
    expect(shouldSuppressTask({ externalKey: "va_bdd_window", title: "Confirm BDD eligibility", desIdesStatus: "not_applicable" })).toBe(false);
    expect(shouldSuppressTask({ externalKey: "ides_referral", title: "Record IDES referral", transitionType: "medical_retirement" })).toBe(false);
    expect(shouldSuppressTask({ externalKey: "ides_referral", title: "Record IDES referral", transitionType: "standard_retirement" })).toBe(true);
  });

  it("routes BDD boundaries, filed claims, and IDES workflows explicitly", () => {
    expect(getVaClaimRoute({ separationDate: "2027-06-01", today: parseDateOnly("2026-12-03"), claimFiled: false })).toBe("bdd");
    expect(getVaClaimRoute({ separationDate: "2027-06-01", today: parseDateOnly("2027-02-17"), claimFiled: false })).toBe("bdd");
    expect(getVaClaimRoute({ separationDate: "2027-06-01", today: parseDateOnly("2027-03-03"), claimFiled: false })).toBe("bdd");
    expect(getVaClaimRoute({ separationDate: "2027-06-01", today: parseDateOnly("2027-03-04"), claimFiled: false })).toBe("standard");
    expect(getVaClaimRoute({ separationDate: "2027-06-01", today: parseDateOnly("2027-01-01"), claimFiled: true })).toBe("filed");
    expect(getVaClaimRoute({ separationDate: "2027-06-01", today: parseDateOnly("2027-01-01"), claimFiled: false, desIdesStatus: "in_process" })).toBe("ides");
    expect(getVaClaimRoute({ separationDate: "2027-06-01", today: parseDateOnly("2026-10-01"), claimFiled: false })).toBe("pre_bdd");
    expect(getVaClaimRoute({ separationDate: "2027-06-01", today: parseDateOnly("2027-01-01"), claimFiled: true, desIdesStatus: "in_process" })).toBe("ides");
  });

  it("restores rule-suppressed tasks without overriding member-selected Not Applicable", () => {
    expect(getTaskStatusAfterApplicabilityChange("not_applicable", true)).toBe("not_started");
    expect(getTaskStatusAfterApplicabilityChange("not_applicable", false)).toBe("not_applicable");
    expect(getTaskStatusAfterApplicabilityChange("complete", true)).toBe("complete");
    expect(getTaskStatusAfterApplicabilityChange("waiting", true)).toBe("waiting");
    expect(taskUpdateSchema.parse({ status: "waiting", waitingOnWho: "Personnel", followUpDate: "2027-01-01" })).toMatchObject({ status: "waiting" });
  });

  it("allows an early DES/IDES state without an official separation date", () => {
    expect(profileUpdateSchema.parse({
      projectedRetirementDate: "2027-06-01",
      officialSeparationDate: null,
      desIdesStatus: "referred",
    })).toMatchObject({
      officialSeparationDate: null,
      desIdesStatus: "referred",
    });
  });

  it("rejects a secondary reference without a secondary theory", () => {
    expect(() => vaConditionSchema.parse({
      conditionName: "Back pain",
      memberPrimaryTheory: "direct_in_service",
      secondaryConditionId: "00000000-0000-0000-0000-000000000001",
    })).toThrow(/secondary condition reference/i);
  });

  it("requires a referenced condition for a member secondary theory", () => {
    expect(() => vaConditionSchema.parse({ conditionName: "Back pain", memberPrimaryTheory: "secondary" })).toThrow(/secondary theory/);
    expect(vaConditionSchema.parse({ conditionName: "Back pain", memberPrimaryTheory: "secondary", secondaryConditionId: "00000000-0000-0000-0000-000000000001" })).toMatchObject({
      memberPrimaryTheory: "secondary",
    });
  });

  it("keeps relationship theory optional and preserves separate review states", () => {
    const condition = vaConditionSchema.parse({
      conditionName: "Knee pain",
      memberPrimaryTheory: "direct_in_service",
      representativePrimaryTheory: "presumptive",
      vaFinalPrimaryDetermination: "secondary",
    });
    expect(condition).toMatchObject({
      memberPrimaryTheory: "direct_in_service",
      representativePrimaryTheory: "presumptive",
      vaFinalPrimaryDetermination: "secondary",
    });
  });
});
  it("advances DES/IDES state from transition events", () => {
    expect(statusByEvent.referred).toBe("referred");
    expect(statusByEvent.found_unfit).toBe("found_unfit");
    expect(statusByEvent.case_closed).toBe("complete");
  });
