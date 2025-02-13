document.addEventListener("DOMContentLoaded", () => {
    // Attach event listener for login form submission
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            await handleLogin();
        });
    }

    // Update welcome message
    updateWelcomeMessage();

    // Attach logout event listener
    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
        logoutButton.addEventListener("click", handleLogout);
    }
});

// Function to handle login
async function handleLogin() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Please fill out both email and password fields.");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // Store token and user info in localStorage
            localStorage.setItem("token", data.token); // Consider storing token in an HTTP-only cookie for better security
            localStorage.setItem("userName", data.user.name);

            alert("Login successful!");
            window.location.href = "index-user.html"; // Redirect to home page
        } else {
            alert(data.error || "Invalid login credentials. Please try again.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An unexpected error occurred. Please check your connection and try again.");
    }
}

// Function to handle logout
function handleLogout() {
    const confirmation = confirm("Are you sure you want to log out?");
    if (confirmation) {
        // Clear user data from localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("userName");

        alert("You have been logged out successfully.");
        window.location.href = "login.html"; // Redirect to login page
    }
}

// Function to update the welcome message
function updateWelcomeMessage() {
    const userName = localStorage.getItem("userName");
    const welcomeMessageElements = document.querySelectorAll(".Welcome, #welcomeMessage");

    // Update all welcome message elements
    welcomeMessageElements.forEach((element) => {
        element.textContent = userName ? `Welcome, ${userName}!` : "Welcome, Guest!";
    });
}

// Optional: Token expiration (future enhancement)
// You can implement a token expiration check to automatically log out users after a certain time or upon expiration.
