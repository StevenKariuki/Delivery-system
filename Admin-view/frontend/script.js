// Example: Data Arrays
let orders = [
    { id: 1, customer: "John Doe", items: "Pizza", status: "Pending" },
    { id: 2, customer: "Jane Smith", items: "Burger", status: "Delivered" },
  ];
  
  let menu = [
    { id: 1, name: "Pizza", price: 12, category: "Main Course" },
    { id: 2, name: "Burger", price: 10, category: "Main Course" },
  ];
  
  // Display Orders
  function displayOrders() {
    const ordersList = document.getElementById("orders-list");
    ordersList.innerHTML = ""; // Clear existing content
    orders.forEach((order) => {
      const orderDiv = document.createElement("div");
      orderDiv.innerHTML = `
        <p><strong>Order #${order.id}</strong></p>
        <p>Customer: ${order.customer}</p>
        <p>Items: ${order.items}</p>
        <p>Status: ${order.status}</p>
        <hr>
      `;
      ordersList.appendChild(orderDiv);
    });
  }
  
  // Display Menu
  function displayMenu() {
    const menuList = document.getElementById("menu-list");
    menuList.innerHTML = ""; // Clear existing content
    menu.forEach((item) => {
      const itemDiv = document.createElement("div");
      itemDiv.innerHTML = `
        <p><strong>${item.name}</strong> - $${item.price}</p>
        <p>Category: ${item.category}</p>
        <button onclick="deleteMenuItem(${item.id})">Delete</button>
        <hr>
      `;
      menuList.appendChild(itemDiv);
    });
  }
  
  // Add Menu Item
  document.getElementById("add-item-form").addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent form submission
    
    // Get form values
    const name = document.getElementById("name").value;
    const price = document.getElementById("price").value;
    const category = document.getElementById("category").value;
    
    // Create new menu item
    const newItem = {
      id: menu.length + 1,
      name: name,
      price: Number(price),
      category: category,
    };
    
    // Add to menu array
    menu.push(newItem);
    
    // Refresh menu display
    displayMenu();
    
    // Clear form
    document.getElementById("add-item-form").reset();
  });
  
  // Delete Menu Item
  function deleteMenuItem(id) {
    menu = menu.filter(item => item.id !== id); // Remove item by ID
    displayMenu(); // Refresh menu display
  }
  
  // Initialize
  displayOrders();
  displayMenu();