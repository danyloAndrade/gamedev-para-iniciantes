const {
  registerUser,
  loginUser,
  getProfileByUserId,
} = require("../services/authService");

async function register(req, res) {
  try {
    const createdUser = await registerUser(req.body);
    return res.status(201).json(createdUser);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message || "Failed to register user" });
  }
}

async function login(req, res) {
  try {
    const loginResult = await loginUser(req.body);
    return res.json(loginResult);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message || "Failed to login" });
  }
}

async function profile(req, res) {
  try {
    const profileData = await getProfileByUserId(req.user.id);
    return res.json(profileData);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message || "Failed to load profile" });
  }
}

module.exports = {
  register,
  login,
  profile,
};
