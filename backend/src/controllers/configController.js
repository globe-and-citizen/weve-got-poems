const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.EXTERNAL_DB_URL,
  ssl: { rejectUnauthorized: false }
})

// Route to create the 'poems' table
const createTable = async (req, res) => {
  try {
    const client = await pool.connect()

    // Query SQL to create the 'poems' table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS poems (
        id SERIAL PRIMARY KEY,
        author VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL,
        title VARCHAR(255) NOT NULL
      );
    `

    await client.query(createTableQuery)
    client.release()

    res.send('"poems" table created successfully')
  } catch (error) {
    console.error('Error creating table "poems":', error)
    res.status(500).send('Error creating table "poems"')
  }
}

const listTables = async (req, res) => {
  try {
    const client = await pool.connect()

    // Query SQL to list all tables from the database
    const listTablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public';
    `

    const result = await client.query(listTablesQuery)
    const tables = result.rows.map((row) => row.table_name)
    client.release()

    res.json(tables)
  } catch (error) {
    console.error('Error listing tables:', error)
    res.status(500).json({ error: 'Error listing tables' })
  }
}

// Route to add a 'user_id' column to the 'poems' table
const alterTable = async (req, res) => {
  try {
    const client = await pool.connect()

    // Query SQL to add a 'user_id' column to the 'poems' table
    const alterTableQuery = `
      ALTER TABLE poems
      ADD COLUMN IF NOT EXISTS user_id INT;
    `

    await client.query(alterTableQuery)
    client.release()

    res.send('"user_id" column added to "poems" table successfully')
  } catch (error) {
    console.error('Error adding "user_id" column to "poems" table:', error)
    res.status(500).send('Error adding "user_id" column to "poems" table')
  }
}

const dropTable = async (req, res) => {
  try {
    const client = await pool.connect()

    // Query SQL to drop the 'poems' table
    const dropTableQuery = 'DROP TABLE IF EXISTS poems;'

    await client.query(dropTableQuery)
    client.release()

    res.send('"poems" table dropped successfully')
  } catch (error) {
    console.error('Error dropping table "poems":', error)
    res.status(500).send('Error dropping table "poems"')
  }
}

module.exports = {
  createTable,
  listTables,
  alterTable,
  dropTable
}
