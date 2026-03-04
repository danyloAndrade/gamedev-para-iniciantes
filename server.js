const express = require("express");
const bcrypt = require("bcrypt");
const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, "db.json");
const SALT_ROUNDS = 10;

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

    return res.json({ message: "Login successful" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to login" });
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
