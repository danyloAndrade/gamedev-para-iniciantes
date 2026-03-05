const { readDb, writeDb } = require("../utils/db");

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

async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    if (id !== req.user.id) {
      return res.status(403).json({ error: "You can only delete your own account" });
    }

    const db = await readDb();
    const userIndex = db.users.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    const [removedUser] = db.users.splice(userIndex, 1);
    await writeDb(db);

    return res.json({
      message: "User deleted successfully",
      user: {
        id: removedUser.id,
        username: removedUser.username,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete user" });
  }
}

module.exports = {
  listUsers,
  deleteUser,
};
