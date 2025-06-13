
// Book Class: Represents a Book
class Book {
  constructor(title, author, price, description) {
    this.title = title;
    this.author = author;
    this.price = price;
    this.description = description;
  }
}

// UI Class: Handle UI Tasks
class UI{

  static showAlert(message, className)
  {
  const div =  document.createElement('div');
  div.className = `alert alert-${className}`;
  div.appendChild(document.createTextNode(message));
  const container = document.querySelector('.container');
  const form = document.querySelector('#js-book-form');
  container.insertBefore(div, form);
  // disappear after 3 seconds
  setTimeout(() => div.remove(),3000);
  }
  

  static clearFields() {
    document.querySelector('#title').value = '';
    document.querySelector('#author').value = '';
    document.querySelector('#description').value = '';
    document.querySelector('#price').value = '';

  }

}


// Event: Display Books From backend
async function displayBooks() {
  const sellerId = localStorage.getItem('userId');
  const response = await fetch(`http://localhost:5000/seller?seller_id=${sellerId}`);
  const books =  await response.json();
   const cardBody = document.querySelector('#card-body');
  cardBody.innerHTML = '';

  books.forEach(book => {
    const card = document.createElement('div');
    card.className = 'card mb-2';
    card.setAttribute('data-id', book.book_id);
    card.innerHTML = `
      <div class="card-body">
        <h5 class="card-title">${book.title}</h5>
        <p class="card-text">${book.description || ''}</p>
        <p class="text-muted">Author: ${book.author}</p>
        <p class="text-muted">Price: ${book.price}</p>
        <button class="btn btn-danger btn-sm delete">Delete</button>
      </div>
    `;
    cardBody.appendChild(card);
  });
  
}


// Event: to display books when page is loaded

document.addEventListener('DOMContentLoaded', displayBooks);



// Event: Add Book
document.querySelector('#js-book-form').addEventListener('submit',async (e) =>
  {
    e.preventDefault(); // Stop the form from refreshing the page
  
    //  When the user submits the form, Get form values 
    const title = document.querySelector('#title').value;
    const author = document.querySelector('#author').value;
    const price = document.querySelector('#price').value;
    const description = document.querySelector('#description').value;
    const sellerId =  localStorage.getItem('userId');
  
    // Validate
    if(title === '' || author === '' || price === ''){
      UI.showAlert('Please fill in all fields', 'danger');
    } 

    else{
        // Initiate a book
      const response = await fetch('http://localhost:5000/seller',{
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({title, author, price, description, seller_id: sellerId})
      });
      const data = await response.json();
    if (response.ok){      
      UI.showAlert('book added','success');
      UI.clearFields();
      displayBooks();
    }
    else{
      UI.showAlert(data.error || 'Failed to add book');
    } 
    }
  });


  //Event: Remove a book
  document.querySelector('#card-body').addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete')){
      const card = e.target.closest('.card');
      const bookId = card.getAttribute('data-id');
      const response = await fetch('http://localhost:5000/seller', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ book_id: bookId })
    });
    const data = await response.json();
    if (response.ok) {
      UI.showAlert("Book removed", 'success');
      displayBooks();
    } else {
      UI.showAlert(data.error || 'Failed to remove book', 'danger');
    }

    }
 });