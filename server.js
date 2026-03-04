const express = require("express");
const bcrypt = require("bcrypt");
const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");
const crypto = require("crypto");
let jwt;

try {
  jwt = require("jsonwebtoken");
} catch (error) {
  jwt = null;
}

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, "db.json");
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
const JWT_EXPIRES_IN = "1h";

app.use(express.json());
app.use(express.static(__dirname));

async function readDb() {
  await ensureDb();
  const raw = await fs.readFile(DB_PATH, "utf8");
  return JSON.parse(raw);
}

async function writeDb(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf8");
}

async function ensureDb() {
  if (!fsSync.existsSync(DB_PATH)) {
    const initialDb = { users: [] };
    await writeDb(initialDb);
  }
}

function sanitizeUsername(value) {
  return String(value || "").trim();
}

function ensureJwtLibrary(res) {
  if (jwt) {
    return true;
  }

  res.status(500).json({
    error: "JWT library not installed. Run: npm install jsonwebtoken",
  });
  return false;
}

function authMiddleware(req, res, next) {
  if (!ensureJwtLibrary(res)) {
    return;
  }

  const authHeader = String(req.headers.authorization || "");
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "API is running" });
});

app.get("/api/users", async (req, res) => {
  try {
    const db = await readDb();
    const publicUsers = db.users.map(({ id, username, createdAt }) => ({
      id,
      username,
      createdAt,
    }));
    res.json(publicUsers);
  } catch (error) {
    res.status(500).json({ error: "Failed to read users" });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const username = sanitizeUsername(req.body.username);
    const password = String(req.body.password || "");

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "username and password are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "password must be at least 6 characters" });
    }

    const db = await readDb();
    const exists = db.users.some(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
    if (exists) {
      return res.status(409).json({ error: "username already exists" });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = {
      id: crypto.randomUUID(),
      username,
      passwordHash,
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
});

app.post("/api/login", async (req, res) => {
  try {
    if (!ensureJwtLibrary(res)) {
      return;
    }

    const username = sanitizeUsername(req.body.username);
    const password = String(req.body.password || "");

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "username and password are required" });
    }

    const db = await readDb();
    const user = db.users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

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
});

app.get("/api/profile", authMiddleware, async (req, res) => {
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
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

ensureDb().then(() => {
  app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
  });
});
