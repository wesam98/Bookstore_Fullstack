// Import required modules
import http from 'http';
import mysql from 'mysql2';
import dotenv from 'dotenv';


import { handleAuthRoute } from './routes/auth.js';
import { handleBuyerRoute } from './routes/buyer.js';
import { handleCartRoute } from './routes/cart.js';
import { handleSellerRoute } from './routes/seller.js';


// Load environment variables from .env file
dotenv.config();

// create a connection to the database
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});


// Create an HTTP server
const server = http.createServer((req, res) => {

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

if (handleBuyerRoute (req, res, pool)) return;
if (handleCartRoute (req, res, pool)) return;
if (handleSellerRoute(req, res, pool)) return;
if (handleAuthRoute(req, res, pool)) return;


// router not found
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');

});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});