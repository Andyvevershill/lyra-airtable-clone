import { expect, test } from "@playwright/test";

// Use saved auth state
test.use({ storageState: "playwright/.auth/user.json" });

test.describe("Table Tab Dropdown", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a base with multiple tables
    await page.goto(
      "http://localhost:3000/base/tnn6wio2n4o4u6z0lg6bgeeq/rlowln9ewhhz2beo7av44vbz",
    );
    await page.waitForLoadState("networkidle");
  });

  test("dropdown trigger button exists and is visible", async ({ page }) => {
    const dropdownButton = page.getByTestId("table-dropdown-button");

    await expect(dropdownButton).toBeVisible();
  });

  test("dropdown trigger button is enabled", async ({ page }) => {
    const dropdownButton = page.getByTestId("table-dropdown-button");

    await expect(dropdownButton).toBeEnabled();
  });

  test("dropdown button contains down arrow icon", async ({ page }) => {
    const dropdownButton = page.getByTestId("table-dropdown-button");
    const icon = dropdownButton.locator("svg");

    await expect(icon).toBeVisible();
  });

  test("clicking dropdown opens table list", async ({ page }) => {
    const dropdownButton = page.getByTestId("table-dropdown-button");

    await dropdownButton.click();
    await page.waitForTimeout(300);

    // Check that search input appears
    const searchInput = page.locator('input[placeholder="Find a table"]');
    await expect(searchInput).toBeVisible();
  });

  test("dropdown contains search input", async ({ page }) => {
    const dropdownButton = page.getByTestId("table-dropdown-button");

    await dropdownButton.click();
    await page.waitForTimeout(300);

    const searchInput = page.locator('input[placeholder="Find a table"]');
    await expect(searchInput).toBeVisible();
  });

  test("search input has correct placeholder", async ({ page }) => {
    const dropdownButton = page.getByTestId("table-dropdown-button");

    await dropdownButton.click();
    await page.waitForTimeout(300);

    const searchInput = page.locator('input[placeholder="Find a table"]');
    await expect(searchInput).toHaveAttribute("placeholder", "Find a table");
  });

  test("typing in search input works", async ({ page }) => {
    const dropdownButton = page.getByTestId("table-dropdown-button");

    await dropdownButton.click();
    await page.waitForTimeout(300);

    const searchInput = page.locator('input[placeholder="Find a table"]');
    await searchInput.fill("test");
    await page.waitForTimeout(200);

    const value = await searchInput.inputValue();
    expect(value).toBe("test");
  });

  test("search input clears on Enter key", async ({ page }) => {
    const dropdownButton = page.getByTestId("table-dropdown-button");

    await dropdownButton.click();
    await page.waitForTimeout(300);

    const searchInput = page.locator('input[placeholder="Find a table"]');
    await searchInput.fill("test search");
    await page.waitForTimeout(200);

    await searchInput.press("Enter");
    await page.waitForTimeout(200);

    const value = await searchInput.inputValue();
    expect(value).toBe("");
  });

  test("dropdown shows table items", async ({ page }) => {
    const dropdownButton = page.getByTestId("table-dropdown-button");

    await dropdownButton.click();
    await page.waitForTimeout(300);

    // Count table items (this will depend on your actual data)
    const tableItems = page.locator("p.text-sm");
    const count = await tableItems.count();

    expect(count).toBeGreaterThan(0);
  });

  test("no matching tables message appears with invalid search", async ({
    page,
  }) => {
    const dropdownButton = page.getByTestId("table-dropdown-button");

    await dropdownButton.click();
    await page.waitForTimeout(300);

    const searchInput = page.locator('input[placeholder="Find a table"]');
    await searchInput.fill("xyznonexistenttable123");
    await page.waitForTimeout(300);

    const noResultsText = page.getByText("No matching tables");
    await expect(noResultsText).toBeVisible();
  });

  test("dropdown button stays enabled after opening", async ({ page }) => {
    const dropdownButton = page.getByTestId("table-dropdown-button");

    await dropdownButton.click();
    await page.waitForTimeout(300);

    await expect(dropdownButton).toBeEnabled();
  });

  test("can type multiple characters in search", async ({ page }) => {
    const dropdownButton = page.getByTestId("table-dropdown-button");

    await dropdownButton.click();
    await page.waitForTimeout(300);

    const searchInput = page.locator('input[placeholder="Find a table"]');
    await searchInput.fill("test query with spaces");
    await page.waitForTimeout(200);

    const value = await searchInput.inputValue();
    expect(value).toBe("test query with spaces");
  });

  test("search input can be cleared", async ({ page }) => {
    const dropdownButton = page.getByTestId("table-dropdown-button");

    await dropdownButton.click();
    await page.waitForTimeout(300);

    const searchInput = page.locator('input[placeholder="Find a table"]');
    await searchInput.fill("test");
    await page.waitForTimeout(200);
    await searchInput.clear();
    await page.waitForTimeout(200);

    const value = await searchInput.inputValue();
    expect(value).toBe("");
  });
});
