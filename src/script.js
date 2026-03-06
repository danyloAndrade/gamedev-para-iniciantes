const healthText = document.getElementById("health-text");
const usersList = document.getElementById("users-list");
const reloadUsersButton = document.getElementById("reload-users");
const prevPageButton = document.getElementById("prev-page");
const nextPageButton = document.getElementById("next-page");
const pageInfo = document.getElementById("page-info");

const registerForm = document.getElementById("register-form");
const registerMessage = document.getElementById("register-message");

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");
const loadProfileButton = document.getElementById("load-profile");
const deleteAccountButton = document.getElementById("delete-account");
const profileMessage = document.getElementById("profile-message");

const TOKEN_KEY = "gc_token";
const USER_ID_KEY = "gc_user_id";
const usersPagination = {
  page: 1,
  limit: 5,
  totalPages: 1,
};

function setMessage(target, text, type) {
  target.textContent = text;
  target.classList.remove("ok", "error");

  if (type) {
    target.classList.add(type);
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
    const data = await requestJson(
      `/api/users?page=${usersPagination.page}&limit=${usersPagination.limit}`
    );

    const items = Array.isArray(data) ? data : data.items || [];
    const currentPage = Array.isArray(data) ? 1 : data.page || 1;
    const totalPages = Array.isArray(data) ? 1 : data.totalPages || 1;

    usersPagination.page = currentPage;
    usersPagination.totalPages = totalPages;

    pageInfo.textContent = `Pagina ${currentPage} de ${totalPages}`;
    prevPageButton.disabled = currentPage <= 1;
    nextPageButton.disabled = currentPage >= totalPages;

    renderUsers(items);
  } catch (error) {
    usersList.innerHTML = `<li>Failed to load users: ${error.message}</li>`;
  }
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

function getUserId() {
  return localStorage.getItem(USER_ID_KEY) || "";
}

function saveAuth(token, userId) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_ID_KEY, userId);
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
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
    usersPagination.page = 1;
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

    if (result.token) {
      saveAuth(result.token, result.user?.id || "");
      setMessage(
        profileMessage,
        "Token salvo. Clique em 'Load My Profile' para testar a rota protegida.",
        "ok"
      );
    }

    setMessage(loginMessage, result.message, "ok");
    loginForm.reset();
  } catch (error) {
    setMessage(loginMessage, error.message, "error");
  }
});

reloadUsersButton.addEventListener("click", loadUsers);

prevPageButton.addEventListener("click", async () => {
  if (usersPagination.page <= 1) {
    return;
  }

  usersPagination.page -= 1;
  await loadUsers();
});

nextPageButton.addEventListener("click", async () => {
  if (usersPagination.page >= usersPagination.totalPages) {
    return;
  }

  usersPagination.page += 1;
  await loadUsers();
});

loadProfileButton.addEventListener("click", async () => {
  const token = getToken();
  if (!token) {
    setMessage(profileMessage, "Faca login primeiro para obter o token.", "error");
    return;
  }

  try {
    const profile = await requestJson("/api/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    localStorage.setItem(USER_ID_KEY, profile.id);
    setMessage(
      profileMessage,
      `Autorizado: ${profile.username} (criado em ${new Date(profile.createdAt).toLocaleString()})`,
      "ok"
    );
  } catch (error) {
    setMessage(profileMessage, error.message, "error");
  }
});

deleteAccountButton.addEventListener("click", async () => {
  const token = getToken();
  if (!token) {
    setMessage(profileMessage, "Faca login primeiro para excluir sua conta.", "error");
    return;
  }

  let userId = getUserId();

  try {
    if (!userId) {
      const profile = await requestJson("/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      userId = profile.id;
      localStorage.setItem(USER_ID_KEY, userId);
    }

    const confirmed = window.confirm("Tem certeza que deseja excluir sua conta?");
    if (!confirmed) {
      return;
    }

    await requestJson(`/api/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    clearAuth();
    setMessage(loginMessage, "Conta excluida com sucesso.", "ok");
    setMessage(profileMessage, "Sua conta foi removida.", "ok");
    usersPagination.page = 1;
    await loadUsers();
  } catch (error) {
    setMessage(profileMessage, error.message, "error");
  }
});

loadHealth();
loadUsers();
