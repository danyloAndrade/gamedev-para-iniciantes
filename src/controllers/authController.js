const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { readDb, writeDb } = require("../utils/db");
const { jwt, ensureJwtLibrary } = require("../utils/jwt");

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
const JWT_EXPIRES_IN = "1h";

function sanitizeUsername(value) {
  return String(value || "").trim();
}

async function register(req, res) {
  try {
    const username = sanitizeUsername(req.body.username);
    const password = String(req.body.password || "");

    if (!username || !password) {
      return res.status(400).json({ error: "username and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "password must be at least 6 characters" });
    }

    const db = await readDb();
    const exists = db.users.some(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );

    if (exists) {
      return res.status(409).json({ error: "username already exists" });
    }

    const newUser = {
      id: crypto.randomUUID(),
      username,
      passwordHash: await bcrypt.hash(password, SALT_ROUNDS),
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    await writeDb(db);

    return res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      createdAt: newUser.createdAt,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to register user" });
  }
}

async function login(req, res) {
  try {
    if (!ensureJwtLibrary(res)) {
      return;
    }

    const username = sanitizeUsername(req.body.username);
    const password = String(req.body.password || "");

    if (!username || !password) {
      return res.status(400).json({ error: "username and password are required" });
    }

    const db = await readDb();
    const user = db.users.find(
      (item) => item.username.toLowerCase() === username.toLowerCase()
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to login" });
  }
}

async function profile(req, res) {
  try {
    const db = await readDb();
    const user = db.users.find((item) => item.id === req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to load profile" });
  }
}

module.exports = {
  register,
  login,
  profile,
};
