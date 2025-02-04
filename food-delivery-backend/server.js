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

// Helper function to use async/await with MySQL
const query = (sql, params) => new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
        if (err) reject(err);
        else resolve(results);
    });
});

// Test Route
app.get("/", (req, res) => {
    res.send("Food Delivery API is Running!");
});

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

        // Check if the user already exists
        const existingUser = await query("SELECT * FROM users WHERE email = ?", [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "User already exists!" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user in the database
        await query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword]);

        res.status(201).json({ message: "User created successfully!" });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Server error, please try again!" });
    }
});

// User Login Route
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
        if (result.length === 0) {
            return res.status(400).json({ error: "User not found" });
        }

        const user = result[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (!isMatch) {
                return res.status(400).json({ error: "Invalid password" });
            }

            // Create JWT Token
            const token = jwt.sign({ id: user.id, email: user.email }, "your_jwt_secret", { expiresIn: "1h" });

            res.json({ 
                message: "Login successful", 
                token, 
                user: { name: user.name, email: user.email }  // Send user data
            });
        });
    });
});




// Middleware to Authenticate Token
const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) return res.status(403).json({ error: "Access denied" });

    jwt.verify(token, "your_jwt_secret", (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });

        req.user = user;
        next();
    });
};

// Profile Route (Protected)
app.get("/profile", authenticateToken, (req, res) => {
    res.json({ message: "Welcome to your profile!", user: req.user });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀`);
});

// Route to Add Item to Cart
app.post("/add-to-cart", authenticateToken, async (req, res) => {
    const { foodItemId, quantity } = req.body;
    const userId = req.user.id; // Get user ID from the authenticated token

    if (!foodItemId || !quantity) {
        return res.status(400).json({ message: "Food item ID and quantity are required" });
    }

    try {
        // Get food item details from the menu
        const [foodItem] = await query("SELECT * FROM menu_items WHERE id = ?", [foodItemId]);

        if (!foodItem) {
            return res.status(404).json({ message: "Food item not found" });
        }

        const price = foodItem.price; // Assuming the price is stored in the menu_items table

        // Check if the item is already in the cart
        const [cartItem] = await query("SELECT * FROM cart_items WHERE user_id = ? AND food_item_id = ?", [userId, foodItemId]);

        if (cartItem) {
            // If item exists in the cart, update the quantity
            const updatedQuantity = cartItem.quantity + quantity;
            await query("UPDATE cart_items SET quantity = ?, price = ? WHERE id = ?", [updatedQuantity, price, cartItem.id]);
            res.json({ message: "Cart item updated", cartItemId: cartItem.id });
        } else {
            // If the item is not in the cart, add it
            await query("INSERT INTO cart_items (user_id, food_item_id, quantity, price) VALUES (?, ?, ?, ?)", [userId, foodItemId, quantity, price]);
            res.status(201).json({ message: "Item added to cart" });
        }
    } catch (error) {
        console.error("Add to Cart Error:", error);
        res.status(500).json({ message: "Server error, please try again!" });
    }
});

// Add item to cart
app.post("/api/add-to-cart", authenticateToken, async (req, res) => {
    try {
        const { foodItemId, quantity } = req.body;
        const userId = req.user.id;  // Extract user id from the token

        if (!foodItemId || !quantity) {
            return res.status(400).json({ message: "Food item ID and quantity are required!" });
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
