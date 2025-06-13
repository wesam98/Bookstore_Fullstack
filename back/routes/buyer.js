// This function handles all /buyer related routes

export function handleBuyerRoute(req, res, pool)
{
  // Check if request is GET and URL is /buyer
  if(req.method === 'GET' &&  req.url === '/buyer'){
    // Query database to get all books
    pool.query('SELECT * FROM books', (err, results) => {
      if(err) {
      // if there is a DB error, send error response
      res.console.error('Database error',err);
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
     return false;  // This route was not handled
}