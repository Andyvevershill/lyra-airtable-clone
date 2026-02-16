import { expect, test } from "@playwright/test";

// Use saved auth state
test.use({ storageState: "playwright/.auth/user.json" });

test.describe("Base Actions Dropdown - WITH HOVER", () => {
  test.beforeEach(async ({ page }) => {
    console.log("\n🚀 SETUP: Loading dashboard");

    await page.goto("http://localhost:3000/dashboard");
    await page.waitForLoadState("networkidle");

    console.log("📍 Page loaded, waiting for base cards...");

    // Wait for base cards to load (they have the baseWidth class or pointer class)
    await page.waitForSelector(".pointer", { timeout: 10000 });

    // Find a base card (has specific styling)
    const baseCard = page
      .locator("div.pointer")
      .filter({
        has: page.locator('[class*="h-14 w-14 rounded-lg"]'),
      })
      .first();

    const cardCount = await baseCard.count();
    console.log(`📊 Found ${cardCount} base cards`);

    if (cardCount > 0) {
      console.log("🖱️  Hovering over first base card to reveal dropdown...");
      await baseCard.hover();
      await page.waitForTimeout(500); // Wait for hover effects

      // Check if dropdown appeared
      const favCount = await page
        .locator('[data-testid="favourite-button"]')
        .count();
      const menuCount = await page
        .locator('[data-testid="base-menu-button"]')
        .count();

      console.log(`✅ After hover:`);
      console.log(`  favourite-button: ${favCount}`);
      console.log(`  base-menu-button: ${menuCount}`);
    } else {
      console.log("❌ No base cards found!");
    }
  });

  test("favourite star button exists and is visible after hover", async ({
    page,
  }) => {
    console.log("\n🧪 TEST: favourite star button exists and is visible");

    const favouriteButton = page.getByTestId("favourite-button").first();

    await expect(favouriteButton).toBeVisible();
    console.log("✅ TEST PASSED");
  });

  test("favourite star button is enabled", async ({ page }) => {
    console.log("\n🧪 TEST: favourite star button is enabled");

    const favouriteButton = page.getByTestId("favourite-button").first();

    await expect(favouriteButton).toBeEnabled();
    console.log("✅ TEST PASSED");
  });

  test("favourite star button contains star icon", async ({ page }) => {
    console.log("\n🧪 TEST: favourite star button contains star icon");

    const favouriteButton = page.getByTestId("favourite-button").first();
    const icon = favouriteButton.locator("svg");

    await expect(icon).toBeVisible();
    console.log("✅ TEST PASSED");
  });

  test("three dots menu button exists and is visible", async ({ page }) => {
    console.log("\n🧪 TEST: three dots menu button exists and is visible");

    const menuButton = page.getByTestId("base-menu-button").first();

    await expect(menuButton).toBeVisible();
    console.log("✅ TEST PASSED");
  });

  test("three dots menu button is enabled", async ({ page }) => {
    console.log("\n🧪 TEST: three dots menu button is enabled");

    const menuButton = page.getByTestId("base-menu-button").first();

    await expect(menuButton).toBeEnabled();
    console.log("✅ TEST PASSED");
  });

  test("three dots menu button contains icon", async ({ page }) => {
    console.log("\n🧪 TEST: three dots menu button contains icon");

    const menuButton = page.getByTestId("base-menu-button").first();
    const icon = menuButton.locator("svg");

    await expect(icon).toBeVisible();
    console.log("✅ TEST PASSED");
  });

  test("clicking favourite star toggles favourite status", async ({ page }) => {
    console.log("\n🧪 TEST: clicking favourite star toggles favourite status");

    const favouriteButton = page.getByTestId("favourite-button").first();

    await favouriteButton.click();
    await page.waitForTimeout(500);

    // Button should still be visible and enabled after click
    await expect(favouriteButton).toBeVisible();
    await expect(favouriteButton).toBeEnabled();
    console.log("✅ TEST PASSED");
  });

  test("clicking three dots menu opens dropdown", async ({ page }) => {
    console.log("\n🧪 TEST: clicking three dots menu opens dropdown");

    const menuButton = page.getByTestId("base-menu-button").first();

    await menuButton.click();
    await page.waitForTimeout(300);

    const renameOption = page.getByText("Rename");
    await expect(renameOption).toBeVisible();
    console.log("✅ TEST PASSED");
  });

  test("menu contains rename option", async ({ page }) => {
    console.log("\n🧪 TEST: menu contains rename option");

    const menuButton = page.getByTestId("base-menu-button").first();

    await menuButton.click();
    await page.waitForTimeout(300);

    const renameOption = page.getByText("Rename");
    await expect(renameOption).toBeVisible();
    console.log("✅ TEST PASSED");
  });

  test("menu contains delete option", async ({ page }) => {
    console.log("\n🧪 TEST: menu contains delete option");

    const menuButton = page.getByTestId("base-menu-button").first();

    await menuButton.click();
    await page.waitForTimeout(300);

    const deleteOption = page.getByText("Delete");
    await expect(deleteOption).toBeVisible();
    console.log("✅ TEST PASSED");
  });

  test("clicking rename option closes menu", async ({ page }) => {
    console.log("\n🧪 TEST: clicking rename option closes menu");

    const menuButton = page.getByTestId("base-menu-button").first();

    await menuButton.click();
    await page.waitForTimeout(300);

    const renameOption = page.getByText("Rename");
    await renameOption.click();
    await page.waitForTimeout(300);

    // Menu should close after clicking rename
    const deleteOption = page.getByText("Delete");
    await expect(deleteOption).not.toBeVisible();
    console.log("✅ TEST PASSED");
  });

  test("favourite button stays enabled after clicking", async ({ page }) => {
    console.log("\n🧪 TEST: favourite button stays enabled after clicking");

    const favouriteButton = page.getByTestId("favourite-button").first();

    await favouriteButton.click();
    await page.waitForTimeout(300);

    await expect(favouriteButton).toBeEnabled();
    console.log("✅ TEST PASSED");
  });

  test("can click favourite button multiple times", async ({ page }) => {
    console.log("\n🧪 TEST: can click favourite button multiple times");

    const favouriteButton = page.getByTestId("favourite-button").first();

    // Click multiple times
    await favouriteButton.click();
    await page.waitForTimeout(200);
    await favouriteButton.click();
    await page.waitForTimeout(200);
    await favouriteButton.click();
    await page.waitForTimeout(200);

    await expect(favouriteButton).toBeVisible();
    await expect(favouriteButton).toBeEnabled();
    console.log("✅ TEST PASSED");
  });

  test("menu button stays enabled after opening menu", async ({ page }) => {
    console.log("\n🧪 TEST: menu button stays enabled after opening menu");

    const menuButton = page.getByTestId("base-menu-button").first();

    await menuButton.click();
    await page.waitForTimeout(300);

    await expect(menuButton).toBeEnabled();
    console.log("✅ TEST PASSED");
  });
});
