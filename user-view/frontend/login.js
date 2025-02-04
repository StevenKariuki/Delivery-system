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

    localStorage.setItem("userName", data.user.name);


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