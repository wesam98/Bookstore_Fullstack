import bcrypt from "bcrypt";

export function handleAuthRoute(req, res, pool){

  // Register route
  if (req.method === 'POST' && req.url === '/register'){
    let body = '';
    req.on('data', chunk => { body += chunk;});
    req.on('end', async () =>{
      let username, email, password, user_role;
      try{
        ({username, email, password, user_role} = JSON.parse(body)); 
      }
      catch (e){
        res.writeHead(400, { 'Content-Type' : 'application/json' });
        res.end(JSON.stringify({error: "Invalid JSON"}));
        return;
      }

      // Check if email already exists
      pool.query(' SELECT * FROM users WHERE email = ?', [email], async(err, results)=>{
        if(err){
          console.error( "Database error", err);
          res.writeHead(500, { 'Content-Type' : 'application/json'});
          res.end(JSON.stringify( {error : 'Database error'}));
        }
        else if (results.length > 0)
        {
          res.writeHead(409, { 'Content-Type' : 'application/json'});
          res.end(JSON.stringify({error : 'Email is already registered'}));
        }
        else{
          // Hash Password
          const hashedPassword = await bcrypt.hash(password, 10);
          // Inser new user in DB
          pool.query(
            
          'INSERT INTO users (username, email, password, user_role) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, user_role],
            (err2) => {
             if (err2 && err2.code === 'ER_DUP_ENTRY'){
                res.writeHead(409, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Username is already taken. Please choose another one.' }));
                return;
              }
              else{
                res.writeHead(200, {'Content-Type' : 'application/json'});
                res.end(JSON.stringify({ message : "User registered Successfully"}));
              }
            });
        }

      }

      );
    });
    return true;
  }

  // Login Route
  if (req.method === 'POST' && req.url === '/login'){
    let body = '';
    req.on('data', chunk => { body += chunk;});
    req.on('end', () => {
      let email, password, user_role;
      try{
        ({ email, password, user_role} = JSON.parse(body));
      }catch(e){
        res.writeHead(400, { 'Content-Type': 'application/json'});
        res.end(JSON.stringify({ error : "Invalid JSON"}));
        return;
      }
      pool.query( 'SELECT * FROM users WHERE email = ?',[email], (err, results) => {
        if(err){
          res.writeHead(500, { 'Content-Type': 'application/json'});
          res.end(JSON.stringify({ error : "Database error"}));
        } else if( !results.length){
          console.log(email);
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid email or password' }));
        }
        else{
          // Check role
          const user = results[0];
          if(user.user_role !== user_role){
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Role mismatche' }));
            return;    
          }
          // Compare password with hash
          bcrypt.compare(password, user.password, (err2, same) => {
            if(same) {
              res.writeHead(200, { 'Content-Type' : 'application/json' });
              res.end( JSON.stringify({ message: 'Login Successful',
                user_id : user.user_id,
                user_role : user.user_role
              }));
            }
            else{
              res.writeHead(401, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Invalid email or password' }));
            }
          });
        }
      }

      );
    });
    return true;
  }

  return false;
}
