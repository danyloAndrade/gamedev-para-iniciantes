const { jwt, ensureJwtLibrary } = require("../utils/jwt");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

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
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = authMiddleware;
