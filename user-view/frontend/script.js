document.addEventListener('DOMContentLoaded', () => {
    const cartItems = [];
    const cartButton = document.querySelector('.cta');
  
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button =>
      button.addEventListener('click', () => {
        const itemName = button.parentElement.querySelector('h3').innerText;
        cartItems.push(itemName);
        cartButton.innerText = `Cart (${cartItems.length})`;
        alert(`${itemName} added to cart!`);
      })
    );
  });

  // Add to Cart function
function addToCart(itemId, quantity) {
  // Menu items data (you can replace this with a database fetch in future)
  const menuItems = [
      { id: 1, name: "Classic Margherita Pizza", price: 12.99 },
      { id: 2, name: "Pepperoni Pizza", price: 9.99 },
      { id: 3, name: "Vegetarian Pizza", price: 7.99 },
      { id: 4, name: "BBQ Chicken Pizza", price: 6.99 }
  ];

  // Find the item by its ID
  const selectedItem = menuItems.find(item => item.id === itemId);

  if (selectedItem) {
      // Retrieve cart from localStorage
      let cart = JSON.parse(localStorage.getItem("cart")) || [];

      // Check if item is already in the cart
      const existingItem = cart.find(item => item.id === itemId);

      if (existingItem) {
          // Update quantity
          existingItem.quantity += quantity;
      } else {
          // Add new item
          cart.push({ ...selectedItem, quantity });
      }

      // Save updated cart to localStorage
      localStorage.setItem("cart", JSON.stringify(cart));

      // Update cart count display
      updateCartCount();
      alert(`${selectedItem.name} has been added to your cart!`);
  }
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
  checkoutBtn.disabled = false; // Enable checkout
}

// Initialize cart count on page load
document.addEventListener("DOMContentLoaded", updateCartCount);
