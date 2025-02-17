require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");



const app = express();
app.use(cors({
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

 // Update with your frontend URL
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

// Route to Place Order
app.post("/api/place-order", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;  // Extract user id from the token
        const { paymentMethod, deliveryAddress } = req.body;

        // Check if cart is empty
        const cartItems = await query(
            "SELECT * FROM cart WHERE user_id = ?",
            [userId]
        );

        if (cartItems.length === 0) {
            return res.status(400).json({ message: "Cart is empty. Add items to cart before placing an order." });
        }

        // Create the order entry
        const orderDate = new Date().toISOString().slice(0, 19).replace("T", " "); // Format date
        const totalAmount = cartItems.reduce((total, item) => total + item.quantity * item.price, 0);

        // Insert order into the orders table
        const result = await query(
            "INSERT INTO orders (user_id, payment_method, delivery_address, total_amount, order_date) VALUES (?, ?, ?, ?, ?)",
            [userId, paymentMethod, deliveryAddress, totalAmount, orderDate]
        );

        const orderId = result.insertId;

        // Insert order items into the order_items table
        const orderItemsPromises = cartItems.map(item =>
            query(
                "INSERT INTO order_items (order_id, food_item_id, quantity, price) VALUES (?, ?, ?, ?)",
                [orderId, item.food_item_id, item.quantity, item.price]
            )
        );

        // Wait for all order items to be inserted
        await Promise.all(orderItemsPromises);

        // Clear the cart after placing the order
        await query("DELETE FROM cart WHERE user_id = ?", [userId]);

        // Return the unique order ID to the user
        res.json({ message: "Order placed successfully!", orderId: orderId });
    } catch (error) {
        console.error("Place Order Error:", error);
        res.status(500).json({ message: "Server error, please try again!" });
    }
});

// Route to Track Order
app.get("/api/track-order/:orderId", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;

        // Check if the order belongs to the user
        const order = await query("SELECT * FROM orders WHERE id = ? AND user_id = ?", [orderId, userId]);

        if (order.length === 0) {
            return res.status(404).json({ message: "Order not found or you don't have access to it." });
        }

        // Get the items in the order
        const orderItems = await query("SELECT * FROM order_items WHERE order_id = ?", [orderId]);

        // Include order items and return order details
        res.json({
            order: order[0],
            items: orderItems
        });
    } catch (error) {
        console.error("Track Order Error:", error);
        res.status(500).json({ message: "Error tracking order" });
    }
});

// Create Order Route
app.post("/order", authenticateToken, async (req, res) => {
    try {
        const { name, email, phone, address, paymentMethod, items } = req.body;

        // Insert the order into the orders table
        const orderQuery = "INSERT INTO orders (name, email, phone, address, payment_method, order_date) VALUES (?, ?, ?, ?, ?, NOW())";
        const result = await query(orderQuery, [name, email, phone, address, paymentMethod]);

        const orderId = result.insertId;

        // Insert the order items into the order_items table
        const orderItemsQuery = "INSERT INTO order_items (order_id, food_item_id, quantity, price, total) VALUES ?";
        const orderItemsValues = items.map(item => [orderId, item.foodItemId, item.quantity, item.price, item.total]);

        await query(orderItemsQuery, [orderItemsValues]);

        // Respond with the unique order ID
        res.json({ orderId: orderId });
    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({ message: "Error placing order" });
    }
});



// Route fetch menu Items
app.get("/menu", async (req, res) => {
    try {
        const [rows] = await query("SELECT * FROM menu_items");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch menu items" });
    }
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀`);
});

