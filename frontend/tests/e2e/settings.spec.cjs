const { test, expect } = require("@playwright/test");
const { ensureTeams } = require("./db.cjs");

let teamA = null;

test.beforeAll(() => {
  const [first] = ensureTeams(1);
  teamA = first;
});

test("settings rename and delete (mock)", async ({ page }) => {
  if (!teamA) throw new Error("Team is not initialized");

  await page.goto(`/settings?teamId=${teamA.id}`);

  await expect(page.getByText("チーム設定")).toBeVisible();

  const nameInput = page.getByRole("textbox").first();
  await nameInput.fill("E2E Renamed Team");
  await page.getByRole("button", { name: "保存" }).click();
  await expect(
    page.getByText("チーム名を更新しました（モック）"),
  ).toBeVisible();

  await page.getByRole("button", { name: "チームを削除する" }).click();
  await expect(
    page.getByText("チームを削除しました（モック）"),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/projects\?teamId=/);
});
