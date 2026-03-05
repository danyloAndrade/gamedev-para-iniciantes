const { Router } = require("express");
const { health } = require("../controllers/healthController");
const { listUsers } = require("../controllers/usersController");
const { register, login, profile } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = Router();

router.get("/health", health);
router.get("/users", listUsers);
router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, profile);

module.exports = router;
