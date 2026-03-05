function health(req, res) {
  res.json({ ok: true, message: "API is running" });
}

module.exports = { health };
