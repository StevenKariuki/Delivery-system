document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();

    // Attach event listeners to all "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll(".add-to-cart");
    addToCartButtons.forEach(button =>
        button.addEventListener("click", () => {
            const itemElement = button.parentElement;
            const itemName = itemElement.querySelector("h3").innerText;
            const itemId = parseInt(button.getAttribute("data-id")); // Get item ID from button
            addToCart(itemId, 1); // Add one item to cart
        })
    );
});

// Add to Cart function
function addToCart(itemId, quantity) {
    const menuItems = [
        { id: 1, name: "Classic Cheeseburger", price: 12.99 },
        { id: 2, name: "Bacon Burger", price: 9.99 },
        { id: 3, name: "Veggie Burger", price: 7.99 },
        { id: 4, name: "BBQ Burger", price: 6.99 },
        { id: 5, name: "Mushroom Swiss Burger", price: 10.99 },
        { id: 6, name: "Spicy Jalapeno Burger", price: 11.99 }
    ];

    // Find item by ID
    const selectedItem = menuItems.find(item => item.id === itemId);
    if (!selectedItem) return;

    // Retrieve cart from localStorage
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Check if item is already in the cart
    const existingItem = cart.find(item => item.id === itemId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ ...selectedItem, quantity });
    }

    // Save cart to localStorage
    localStorage.setItem("cart", JSON.stringify(cart));

    // Update UI
    updateCartCount();

    // Corrected alert to show the item name
    alert(`${selectedItem.name} has been added to your cart!`);
}


// Update the cart count in the header
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelector(".cta").innerText = `Cart (${cartCount})`;
}

// Load cart items when the cart page is loaded
function loadCartItems() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartItemsContainer = document.querySelector(".cart-items");
    const totalPriceElement = document.querySelector(".cart-summary h3");
    const checkoutBtn = document.querySelector(".checkout-btn");

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = "<p>Your cart is empty!</p>";
        totalPriceElement.innerText = "Total: $0.00";
        checkoutBtn.disabled = true;
        return;
    }

    let total = 0;
    cartItemsContainer.innerHTML = ""; // Clear previous items

    cart.forEach(item => {
        const itemTotal = item.quantity * item.price;
        total += itemTotal;

        const itemElement = document.createElement("div");
        itemElement.classList.add("cart-item");
        itemElement.innerHTML = `
            <h4>${item.name}</h4>
            <p>Quantity: ${item.quantity}</p>
            <p>Price: $${itemTotal.toFixed(2)}</p>
        `;
        cartItemsContainer.appendChild(itemElement);
    });

    totalPriceElement.innerText = `Total: $${total.toFixed(2)}`;
    checkoutBtn.disabled = false;
}
