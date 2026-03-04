const healthText = document.getElementById("health-text");
const usersList = document.getElementById("users-list");
const reloadUsersButton = document.getElementById("reload-users");

const registerForm = document.getElementById("register-form");
const registerMessage = document.getElementById("register-message");

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

function setMessage(target, text, type) {
  target.textContent = text;
  target.classList.remove("ok", "error");

  if (type) {
    target.classList.add(type);j
  }
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.error || "Request failed";
    throw new Error(message);
  }

  return data;
}

async function loadHealth() {
  try {
    const data = await requestJson("/api/health");
    healthText.textContent = data.message;
  } catch (error) {
    healthText.textContent = `Server unavailable: ${error.message}`;
  }
}

function renderUsers(users) {
  usersList.innerHTML = "";

  if (users.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "No users yet. Register the first account.";
    usersList.appendChild(empty);
    return;
  }

  users.forEach((user) => {
    const item = document.createElement("li");
    item.textContent = `${user.username} (created: ${new Date(user.createdAt).toLocaleString()})`;
    usersList.appendChild(item);
  });
}

async function loadUsers() {
  try {
    const users = await requestJson("/api/users");
    renderUsers(users);
  } catch (error) {
    usersList.innerHTML = `<li>Failed to load users: ${error.message}</li>`;
  }
}

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(registerForm);
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  try {
    const user = await requestJson("/api/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    setMessage(registerMessage, `User ${user.username} created successfully.`, "ok");
    registerForm.reset();
    await loadUsers();
  } catch (error) {
    setMessage(registerMessage, error.message, "error");
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  try {
    const result = await requestJson("/api/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    setMessage(loginMessage, result.message, "ok");
    loginForm.reset();
  } catch (error) {
    setMessage(loginMessage, error.message, "error");
  }
});

reloadUsersButton.addEventListener("click", loadUsers);

loadHealth();
loadUsers();
