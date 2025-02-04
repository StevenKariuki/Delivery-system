require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json()); // Allow JSON requests

// MySQL Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",  // Default MySQL password is empty
    database: "food_delivery_system"
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed: " + err.message);
    } else {
        console.log("Connected to MySQL Database ✅");
    }
});

// Test Route
app.get("/", (req, res) => {
    res.send("Food Delivery API is Running!");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀`);
});

// Get all users
app.get("/users", (req, res) => {
    db.query("SELECT * FROM users", (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Get all menu items
app.get("/menu", (req, res) => {
    db.query("SELECT * FROM menu_items", (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Get all orders
app.get("/orders", (req, res) => {
    db.query("SELECT * FROM orders", (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});


// User Signup Route
app.post("/register", (req, res) => {
    const { name, email, password } = req.body;

    // Check if email already exists
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
        if (result.length > 0) {
            return res.status(400).json({ error: "Email already exists" });
        }

        // Hash Password
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) return res.status(500).json({ error: "Error hashing password" });

            // Insert User into Database
            db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", 
                [name, email, hash], (err, result) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.status(201).json({ message: "User registered successfully!" });
                }
            );
        });
    });
});


// User Login Route
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    // Find User by Email
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
        if (result.length === 0) {
            return res.status(400).json({ error: "User not found" });
        }

        const user = result[0];

        // Compare Passwords
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (!isMatch) {
                return res.status(400).json({ error: "Invalid password" });
            }

            // Create JWT Token
            const token = jwt.sign({ id: user.id, email: user.email }, "your_jwt_secret", { expiresIn: "1h" });

            res.json({ message: "Login successful", token });
        });
    });
});


const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) return res.status(403).json({ error: "Access denied" });

    jwt.verify(token, "your_jwt_secret", (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });

        req.user = user;
        next();
    });
};

app.get("/profile", authenticateToken, (req, res) => {
    res.json({ message: "Welcome to your profile!", user: req.user });
});


