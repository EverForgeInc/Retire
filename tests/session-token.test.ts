import { describe, expect, it } from "vitest";
import { createSessionToken, verifySessionToken } from "@/lib/session-token";

describe("session-token", () => {
  it("round-trips a signed session payload", async () => {
    const token = await createSessionToken(
      {
        userId: "user-123",
        email: "member@example.com",
        displayName: "A Member",
        role: "member",
      },
      "test-secret",
      7,
    );

    const payload = await verifySessionToken(token, "test-secret");

    expect(payload).toMatchObject({
      sub: "user-123",
      email: "member@example.com",
      displayName: "A Member",
      role: "member",
    });
  });

  it("rejects tampered tokens", async () => {
    const token = await createSessionToken(
      {
        userId: "user-123",
        email: "member@example.com",
        displayName: "A Member",
        role: "member",
      },
      "test-secret",
      7,
    );

    await expect(verifySessionToken(`${token}x`, "test-secret")).rejects.toThrow();
  });
});
