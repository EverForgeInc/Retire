import { expect, test } from "@playwright/test";

test("login and view dashboard on iPad-sized viewport", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("david@example.com");
  await page.getByLabel("Password").fill("changeme123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByRole("main").getByText("Overall progress")).toBeVisible();
  await page.goto("/checklist");
  await expect(page.getByRole("heading", { name: "Checklist" })).toBeVisible();
  await expect(page.getByRole("main").getByText("By phase")).toBeVisible();
});

