const { test, expect } = require("@playwright/test");
const {
  createOversizeJsonFile,
  createTempFile,
  getFixturePath,
} = require("./utils.cjs");
const { ensureTeams } = require("./db.cjs");

let team = null;

test.beforeEach(() => {
  [team] = ensureTeams(1);
});

const fileInput = (page) =>
  page.locator('input[type="file"]');

const expectMessage = async (page, message) => {
  await expect(
    page.getByText(message, { exact: false }).first(),
  ).toBeVisible();
};

test("shows error for empty file", async ({ page }) => {
  if (!team) throw new Error("Team is not initialized");
  await page.goto(`/?teamId=${team.id}`);
  await fileInput(page).setInputFiles({
    name: "empty.json",
    mimeType: "application/json",
    buffer: Buffer.from(""),
  });

  await expectMessage(page, "空のファイルです");
});

test("shows error for invalid JSON", async ({ page }) => {
  if (!team) throw new Error("Team is not initialized");
  await page.goto(`/?teamId=${team.id}`);
  await fileInput(page).setInputFiles(getFixturePath("invalid.json"));

  await expectMessage(page, "JSONとして解析できません");
});

test("shows error for non-json extension", async ({ page }) => {
  if (!team) throw new Error("Team is not initialized");
  await page.goto(`/?teamId=${team.id}`);
  const filePath = await createTempFile("{}", "xml");
  await fileInput(page).setInputFiles(filePath);
  await expectMessage(page, "JSON ファイルのみ対応しています");
});

test("shows error for oversize file", async ({ page }) => {
  if (!team) throw new Error("Team is not initialized");
  await page.goto(`/?teamId=${team.id}`);
  const oversizePath = await createOversizeJsonFile();
  await fileInput(page).setInputFiles(oversizePath);

  await expectMessage(page, "5MBを超えています");
});
