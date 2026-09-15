const { promises: fs } = require("node:fs");
const { join, resolve } = require("node:path");
const { tmpdir } = require("node:os");

const fixturesDir = resolve(__dirname, "..", "fixtures");

const getFixturePath = (name) => resolve(fixturesDir, name);

const createTempFile = async (content, extension = "json") => {
  const dir = await fs.mkdtemp(join(tmpdir(), "vuln-e2e-"));
  const filePath = join(dir, `temp.${extension}`);
  await fs.writeFile(filePath, content, "utf8");
  return filePath;
};

const createOversizeJsonFile = async (minSizeBytes = 5 * 1024 * 1024 + 1) => {
  const payload = "x".repeat(minSizeBytes);
  const content = JSON.stringify({ data: payload });
  return createTempFile(content, "json");
};

module.exports = {
  getFixturePath,
  createTempFile,
  createOversizeJsonFile,
};
