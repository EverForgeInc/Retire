import { describe, expect, it } from "vitest";
import { bddWindow, isBddOpen, parseDateOnly, toDateOnly } from "@/lib/rules/date-engine";
import { shouldSuppressTask } from "@/lib/tasks";
import { statusByEvent } from "@/lib/rules/medical-transition";
import { vaConditionSchema } from "@/lib/validation";

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
