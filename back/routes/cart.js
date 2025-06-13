export function handleCartRoute(req, res, pool){

  // only allow buyer to add to cart if post && /cart
  if (req.method === 'POST' && req.url === '/cart'){
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
    const {user_id, book_id, quantity} = JSON.parse(body);

      // check if the user is buyer
      pool.query(
        'SELECT user_role from users WHERE user_id = ?',
        [user_id],
        (err, results) => {
          if(err){
            console.error('Database error:', err); // Add this line
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Database error' }));
          }
          // Not found or not a buyer
          else if (!results.length || results[0].user_role !== 'buyer'){
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Only buyers can add to cart' }));
          }
          // user is a buyer, Add to cart
          else{
            pool.query(
              'INSERT INTO cart (user_id, book_id, quantity) VALUES (?, ?, ?)',
              [user_id, book_id, quantity || 1],
              (err2, result) => {
                if (err2){
                  console.error("Insert error",err2);
                  res.writeHead(500, {'Content-Type': 'application/json'});
                  res.end(JSON.stringify({error: 'Database error'}));
                }
                else{
                  res.writeHead(201, {'Content-Type': 'application/json'});
                  res.end(JSON.stringify({message: 'Book added successfully to the cart'}));
                }
              }
            )
          }
        }
      );
    });
    return true;
  }

  // View Buyer's cart only if Get && /cart
  if (req.method === 'GET' && req.url.startsWith('/cart')){
  // Parse user_id from the query string
    const url = new URL(req.url, `http://${req.headers.host}`);
    const user_id = url.searchParams.get('user_id');

    if(!user_id){
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'user_id is required' }));
      return true;
    }

    // Query to get all items in the user's cart, joining with books table for details

    pool.query(
      `SELECT c.id, c.book_id, b.title, b.author, c.quantity
      FROM cart c
      JOIN books b ON c.book_id = b.book_id
      WHERE c.user_id = ?`,
      [user_id], (err, results) =>{
        if(err){
          res.writeHead(500, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({error : 'Database error'}));
        } else{
          res.writeHead(200,{'Content-Type': 'application/json'});
          res.end(JSON.stringify(results));
        }
      }
    );
    return true;
  }

  // Route to delete one book from the cart
  if( req.method === 'DELETE' && req.url === '/cart' ){
    let body = '';
    req.on('data', chunk => {body += chunk;});
    req.on('end', () => {
      let user_id, book_id;
      try{
        ({ user_id, book_id} = JSON.parse(body));
      } catch (e){
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: 'Invalid JSON'}));
        return;
      }
      pool.query(
        `DELETE FROM cart WHERE user_id = ? AND book_id = ?`,
        [user_id, book_id], (err, result)=>{
          if (err){
            console.error("Delete error", err);
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({error : 'Databaser Error'}));
          }
          else{
            res.writeHead(200, { 'Content-Type' : 'application/json' });
            res.end(JSON.stringify({ message : 'Book removed successfully from cart'}));
          }
        }
      );
    });
    return true;
    }

  // Rouet to empty the cart
  if( req.method === 'DELETE' && req.url === '/cart/all'){
    let body = '';
    req.on('data', chunck => {body += chunck; });
    req.on('end', () =>{
      let user_id;
      try{
              
        ({ user_id } = JSON.parse(body));
      }
      catch(e){
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
      return;
      }
      pool.query(
        'DELETE FROM cart WHERE user_id = ?',
        [user_id],
        (err, result) => {
          if (err) {
          console.error("Delete all error", err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Database error' }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Cart cleared successfully' }));
        }
        }
      );
    });
    return true;
  }
  return false;
}