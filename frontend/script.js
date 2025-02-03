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