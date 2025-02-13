require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require('cors');

app.use(cors());

const app = express();
app.use(cors({ origin: "http://your-frontend-domain.com" })); // Update with your frontend URL
app.use(express.json()); // Allow JSON requests

// MySQL Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "", // Default MySQL password is empty
    database: "food_delivery_system"
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed: " + err.message);
        process.exit(1); // Exit the process if database connection fails
    }
    console.log("Connected to Steven's MySQL Database ✅");
});

// Helper function to use async/await with MySQL
const query = (sql, params) => new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
        if (err) reject(err);
        else resolve(results);
    });
});

// JWT Secret from environment variables
const jwtSecret = process.env.JWT_SECRET || "default_secret";

// Test Route
app.get("/", (req, res) => {
    res.send("Food Delivery API is Running!");
});

// Middleware to Authenticate Token
const authenticateToken = (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader) return res.status(401).json({ error: "Access denied" });

    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = user;
        next();
    });
};

// Get all users
app.get("/users", async (req, res) => {
    try {
        const users = await query("SELECT * FROM users");
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all menu items
app.get("/menu", async (req, res) => {
    try {
        const menu = await query("SELECT * FROM menu_items");
        res.json(menu);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all orders
app.get("/orders", async (req, res) => {
    try {
        const orders = await query("SELECT * FROM orders");
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// User Signup Route
app.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        // Check if the user already exists
        const existingUser = await query("SELECT * FROM users WHERE email = ?", [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "User already exists!" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user in the database with default role "customer"
        await query("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", 
            [name, email, hashedPassword, "customer"]);

        res.status(201).json({ message: "User created successfully!" });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Server error, please try again!" });
    }
});

// User Login Route
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const users = await query("SELECT * FROM users WHERE email = ?", [email]);

        if (users.length === 0) {
            return res.status(400).json({ error: "User not found" });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role }, 
            jwtSecret,
            { expiresIn: "1h" }
        );

        res.json({ 
            message: "Login successful", 
            token, 
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error, please try again!" });
    }
});

// Logout Route
app.post("/logout", (req, res) => {
    res.json({ message: "Logout successful" });
});

// Profile Route (Protected)
app.get("/profile", authenticateToken, (req, res) => {
    res.json({ message: "Welcome to your profile!", user: req.user });
});

// Route to Edit User Profile (Protected)
app.put("/profile/edit", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id; // Extract user ID from the token
        const { name, email, password } = req.body;

        // Check if at least one field is provided for update
        if (!name && !email && !password) {
            return res.status(400).json({ message: "At least one field must be provided for update!" });
        }

        // Fetch the current user from the database
        const users = await query("SELECT * FROM users WHERE id = ?", [userId]);
        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update fields only if they are provided
        let updateFields = [];
        let updateParams = [];

        if (name) {
            updateFields.push("name = ?");
            updateParams.push(name);
        }
        if (email) {
            updateFields.push("email = ?");
            updateParams.push(email);
        }
        if (password) {
            // Hash the new password before saving
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.push("password = ?");
            updateParams.push(hashedPassword);
        }

        // Add the user ID to the parameters array
        updateParams.push(userId);

        // Update the user's profile in the database
        const updateQuery = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`;
        await query(updateQuery, updateParams);

        res.json({ message: "Profile updated successfully!" });
    } catch (error) {
        console.error("Profile Edit Error:", error);
        res.status(500).json({ message: "Server error, please try again!" });
    }
});


// Route to Add Item to Cart
app.post("/api/add-to-cart", authenticateToken, async (req, res) => {
    try {
        const { foodItemId, quantity } = req.body;
        const userId = req.user.id;  // Extract user id from the token

        if (!foodItemId || !quantity) {
            return res.status(400).json({ message: "Food item ID and quantity are required!" });
        }

        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({ message: "Quantity must be a positive integer" });
        }

        // Check if item already exists in the user's cart
        const existingItem = await query(
            "SELECT * FROM cart WHERE user_id = ? AND food_item_id = ?",
            [userId, foodItemId]
        );

        if (existingItem.length > 0) {
            // If item already exists, update the quantity
            await query(
                "UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND food_item_id = ?",
                [quantity, userId, foodItemId]
            );
            return res.json({ message: "Cart item updated" });
        } else {
            // If item doesn't exist, add new item to the cart
            await query(
                "INSERT INTO cart (user_id, food_item_id, quantity) VALUES (?, ?, ?)",
                [userId, foodItemId, quantity]
            );
            return res.json({ message: "Item added to cart" });
        }
    } catch (error) {
        console.error("Add to Cart Error:", error);
        res.status(500).json({ message: "Server error, please try again!" });
    }
});

// Get cart items
app.get("/api/cart", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;  // Extract user id from the token

        // Fetch all cart items for the user
        const cartItems = await query(
            "SELECT cart.quantity, menu_items.name, menu_items.price FROM cart JOIN menu_items ON cart.food_item_id = menu_items.id WHERE cart.user_id = ?",
            [userId]
        );

        res.json(cartItems);
    } catch (error) {
        console.error("Get Cart Error:", error);
        res.status(500).json({ message: "Server error, please try again!" });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀`);
});
