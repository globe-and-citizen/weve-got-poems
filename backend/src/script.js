require('dotenv').config()
const fs = require('fs')
const { Client } = require('pg')

// Load fixtures data from the JSON file
const fixturesData = require('./fixtures.json')

// Function to generate a fake wallet address
function generateWalletAddress() {
  // You can implement your logic to generate a random wallet address here
  // For simplicity, let's generate a random string
  const randomString = Math.random().toString(36).substring(7)
  return `0x${randomString}`
}

console.log(process.env.EXTERNAL_DB_URL)
const client = new Client({
  connectionString: process.env.EXTERNAL_DB_URL
})

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
    title VARCHAR(255) NOT NULL,
    is_paid BOOLEAN NOT NULL DEFAULT FALSE
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

const createCryptoTransactionsTableQuery = `
  CREATE TABLE IF NOT EXISTS cryptoTransactions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    poem_id INT NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
    tx_hash VARCHAR(255) NOT NULL,
    network_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL
  );
`

// Function to insert data into the 'users' table
async function insertUsers() {
  const userData = fixturesData.map((poem, index) => ({
    name: `User${index + 1}`,
    email: `user${index + 1}@example.com`,
    eth_address: generateWalletAddress(),
    password: '',
    created_at: new Date().toISOString()
  }))

  const insertQuery = `
    INSERT INTO users (name, email, eth_address, password, created_at)
    VALUES ${userData.map((_, i) => `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`).join(', ')}
    RETURNING *
  `

  try {
    const res = await client.query(
      insertQuery,
      userData.flatMap((user) => [user.name, user.email, user.eth_address, user.password, user.created_at])
    )
    console.log(`${res.rowCount} users inserted successfully`)
  } catch (err) {
    console.error('Error inserting users:', err)
  }
}

// Function to insert data into the 'poems' table
async function insertPoems() {
  const poemData = fixturesData.map((poem) => ({
    user_id: poem.user_id, // Assuming user_id is provided in the fixtures data
    content: poem.content,
    created_at: new Date().toISOString(),
    title: poem.title
  }))

  const insertQuery = `
    INSERT INTO poems (user_id, content, created_at, title)
    VALUES ${poemData.map((_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`).join(', ')}
  `

  try {
    await client.query(
      insertQuery,
      poemData.flatMap((poem) => [poem.user_id, poem.content, poem.created_at, poem.title])
    )
    console.log(`${poemData.length} poems inserted successfully`)
  } catch (err) {
    console.error('Error inserting poems:', err)
  }
}

// Connect to the database and execute the queries
client
  .connect()
  .then(async () => {
    await client.query(createUserTableQuery)
    await client.query(createPoemsTableQuery)
    await client.query(createReactionsTableQuery)
    await client.query(createCryptoTransactionsTableQuery)
    await insertUsers()
    await insertPoems()
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err)
  })
  .finally(() => {
    // Close the database connection
    client.end()
  })
