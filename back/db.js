// import mysql, .env modules
import mysql from 'mysql2';
import dotenv from 'dotenv';


// read from .env file
dotenv.config();

// create a connection to the database
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DDB_PASSWORD,
database: process.env.DB_NAME
});

export default pool.promise();