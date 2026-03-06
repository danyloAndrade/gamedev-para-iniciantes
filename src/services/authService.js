const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { readDb, writeDb } = require("../utils/db");
const { jwt, ensureJwtLibrary } = require("../utils/jwt");

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
const JWT_EXPIRES_IN = "1h";

function serviceError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function sanitizeUsername(value) {
  return String(value || "").trim();
}

function validateJwtAvailability() {
  if (!ensureJwtLibrary()) {
    throw serviceError(500, "JWT library not installed. Run: npm install jsonwebtoken");
  }
}

async function registerUser(payload) {
  const username = sanitizeUsername(payload.username);
  const password = String(payload.password || "");

  if (!username || !password) {
    throw serviceError(400, "username and password are required");
  }

  if (password.length < 6) {
    throw serviceError(400, "password must be at least 6 characters");
  }

  const db = await readDb();
  const exists = db.users.some(
    (user) => user.username.toLowerCase() === username.toLowerCase()
  );

  if (exists) {
    throw serviceError(409, "username already exists");
  }

  const newUser = {
    id: crypto.randomUUID(),
    username,
    passwordHash: await bcrypt.hash(password, SALT_ROUNDS),
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  await writeDb(db);

  return {
    id: newUser.id,
    username: newUser.username,
    createdAt: newUser.createdAt,
  };
}

async function loginUser(payload) {
  validateJwtAvailability();

  const username = sanitizeUsername(payload.username);
  const password = String(payload.password || "");

  if (!username || !password) {
    throw serviceError(400, "username and password are required");
  }

  const db = await readDb();
  const user = db.users.find(
    (item) => item.username.toLowerCase() === username.toLowerCase()
  );

  if (!user) {
    throw serviceError(401, "Invalid credentials");
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw serviceError(401, "Invalid credentials");
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return {
    message: "Login successful",
    token,
    user: {
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
    },
  };
}

async function getProfileByUserId(userId) {
  const db = await readDb();
  const user = db.users.find((item) => item.id === userId);

  if (!user) {
    throw serviceError(404, "User not found");
  }

  return {
    id: user.id,
    username: user.username,
    createdAt: user.createdAt,
  };
}

module.exports = {
  registerUser,
  loginUser,
  getProfileByUserId,
};
