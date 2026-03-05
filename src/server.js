require("dotenv").config();

const express = require("express");
const path = require("path");
const { ensureDb } = require("./utils/db");
const apiRoutes = require("./routes");

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.join(__dirname, "..");

app.use(express.json());
app.use(express.static(ROOT_DIR));

app.use("/api", apiRoutes);

app.use((req, res) => {
  res.sendFile(path.join(ROOT_DIR, "index.html"));
});

ensureDb().then(() => {
  app.listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}`);
  });
});
