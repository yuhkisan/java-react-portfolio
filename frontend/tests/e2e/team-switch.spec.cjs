const { test, expect } = require("@playwright/test");
const { ensureTeams } = require("./db.cjs");

let teamA = null;
let teamB = null;

test.beforeAll(() => {
  const [first, second] = ensureTeams(2);
  teamA = first;
  teamB = second;
});

test("teamId switching via URL and selector", async ({ page }) => {
  if (!teamA || !teamB) throw new Error("Teams are not initialized");

  await page.goto(`/projects?teamId=${teamA.id}`);
  await expect(page.getByText(`${teamA.name} のプロジェクト`)).toBeVisible();

  const selectorButton = page.getByRole("button", {
    name: new RegExp(teamA.name),
  });
  await selectorButton.click();

  await page.getByRole("menuitem", { name: teamB.name }).click();
  await expect(page).toHaveURL(new RegExp(`teamId=${teamB.id}`));
  await expect(page.getByText(`${teamB.name} のプロジェクト`)).toBeVisible();

  await page.goto(`/?teamId=${teamB.id}`);
  await expect(
    page.getByText(`アップロード先: ${teamB.name}`),
  ).toBeVisible();
});
