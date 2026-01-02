/* ===============================
   GLOBAL CONFIG
================================ */
const API_URL = "https://magister-portal-backend.onrender.com/api";

/* ===============================
   AUTH STATE
================================ */
function getUser() {
  return JSON.parse(localStorage.getItem("magisterUser"));
}

function getToken() {
  return localStorage.getItem("magisterToken");
}

function isLoggedIn() {
  return !!getToken();
}

function isAdmin() {
  const user = getUser();
  return user && user.role === "admin";
}

/* ===============================
   PAGE BOOTSTRAP
================================ */
document.addEventListener("DOMContentLoaded", () => {
  protectPage();
  setupAuthUI();
  setupForms();
  loadPosts();
});

/* ===============================
   PAGE PROTECTION
================================ */
function protectPage() {
  if (document.body.dataset.protected === "true" && !isLoggedIn()) {
    window.location.href = "Login.html";
  }
}

/* ===============================
   HEADER UI
================================ */
function setupAuthUI() {
  const loginLink = document.getElementById("loginLink");
  const logoutLink = document.getElementById("logoutLink");

  if (isLoggedIn()) {
    loginLink && (loginLink.style.display = "none");
    logoutLink && (logoutLink.style.display = "inline");
  } else {
    logoutLink && (logoutLink.style.display = "none");
  }

  if (isAdmin()) {
    document.querySelectorAll(".admin-only")
      .forEach(el => el.style.display = "block");
  }

  logoutLink?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "Login.html";
  });
}

/* ===============================
   FORMS
================================ */
function setupForms() {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  loginForm && loginForm.addEventListener("submit", handleLogin);
  signupForm && signupForm.addEventListener("submit", handleSignup);
}

/* ===============================
   LOGIN
================================ */
async function handleLogin(e) {
  e.preventDefault();

  const email = loginEmail.value.trim();
  const password = loginPassword.value;
  const status = loginStatus;

  status.textContent = "Logging in...";
  status.style.color = "blue";

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw data.message;

    localStorage.setItem("magisterUser", JSON.stringify(data.user));
    localStorage.setItem("magisterToken", data.token);

    status.textContent = "Login successful!";
    status.style.color = "green";

    setTimeout(() => window.location.href = "Blog.html", 800);
  } catch (err) {
    status.textContent = err;
    status.style.color = "red";
  }
}

/* ===============================
   SIGNUP
================================ */
async function handleSignup(e) {
  e.preventDefault();

  const email = signupEmail.value.trim();
  const password = signupPassword.value;
  const confirm = signupConfirm.value;
  const status = signupStatus;

  if (password !== confirm) {
    status.textContent = "Passwords do not match.";
    status.style.color = "red";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw data.message;

    status.textContent = "Account created. Redirecting...";
    status.style.color = "green";

    setTimeout(() => window.location.href = "Login.html", 1200);
  } catch (err) {
    status.textContent = err;
    status.style.color = "red";
  }
}

/* ===============================
   BLOG POSTS
================================ */
async function loadPosts() {
  const container = document.getElementById("postsContainer");
  if (!container) return;

  const res = await fetch(`${API_URL}/posts`);
  const posts = await res.json();

  container.innerHTML = "";

  posts.forEach(post => {
    container.innerHTML += renderPost(post);
  });

  disableGuestActions();
}

/* ===============================
   RENDER POST
================================ */
function renderPost(post) {
  return `
    <div class="post">
      <p>${post.text}</p>

      <div class="reactions">
        <button onclick="reactPost('${post._id}','like')">👍</button>
        <span>${post.likes || 0}</span>

        <button onclick="reactPost('${post._id}','love')">❤️</button>
        <span>${post.loves || 0}</span>
      </div>

      <div class="comments">
        ${(post.comments || []).map(c => `<p>${c.text}</p>`).join("")}
      </div>

      <input
        class="comment-input"
        placeholder="Write a comment..."
        onkeydown="submitComment(event,'${post._id}')"
      />
    </div>
  `;
}

/* ===============================
   REACT
================================ */
async function reactPost(postId, type) {
  if (!isLoggedIn()) return alert("Please login to react.");

  await fetch(`${API_URL}/posts/${postId}/react`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({ type })
  });

  loadPosts();
}

/* ===============================
   COMMENT
================================ */
async function submitComment(e, postId) {
  if (e.key !== "Enter") return;
  if (!isLoggedIn()) return alert("Please login to comment.");

  await fetch(`${API_URL}/posts/${postId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({ text: e.target.value })
  });

  e.target.value = "";
  loadPosts();
}

/* ===============================
   DISABLE GUEST INPUT
================================ */
function disableGuestActions() {
  if (isLoggedIn()) return;

  document.querySelectorAll(".comment-input")
    .forEach(i => i.disabled = true);
}

/* ===============================
   ADMIN DASHBOARD
================================ */
document.addEventListener("DOMContentLoaded", () => {
  if (!isAdmin()) return;

  const createBtn = document.getElementById("createPostBtn");
  createBtn && createBtn.addEventListener("click", createPost);

  loadAdminPosts();
});

/* ===============================
   CREATE POST (ADMIN)
================================ */
async function createPost() {
  const text = document.getElementById("postText").value.trim();
  const status = document.getElementById("postStatus");

  if (!text) {
    status.textContent = "Post cannot be empty.";
    status.style.color = "red";
    return;
  }

  status.textContent = "Publishing...";
  status.style.color = "blue";

  try {
    const res = await fetch(`${API_URL}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify({ text })
    });

    if (!res.ok) throw "Failed to publish post.";

    document.getElementById("postText").value = "";
    status.textContent = "Post published successfully!";
    status.style.color = "green";

    loadAdminPosts();
    loadPosts(); // refresh blog if open
  } catch (err) {
    status.textContent = err;
    status.style.color = "red";
  }
}

/* ===============================
   LOAD POSTS (ADMIN VIEW)
================================ */
async function loadAdminPosts() {
  const container = document.getElementById("adminPosts");
  if (!container) return;

  const res = await fetch(`${API_URL}/posts`);
  const posts = await res.json();

  container.innerHTML = posts.map(post => `
    <div class="post admin-post">
      <p>${post.text}</p>
      <button onclick="deletePost('${post._id}')">Delete</button>
    </div>
  `).join("");
}

/* ===============================
   DELETE POST (ADMIN)
================================ */
async function deletePost(postId) {
  if (!confirm("Delete this post?")) return;

  await fetch(`${API_URL}/posts/${postId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  loadAdminPosts();
  loadPosts();
}

/* ================================
   AUTH & ROUTE PROTECTION
================================ */

function getAuth() {
  return {
    token: localStorage.getItem("token"),
    role: localStorage.getItem("userRole"),
  };
}

function requireLogin() {
  const { token } = getAuth();
  if (!token) {
    alert("You must be logged in.");
    window.location.href = "Login.html";
  }
}

function requireAdmin() {
  const { token, role } = getAuth();

  if (!token) {
    alert("Please login first.");
    window.location.href = "Login.html";
    return;
  }

  if (role !== "admin") {
    alert("Access denied. Admins only.");
    window.location.href = "index.html";
  }
}

function requireUser() {
  const { token } = getAuth();

  if (!token) {
    alert("Please login to interact.");
    window.location.href = "Login.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const { role } = getAuth();

  document.querySelectorAll(".admin-only").forEach(el => {
    if (role !== "admin") {
      el.style.display = "none";
    }
  });
});
