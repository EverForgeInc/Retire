export type ReadinessIssue = {
  code: string;
  message: string;
};

export function getProductionReadinessIssues(env: NodeJS.ProcessEnv = process.env): ReadinessIssue[] {
  const issues: ReadinessIssue[] = [];
  const authSecret = env.AUTH_SECRET?.trim() ?? "";
  const appUrl = env.APP_URL?.trim() ?? "";
  const databaseUrl = env.DATABASE_URL?.trim() ?? "";
  const betaAccessCode = env.BETA_ACCESS_CODE?.trim() ?? "";

  if (authSecret.length < 32) {
    issues.push({ code: "auth_secret", message: "AUTH_SECRET must be at least 32 characters." });
  }

  if (!appUrl) {
    issues.push({ code: "app_url", message: "APP_URL is required." });
  } else if (env.NODE_ENV === "production" && !appUrl.startsWith("https://")) {
    issues.push({ code: "app_url_https", message: "APP_URL must use HTTPS in production." });
  }

  if (!databaseUrl) {
    issues.push({ code: "database_url", message: "DATABASE_URL is required." });
  } else if (env.NODE_ENV === "production" && databaseUrl.startsWith("file:")) {
    issues.push({ code: "database_sqlite", message: "SQLite is not approved for closed-beta production deployment." });
  }

  if (env.NODE_ENV === "production" && betaAccessCode.length < 8) {
    issues.push({ code: "beta_access_code", message: "BETA_ACCESS_CODE must be at least 8 characters for closed beta." });
  }

  return issues;
}

export function isClosedBetaRegistrationEnabled(env: NodeJS.ProcessEnv = process.env) {
  if (env.NODE_ENV !== "production") return true;
  return getProductionReadinessIssues(env).every((issue) => issue.code !== "beta_access_code");
}

export function validateBetaAccessCode(value: string, env: NodeJS.ProcessEnv = process.env) {
  if (env.NODE_ENV !== "production" && !env.BETA_ACCESS_CODE) return true;
  const expected = env.BETA_ACCESS_CODE?.trim();
  return Boolean(expected && value.trim() === expected);
}
