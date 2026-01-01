/* ===============================
   API CONFIG
================================ */
const API_URL = "https://magister-portal-backend.onrender.com/api";

/* ===============================
   AUTH HELPERS
================================ */
function getUser() {
    return JSON.parse(localStorage.getItem("magisterUser"));
}

function getToken() {
    return localStorage.getItem("magisterToken");
}

function isLoggedIn() {
    return !!getUser() && !!getToken();
}

function isAdmin() {
    const user = getUser();
    return user && user.role === "admin";
}

function logout() {
    localStorage.removeItem("magisterUser");
    localStorage.removeItem("magisterToken");
    window.location.href = "Login.html";
}

/* ===============================
   PAGE PROTECTION + NAV LOGIC
   (YOUR REQUESTED SNIPPET INCLUDED)
================================ */
document.addEventListener("DOMContentLoaded", () => {
    const user = getUser();

    /* 🔒 Protect pages */
    if (!user && document.body.dataset.protected === "true") {
        window.location.href = "Login.html";
        return;
    }

    /* 👑 Admin-only elements */
    if (isAdmin()) {
        document.querySelectorAll(".admin-only")
            .forEach(el => el.style.display = "block");
    }

    /* 🔐 Login / Logout links */
    const loginLink = document.getElementById("loginLink");
    const logoutLink = document.getElementById("logoutLink");

    if (user) {
        if (loginLink) loginLink.style.display = "none";
        if (logoutLink) logoutLink.style.display = "inline";
    }

    if (logoutLink) {
        logoutLink.addEventListener("click", logout);
    }
});

/* ===============================
   LOGIN
================================ */
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async e => {
        e.preventDefault();

        const email = loginForm.email.value.trim();
        const password = loginForm.password.value;

        const status = document.getElementById("loginStatus");
        status.textContent = "Logging in...";
        status.style.color = "blue";

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message);

            localStorage.setItem("magisterUser", JSON.stringify(data.user));
            localStorage.setItem("magisterToken", data.token);

            status.textContent = "Login successful!";
            status.style.color = "green";

            setTimeout(() => {
                window.location.href = "index.html";
            }, 800);

        } catch (err) {
            status.textContent = err.message;
            status.style.color = "red";
        }
    });
}

/* ===============================
   SIGNUP
================================ */
const signupForm = document.getElementById("signupForm");
if (signupForm) {
    signupForm.addEventListener("submit", async e => {
        e.preventDefault();

        const email = signupForm.email.value.trim();
        const password = signupForm.password.value;
        const confirm = signupForm.confirmPassword.value;
        const status = document.getElementById("signupStatus");

        if (password !== confirm) {
            status.textContent = "Passwords do not match";
            status.style.color = "red";
            return;
        }

        status.textContent = "Creating account...";
        status.style.color = "blue";

        try {
            const res = await fetch(`${API_URL}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            status.textContent = "Signup successful. Please log in.";
            status.style.color = "green";

            signupForm.reset();

        } catch (err) {
            status.textContent = err.message;
            status.style.color = "red";
        }
    });
}

/* ===============================
   PASSWORD RECOVERY
================================ */
const recoveryForm = document.getElementById("recoveryForm");
if (recoveryForm) {
    recoveryForm.addEventListener("submit", async e => {
        e.preventDefault();

        const email = recoveryForm.email.value.trim();
        const status = document.getElementById("recoveryStatus");

        status.textContent = "Sending recovery email...";
        status.style.color = "blue";

        try {
            const res = await fetch(`${API_URL}/auth/recover`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            status.textContent = "Recovery email sent!";
            status.style.color = "green";

        } catch (err) {
            status.textContent = err.message;
            status.style.color = "red";
        }
    });
}

/* ===============================
   CONTACT FORM
================================ */
const contactForm = document.getElementById("contactForm");
if (contactForm) {
    contactForm.addEventListener("submit", async e => {
        e.preventDefault();

        const name = contactForm.name.value;
        const email = contactForm.email.value;
        const message = contactForm.message.value;
        const status = document.getElementById("formStatus");

        status.textContent = "Sending...";
        status.style.color = "blue";

        try {
            const res = await fetch(`${API_URL}/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, message })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            status.textContent = "Message sent!";
            status.style.color = "green";
            contactForm.reset();

        } catch (err) {
            status.textContent = err.message;
            status.style.color = "red";
        }
    });
}

/* ===============================
   BLOG REACTIONS (LIKE / LOVE)
================================ */
async function reactPost(postId, type) {
    try {
        const res = await fetch(`${API_URL}/posts/${postId}/react`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`
            },
            body: JSON.stringify({ type })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        document.getElementById(`like-${postId}`).textContent = data.likes;
        document.getElementById(`love-${postId}`).textContent = data.loves;

    } catch (err) {
        alert(err.message);
    }
}
