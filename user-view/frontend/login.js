        document.getElementById("loginForm").addEventListener("submit", async (event) => {
            event.preventDefault();

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            try {
                const response = await fetch("http://localhost:5000/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    // Store token & user name in localStorage
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("userName", data.user.name);

                    alert("Login successful!");
                    window.location.href = "index-user.html"; // Redirect to home page
                } else {
                    alert(data.error || "Login failed. Please try again.");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred. Please try again.");
            }
        });

        document.addEventListener("DOMContentLoaded", () => {
            const userName = localStorage.getItem("userName"); // Retrieve from localStorage

            if (userName) {
                document.getElementById("welcomeMessage").textContent = `Welcome, ${userName}!`;
            }
        });

        // JavaScript to handle log out
        function logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('userName'); // Clear user name from storage
            window.location.href = 'login.html';
        }

        document.addEventListener("DOMContentLoaded", function () {
            const userName = localStorage.getItem("userName");

            if (userName) {
                document.querySelector(".Welcome").textContent = `Welcome, ${userName}`;
            } else {
                document.querySelector(".Welcome").textContent = "Welcome, Guest";
            }
        });
        function logout() {
            const confirmation = confirm("Are you sure you want to log out?");
            if (confirmation) {
                // Perform the logout operation, e.g., redirect to the login page
                alert("You have been logged out successfully.");
                window.location.href = "login.html"; // Replace this with your login page
            } else {
                // If the user cancels, do nothing and stay on the current page
                alert("You are still logged in.");
            }
        }
        
        // Example for dynamically setting the user's name in the welcome message
        window.onload = function () {
            const welcomeMessage = document.getElementById('welcomeMessage');
            const userName = "Steven"; // Dynamically fetch or set the username
            if (userName) {
                welcomeMessage.textContent = `Welcome, ${userName}!`;
            }
        };
        