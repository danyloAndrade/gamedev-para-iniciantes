const { listUsersPaginated, deleteOwnUser } = require("../services/usersService");

async function listUsers(req, res) {
  try {
    const result = await listUsersPaginated(req.query);
    return res.json(result);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message || "Failed to read users" });
  }
}

async function deleteUser(req, res) {
  try {
    const result = await deleteOwnUser(req.params.id, req.user.id);
    return res.json(result);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message || "Failed to delete user" });
  }
}

module.exports = {
  listUsers,
  deleteUser,
};
