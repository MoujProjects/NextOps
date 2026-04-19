import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

test.describe("NexOps E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test("redirects unauthenticated user to login", async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator("h2")).toContainText("Sign in");
  });

  test("login page renders correctly", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator("h1")).toContainText("NexOps");
    await expect(page.locator("h2")).toContainText("Sign in");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText("Sign in");
  });

  test("signup page renders correctly", async ({ page }) => {
    await page.goto(`${BASE_URL}/signup`);
    await expect(page.locator("h2")).toContainText("Create account");
    await expect(page.locator("#org")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
  });

  test("full flow: login → dashboard → create project → add API key", async ({ page }) => {
    // Skip if no test credentials configured
    const email = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;
    if (!email || !password) {
      test.skip(true, "TEST_USER_EMAIL / TEST_USER_PASSWORD not set");
      return;
    }

    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');

    // Should reach dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await expect(page.locator("h1")).toContainText("Overview");

    // Navigate to Projects
    await page.click('a[href="/projects"]');
    await expect(page).toHaveURL(/\/projects/);
    await expect(page.locator("h1")).toContainText("Projects");

    // Create a project
    await page.click('button:has-text("New project")');
    await page.fill("#proj-name", "E2E Test Project");
    await page.click('button:has-text("Create project")');

    // Should see the project (or toast)
    await expect(page.locator("text=E2E Test Project").or(page.locator("text=Project created"))).toBeVisible({ timeout: 5000 });

    // Navigate to API Keys
    await page.click('a[href="/api-keys"]');
    await expect(page).toHaveURL(/\/api-keys/);
    await expect(page.locator("h1")).toContainText("API Key Vault");

    // Add an API key
    await page.click('button:has-text("Add key")');
    await page.fill("#key-label", "Test Key");
    await page.fill("#key-value", "sk-test-abc123");
    await page.click('button:has-text("Add key")');

    // Should see success
    await expect(page.locator("text=Key added securely").or(page.locator("text=Test Key"))).toBeVisible({ timeout: 5000 });

    // Dashboard overview should be visible
    await page.click('a[href="/dashboard"]');
    await expect(page.locator("h1")).toContainText("Overview");
    await expect(page.locator("text=API Calls Today")).toBeVisible();
  });
});
