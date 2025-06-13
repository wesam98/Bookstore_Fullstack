export function handleSellerRoute(req, res, pool){
 
  // View All avialable books
  if(req.method === 'GET' &&  req.url.startsWith('/seller')){
     const url = new URL(req.url, `http://${req.headers.host}`);
    const seller_id = url.searchParams.get('seller_id');
    let sql = 'SELECT * FROM books';
    let params = [];
    if (seller_id) {
      sql += ' WHERE seller_id = ?';
      params.push(seller_id);
    }
    // Query database to get all books
    pool.query(sql, params, (err, results) => {
      if(err) {
      // if there is a DB error, send error response
      console.error('Database error',err);
      res.writeHead(500, {'Content-Type' : 'application/json'});
      res.end(JSON.stringify({error: 'Database error'}));
    }
    else {
      // IF successful, send books as JSON
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(results));
    }
    });
    
    return true;      // This route was handled
     }


  // Add a new book
  if(req.method === 'POST' && req.url === '/seller'){
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
       let title, author, description, price, sellerId;
       try {
          ({ title, author, description, price, seller_id: sellerId } = JSON.parse(body));
       }
       catch (e) {
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ error: 'Invalid JSON'}));
        return;
       }
       pool.query(
        'INSERT INTO books (title, author, description, price, seller_id) VALUES (?, ?, ?, ?, ?)',
        [title, author, description, price, sellerId],
        (err, result) => {
          if(err){
            console.error('Insert book error', err);
            res.writeHead(500, { 'Content-Type': 'application/json'});
            res.end(JSON.stringify({error: 'Database error' }));
          } else{
            res.writeHead(201, { 'Content-Type': 'application/json'});
            res.end(JSON.stringify({ message: 'Book added successfully'}));
          }
        }
       );
    });
    return true;
  }

  // Remove a book
  if(req.method === 'DELETE' && req.url === '/seller'){
    let body = '';
    req.on('data', chunk => {body += chunk; });
    req.on('end', () => {
      let book_id;
      try{
        ({ book_id } = JSON.parse(body));
      } catch (e) {
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ error: 'Invalid JSON'}));
        return;
      }
      pool.query(
        'DELETE FROM books where book_id = ?',
        [book_id],
        (err, result) => {
          if(err){
            console.error('Delete book error', err);
            res.writeHead(500, { 'Content-Type': 'application/json'});
            res.end(JSON.stringify({ error: 'Database error'}));
            return;
          }
          else{
             res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Book removed successfully' }));
          }
        }
      );
    });
    return true;
  }


  // Update a book 
  if(req.method === 'PUT' && req.url === '/seller'){
     let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    let book_id, title, author, description, price;
    try {
      ({ book_id, title, author, description, price } = JSON.parse(body));
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
      return;
    }
    // Build dynamic query for only provided fields
    const fields = [];
    const values = [];
    if (title !== undefined) { fields.push('title = ?'); values.push(title); }
    if (author !== undefined) { fields.push('author = ?'); values.push(author); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (price !== undefined) { fields.push('price = ?'); values.push(price); }
    if (!fields.length) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'No fields to update' }));
      return;
    }
    values.push(book_id);
    const sql = `UPDATE books SET ${fields.join(', ')} WHERE book_id = ?`;
    pool.query(sql, values, (err, result) => {
      if (err) {
        console.error('Update book error', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Database error' }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Book updated successfully' }));
      }
    });
  });
  return true;
  }
  return false;
} 