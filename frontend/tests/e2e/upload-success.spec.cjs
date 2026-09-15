const { test, expect } = require("@playwright/test");
const { getFixturePath } = require("./utils.cjs");
const { ensureTeams } = require("./db.cjs");

const fixture = getFixturePath("package-lock.v3.json");

const successToast = (page) =>
  page.getByText("解析完了: ", { exact: false });

const summarySection = (page) =>
  page.getByText("脆弱性サマリー", { exact: false });

const fileInput = (page) =>
  page.locator('input[type="file"]');

test("upload package-lock and navigate to result", async ({ page }) => {
  const [team] = ensureTeams(1);
  await page.goto(`/?teamId=${team.id}`);

  await expect(page.getByText("アップロード先:")).toBeVisible();

  await fileInput(page).setInputFiles(fixture);

  await expect(successToast(page)).toBeVisible();
  await expect(page).toHaveURL(/\/projects\//);

  await expect(summarySection(page)).toBeVisible();
  await expect(
    page.getByText("Root Dependency:", { exact: false }).first(),
  ).toBeVisible();
});
