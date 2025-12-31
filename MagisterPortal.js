// API Configuration
// Use relative path (let web server proxy) for both development and production
const API_URL = "https://magister-portal-backend.onrender.com/api";

// Contact form handler
const contactForm = document.getElementById("contactForm");
if (contactForm) {
    contactForm.addEventListener("submit", async function (e) {
        e.preventDefault(); // stop page refresh

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const message = document.getElementById("message").value;
        const status = document.getElementById("formStatus");

        if (!status) {
            console.error("Status element not found");
            return;
        }

        status.textContent = "Sending...";
        status.style.color = "blue";

        try {
            const response = await fetch(`${API_URL}/contact`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, email, message })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to submit");
            }

            status.textContent = data.message || "Message sent successfully!";
            status.style.color = "green";

            contactForm.reset();
        } catch (error) {
            status.textContent = error.message || "Error sending message. Try again.";
            status.style.color = "red";
        }
    });
}

// Signup form handler
const signupForm = document.getElementById("signupForm");
if (signupForm) {
    signupForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const status = document.getElementById("signupStatus");

        if (!status) {
            console.error("Status element not found");
            return;
        }

        // Password must contain at least one number
        const numberRegex = /\d/;

        if (!numberRegex.test(password)) {
            status.textContent = "Password must contain at least one number.";
            status.style.color = "red";
            return;
        }

        if (password !== confirmPassword) {
            status.textContent = "Passwords do not match.";
            status.style.color = "red";
            return;
        }

        status.textContent = "Signing up...";
        status.style.color = "blue";

        try {
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Signup failed");
            }

            // Save token if provided
            if (data.token) {
                localStorage.setItem("magisterToken", data.token);
                localStorage.setItem("magisterUser", JSON.stringify(data.user));
            }

            status.textContent = data.message || "Signup successful! You can now log in.";
            status.style.color = "green";

            signupForm.reset();
        } catch (error) {
            status.textContent = error.message || "Error signing up. Try again.";
            status.style.color = "red";
        }
    });
}

// Login form handler
document.addEventListener("DOMContentLoaded", () => {
console.log("Login form detected");


    const form = document.getElementById("loginForm");
    const status = document.getElementById("loginStatus");

    if (form && status) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;

            if (!email || !password) {
                status.textContent = "Please fill in all fields.";
                status.style.color = "red";
                return;
            }

            status.textContent = "Logging in...";
            status.style.color = "blue";

            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Invalid login details");
                }

                // Save session
                localStorage.setItem("magisterUser", JSON.stringify(data.user));
                localStorage.setItem("magisterToken", data.token);

                status.textContent = data.message || "Login successful! Redirecting...";
                status.style.color = "green";

                setTimeout(() => {
                    window.location.href = "MagisterPortal.html";
                }, 1200);

            } catch (error) {
                status.textContent = error.message || "Error logging in. Try again.";
                status.style.color = "red";
            }
        });
    }

    // Account recovery form handler
    const recoveryForm = document.getElementById("recoveryForm");
    if (recoveryForm) {
        recoveryForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("email").value.trim();
            const status = document.getElementById("recoveryStatus");

            if (!status) {
                console.error("Status element not found");
                return;
            }

            if (!email) {
                status.textContent = "Please enter your email address.";
                status.style.color = "red";
                return;
            }

            status.textContent = "Sending recovery email...";
            status.style.color = "blue";

            try {
                const response = await fetch(`${API_URL}/recover`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to send recovery email");
                }

                status.textContent = data.message || "Recovery email sent! Check your inbox.";
                status.style.color = "green";

                recoveryForm.reset();
            } catch (error) {
                status.textContent = error.message || "Error sending recovery email. Try again.";
                status.style.color = "red";
            }
        });
    }

    // Blog post form handler
    const postForm = document.getElementById("postForm");
    if (postForm) {
        postForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const postText = document.getElementById("postText").value.trim();
            const postMedia = document.getElementById("postMedia").files[0];
            const postsContainer = document.getElementById("postsContainer");

            if (!postText && !postMedia) {
                alert("Please enter text or upload media");
                return;
            }

            // Create post element
            const postDiv = document.createElement("div");
            postDiv.className = "post";

            if (postText) {
                const textP = document.createElement("p");
                textP.textContent = postText;
                postDiv.appendChild(textP);
            }

            if (postMedia) {
                const mediaElement = postMedia.type.startsWith("image/") 
                    ? document.createElement("img") 
                    : document.createElement("video");
                
                mediaElement.src = URL.createObjectURL(postMedia);
                if (mediaElement.tagName === "VIDEO") {
                    mediaElement.controls = true;
                }
                postDiv.appendChild(mediaElement);
            }

            // Add timestamp
            const timestamp = document.createElement("small");
            timestamp.textContent = new Date().toLocaleString();
            timestamp.style.display = "block";
            timestamp.style.marginTop = "10px";
            timestamp.style.color = "#666";
            postDiv.appendChild(timestamp);

            // Insert at the top
            if (postsContainer) {
                postsContainer.insertBefore(postDiv, postsContainer.firstChild);
            }

            // Reset form
            postForm.reset();

            // Try to save to backend
            try {
                const formData = new FormData();
                formData.append("text", postText);
                if (postMedia) {
                    formData.append("media", postMedia);
                }

                const token = localStorage.getItem("magisterToken");
                const headers = {};
                if (token) {
                    headers["Authorization"] = `Bearer ${token}`;
                }

                const response = await fetch(`${API_URL}/posts`, {
                    method: "POST",
                    headers: headers,
                    body: formData
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("Post saved successfully:", data);
                }
            } catch (error) {
                console.error("Failed to save post to backend:", error);
            }
        });
    }
});
