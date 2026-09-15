const { randomUUID } = require("node:crypto");
const { resolve } = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const dbPath = resolve(process.cwd(), "dev.db");

const ensureTeams = (count = 1) => {
  const db = new DatabaseSync(dbPath);
  const existing = db
    .prepare("SELECT id, name FROM Team ORDER BY createdAt ASC")
    .all();

  if (existing.length < count) {
    const insert = db.prepare("INSERT INTO Team (id, name) VALUES (?, ?)");
    for (let i = existing.length; i < count; i += 1) {
      const id = randomUUID();
      const name = `E2E Team ${Date.now()}-${i}`;
      insert.run(id, name);
    }
  }

  const updated = db
    .prepare("SELECT id, name FROM Team ORDER BY createdAt ASC")
    .all();
  db.close();
  return updated.slice(0, count);
};

module.exports = {
  ensureTeams,
};
