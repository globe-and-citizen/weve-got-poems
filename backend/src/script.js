// Script to create the tables
const { Client } = require('pg')
require('dotenv').config()

const client = new Client({
  connectionString: process.env.EXTERNAL_DB_URL,
  ssl: false
})

//const client = new Client(dbConfig);
// Query SQL to create the 'users' table
const createUserTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    eth_address VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    created_at TIMESTAMP NOT NULL
  );
`

// Query SQL to create the 'poems' table
const createPoemsTableQuery = `
  CREATE TABLE IF NOT EXISTS poems (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    title VARCHAR(255) NOT NULL
  );
`

const createReactionsTableQuery = `
  CREATE TABLE IF NOT EXISTS likes (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    poem_id INT NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL,
    is_like BOOLEAN
  );
`

// Connect to the database and execute the query
client
  .connect()
  .then(async () => {
    await client.query(createUserTableQuery)
    await client.query(createPoemsTableQuery)
    await client.query(createReactionsTableQuery)
  })
  .then(() => {
    console.log('Table created successfully')
  })
  .catch((err) => {
    console.error('Error creating table:', err)
  })
  .finally(() => {
    // Close the database connection
    client.end()
  })
