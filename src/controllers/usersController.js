const { readDb } = require("../utils/db");

async function listUsers(req, res) {
  try {
    const db = await readDb();
    const users = db.users.map(({ id, username, createdAt }) => ({
      id,
      username,
      createdAt,
    }));

    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: "Failed to read users" });
  }
}

module.exports = { listUsers };
