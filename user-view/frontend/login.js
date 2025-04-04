document.addEventListener("DOMContentLoaded", () => {
    // Attach event listener for login form submission
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            await handleLogin();
        });
    } else {
        console.error("Login form not found");
    }

    // Update welcome message
    updateWelcomeMessage();

    // Attach event listener for logout button
    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
        logoutButton.addEventListener("click", handleLogout);
    } else {
        console.error("Logout button not found");
    }

    // Fetch menu items after page load
    fetchMenuItems();
});

// Search functionality
function searchRestaurants() {
    const searchQuery = document.getElementById("searchInput").value.toLowerCase();
    const restaurantCards = document.querySelectorAll(".restaurant-card");

    restaurantCards.forEach((card) => {
        const restaurantName = card.querySelector("h3").textContent.toLowerCase();
        if (restaurantName.includes(searchQuery)) {
            card.style.display = "block"; // Show the card
        } else {
            card.style.display = "none"; // Hide the card
        }
    });
}

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
    const welcomeMessageElements = document.querySelectorAll(".welcome-message");
    const userName = localStorage.getItem("userName");

    if (welcomeMessageElements.length > 0) {
        welcomeMessageElements.forEach((element) => {
            element.textContent = userName ? `Welcome, ${userName}!` : "Welcome, Guest!";
        });
    } else {
        console.error("Welcome message elements not found");
    }
}


