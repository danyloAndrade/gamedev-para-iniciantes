const { readDb, writeDb } = require("../utils/db");

function serviceError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizePage(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
}

function normalizeLimit(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return 5;
  return Math.min(parsed, 50);
}

async function listUsersPaginated(query) {
  const db = await readDb();
  const users = db.users.map(({ id, username, createdAt }) => ({
    id,
    username,
    createdAt,
  }));

  const page = normalizePage(query.page);
  const limit = normalizeLimit(query.limit);
  const totalItems = users.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;
  const end = start + limit;
  const items = users.slice(start, end);

  return {
    items,
    page: safePage,
    limit,
    totalItems,
    totalPages,
  };
}

async function deleteOwnUser(targetUserId, authUserId) {
  if (targetUserId !== authUserId) {
    throw serviceError(403, "You can only delete your own account");
  }

  const db = await readDb();
  const userIndex = db.users.findIndex((user) => user.id === targetUserId);

  if (userIndex === -1) {
    throw serviceError(404, "User not found");
  }

  const [removedUser] = db.users.splice(userIndex, 1);
  await writeDb(db);

  return {
    message: "User deleted successfully",
    user: {
      id: removedUser.id,
      username: removedUser.username,
    },
  };
}

module.exports = {
  listUsersPaginated,
  deleteOwnUser,
};
