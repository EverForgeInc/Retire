import { describe, expect, it } from "vitest";
import { getProductionReadinessIssues, validateBetaAccessCode } from "@/lib/runtime-config";
import { registrationSchema } from "@/lib/validation";

describe("closed beta production readiness", () => {
  it("accepts a production-safe configuration", () => {
    const issues = getProductionReadinessIssues({
      NODE_ENV: "production",
      AUTH_SECRET: "a".repeat(48),
      APP_URL: "https://beta.example.com",
      DATABASE_URL: "postgresql://user:pass@db.example.com:5432/retire",
      BETA_ACCESS_CODE: "invite-2026",
    });
    expect(issues).toEqual([]);
  });

  it("rejects SQLite and weak closed-beta configuration in production", () => {
    const codes = getProductionReadinessIssues({
      NODE_ENV: "production",
      AUTH_SECRET: "short",
      APP_URL: "http://beta.example.com",
      DATABASE_URL: "file:./dev.db",
      BETA_ACCESS_CODE: "short",
    }).map((issue) => issue.code);

    expect(codes).toEqual(expect.arrayContaining(["auth_secret", "app_url_https", "database_sqlite", "beta_access_code"]));
  });

  it("validates the invitation code without exposing it", () => {
    const env = { NODE_ENV: "production", BETA_ACCESS_CODE: "correct-code" };
    expect(validateBetaAccessCode("correct-code", env)).toBe(true);
    expect(validateBetaAccessCode("wrong-code", env)).toBe(false);
  });
});

describe("beta registration input", () => {
  it("requires a stronger password and an access code", () => {
    expect(registrationSchema.safeParse({
      displayName: "Beta Tester",
      email: "tester@example.com",
      password: "StrongPassword1",
      accessCode: "invite-2026",
    }).success).toBe(true);

    expect(registrationSchema.safeParse({
      displayName: "Beta Tester",
      email: "tester@example.com",
      password: "password",
      accessCode: "invite-2026",
    }).success).toBe(false);
  });
});
