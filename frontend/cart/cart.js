// UI Class
class UI {
  static showAlert(message, className) {
    const div = document.createElement('div');
    div.className = `alert alert-${className}`;
    div.appendChild(document.createTextNode(message));
    const container = document.querySelector('.container');
    container.insertBefore(div, container.firstChild);
    setTimeout(() => div.remove(), 3000);
  }
}

// Load and display cart items
document.addEventListener('DOMContentLoaded', async () => {
  const userId = localStorage.getItem('userId');
  const cartList = document.querySelector('#cart-list');

  if (!userId) {
    cartList.innerHTML = '<p class="text-center">Please login to view your cart.</p>';
    return;
  }

  const response = await fetch(`http://localhost:5000/cart?user_id=${userId}`);
  const cartItems = await response.json();

  if (!cartItems.length) {
    cartList.innerHTML = '<p class="text-center">Cart is empty</p>';
  } else {
    cartList.innerHTML = '';
    cartItems.forEach(book => {
      const card = document.createElement('div');
      card.classList.add('col-md-3', 'm-2');
      card.innerHTML = `
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">${book.title}</h5>
            <p class="card-text">${book.description || ''}</p>
            <p class="text-muted">Author: ${book.author}</p>
            <p class="text-muted">Price: ${book.price}</p>
            <p class="text-muted">Quantity: ${book.quantity}</p>
            <button class="btn btn-danger btn-sm remove-from-cart" data-id="${book.book_id}">Remove</button>
          </div>
        </div>
      `;
      cartList.appendChild(card);
    });
  }
});

// Event: Remove from cart
document.querySelector('#cart-list').addEventListener('click', async (e) => {
  if (e.target.classList.contains('remove-from-cart')) {
    const userId = localStorage.getItem('userId');
    const bookId = e.target.getAttribute('data-id');
    if (!userId) return;

    const response = await fetch('http://localhost:5000/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, book_id: bookId })
    });
    const data = await response.json();
    if (response.ok) {
      alert('Book removed from cart');
      window.location.reload();
    } else {
      UI.showAlert(data.error || 'Failed to remove book from cart', 'danger');
    }
  }
});

// Event: Clear entire cart
document.querySelector('#clear-cart').addEventListener('click', async () => {
  const userId = localStorage.getItem('userId');
  if (!userId) return;

  const response = await fetch('http://localhost:5000/cart/all', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId })
  });

  const data = await response.json();
  if (response.ok) {
    const cartList = document.querySelector('#cart-list');
    cartList.innerHTML = '<p class="text-center">Cart is empty</p>';
    UI.showAlert('All books removed from cart!', 'warning');
  } else {
    UI.showAlert(data.error || 'Failed to clear cart', 'danger');
  }
});