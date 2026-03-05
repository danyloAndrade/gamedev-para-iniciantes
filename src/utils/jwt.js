let jwt;

try {
  jwt = require("jsonwebtoken");
} catch (error) {
  jwt = null;
}

function ensureJwtLibrary(res) {
  if (jwt) return true;

  res.status(500).json({
    error: "JWT library not installed. Run: npm install jsonwebtoken",
  });
  return false;
}

module.exports = {
  jwt,
  ensureJwtLibrary,
};
