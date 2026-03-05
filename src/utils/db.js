const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "db.json");

async function writeDb(data) {
  await fsp.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf8");
}

async function ensureDb() {
  if (!fs.existsSync(DB_PATH)) {
    await writeDb({ users: [] });
  }
}

async function readDb() {
  await ensureDb();
  const raw = await fsp.readFile(DB_PATH, "utf8");
  return JSON.parse(raw);
}

module.exports = {
  DB_PATH,
  ensureDb,
  readDb,
  writeDb,
};
