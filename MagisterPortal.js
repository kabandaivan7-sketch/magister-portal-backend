/* ===============================
   GLOBAL CONFIG
================================ */
const API_URL = "https://magister-portal-backend.onrender.com/api";

/* ===============================
   AUTH STATE
================================ */
function getUser() {
  try {
    return JSON.parse(localStorage.getItem("magisterUser"));
  } catch (_) {
    return null;
  }
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

  // Admin bootstrap
  if (isAdmin()) {
    const createBtn = document.getElementById("createPostBtn");
    createBtn && createBtn.addEventListener("click", createPost);
    loadAdminPosts();
  }

  // Toggle admin-only sections consistently
  document.querySelectorAll(".admin-only").forEach(el => {
    el.style.display = isAdmin() ? "block" : "none";
  });
});

/* ===============================
   PAGE PROTECTION
================================ */
function protectPage() {
  const isProtected = document.body.dataset.protected === "true";
  if (isProtected && !isLoggedIn()) {
    window.location.href = "Login.html";
    return;
  }
  const isAdminPage = location.pathname.toLowerCase().endsWith("/admin.html");
  if (isAdminPage && !isAdmin()) {
    alert("Access denied. Admins only.");
    window.location.href = "index.html";
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
    loginLink && (loginLink.style.display = "inline");
  }

  if (isAdmin()) {
    document.querySelectorAll(".admin-only").forEach(el => (el.style.display = "block"));
  }

  logoutLink?.addEventListener("click", (e) => {
    e.preventDefault();
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
  const contactForm = document.getElementById("contactForm");
  const recoveryForm = document.getElementById("recoveryForm");

  loginForm && loginForm.addEventListener("submit", handleLogin);
  signupForm && signupForm.addEventListener("submit", handleSignup);
  contactForm && contactForm.addEventListener("submit", handleContactSubmit);
  recoveryForm && recoveryForm.addEventListener("submit", handleRecoverySubmit);
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
    if (!res.ok) throw data.message || "Login failed";

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
    if (!res.ok) throw data.message || "Signup failed";

    status.textContent = "Account created. Redirecting...";
    status.style.color = "green";

    setTimeout(() => window.location.href = "Login.html", 1200);
  } catch (err) {
    status.textContent = err;
    status.style.color = "red";
  }
}

/* ===============================
   CONTACT & RECOVERY FORMS
================================ */
async function handleContactSubmit(e) {
  e.preventDefault();
  const status = document.getElementById("formStatus");
  const name = (document.getElementById("contactName")?.value || "").trim();
  const email = (document.getElementById("contactEmail")?.value || "").trim();
  const message = (document.getElementById("contactMessage")?.value || "").trim();

  if (!name || !email || !message) {
    if (status) {
      status.textContent = "Please fill in all fields.";
      status.style.color = "red";
    }
    return;
  }

  if (status) {
    status.textContent = "Sending...";
    status.style.color = "blue";
  }

  try {
    const res = await fetch(`${API_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message })
    });
    const data = await res.json();
    if (!res.ok) throw data.message || "Failed to send message.";

    if (status) {
      status.textContent = data.message || "Message sent!";
      status.style.color = "green";
    }
  } catch (err) {
    if (status) {
      status.textContent = err;
      status.style.color = "red";
    }
  }
}

async function handleRecoverySubmit(e) {
  e.preventDefault();
  const status = document.getElementById("recoveryStatus");
  const emailInput = document.getElementById("recoveryEmail") || document.getElementById("email");
  const email = (emailInput?.value || "").trim();

  if (!email) {
    if (status) {
      status.textContent = "Please enter your email address.";
      status.style.color = "red";
    }
    return;
  }

  if (status) {
    status.textContent = "Sending recovery email...";
    status.style.color = "blue";
  }

  try {
    const res = await fetch(`${API_URL}/recovery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw data.message || "Failed to send recovery email.";

    if (status) {
      status.textContent = data.message || "If an account exists, a recovery email was sent.";
      status.style.color = "green";
    }
  } catch (err) {
    if (status) {
      status.textContent = err;
      status.style.color = "red";
    }
  }
}

/* ===============================
   BLOG POSTS
================================ */
async function loadPosts() {
  const container = document.getElementById("postsContainer");
  if (!container) return;

  try {
    const res = await fetch(`${API_URL}/posts`);
    const posts = await res.json();

    container.innerHTML = "";

    posts.forEach(post => {
      container.innerHTML += renderPost(post);
    });

    disableGuestActions();
  } catch (_) {
    container.innerHTML = "<p>Failed to load posts.</p>";
  }
}

/* ===============================
   RENDER POST (escaped)
================================ */
function escapeHTML(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderPost(post) {
  const text = escapeHTML(post.text || "");
  const likes = post.likes || 0;
  const loves = post.loves || 0;
  const comments = (post.comments || [])
    .map(c => `<p>${escapeHTML(c.text)}</p>`)
    .join("");

  return `
    <div class="post">
      <p>${text}</p>

      <div class="reactions">
        <button onclick="reactPost('${post._id}','like')">👍</button>
        <span>${likes}</span>

        <button onclick="reactPost('${post._id}','love')">❤️</button>
        <span>${loves}</span>
      </div>

      <div class="comments">
        ${comments}
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

  document.querySelectorAll(".comment-input").forEach(i => (i.disabled = true));
}

/* ===============================
   ADMIN DASHBOARD
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

async function loadAdminPosts() {
  const container = document.getElementById("adminPosts");
  if (!container) return;

  try {
    const res = await fetch(`${API_URL}/posts`);
    const posts = await res.json();

    container.innerHTML = posts
      .map(post => `
    <div class="post admin-post">
      <p>${escapeHTML(post.text)}</p>
      <button onclick="deletePost('${post._id}')">Delete</button>
    </div>
  `)
      .join("");
  } catch (_) {
    container.innerHTML = "<p>Failed to load posts.</p>";
  }
}

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
   AUTH & ROUTE PROTECTION HELPERS
================================ */
function getAuth() {
  const user = getUser();
  return {
    token: getToken(),
    role: user ? user.role : undefined,
  };
}

function requireLogin() {
  if (!isLoggedIn()) {
    alert("You must be logged in.");
    window.location.href = "Login.html";
  }
}

function requireAdmin() {
  if (!isLoggedIn()) {
    alert("Please login first.");
    window.location.href = "Login.html";
    return;
  }

  if (!isAdmin()) {
    alert("Access denied. Admins only.");
    window.location.href = "index.html";
  }
}

function requireUser() {
  if (!isLoggedIn()) {
    alert("Please login to interact.");
    window.location.href = "Login.html";
  }
}
