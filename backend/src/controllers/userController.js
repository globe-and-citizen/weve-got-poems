require('dotenv').config()
const bcrypt = require('bcrypt')
const { validationResult } = require('express-validator')
const { Pool } = require('pg')
const sanitizeUserInput = require('../utils/sanitizeUserInput')
const validateInput = require('../middlewares/validateInput')

const pool = new Pool({
  connectionString: process.env.EXTERNAL_DB_URL,
  ssl: { rejectUnauthorized: false }
})

// Route to create a new user
const create = async (req, res) => {
  const client = await pool.connect() // Connect to the database

  try {
    await client.query('BEGIN') // Start a transaction

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password } = req.body // Get user data from the request body

    // Hash the user's password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10)

    // Sanitize user input
    const sanitizedName = sanitizeUserInput(name)
    const sanitizedEmail = sanitizeUserInput(email)

    // Query SQL to insert a new user into the 'users' table
    const insertQuery = `
      INSERT INTO users (name, email, password, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id;
    `

    const result = await client.query(insertQuery, [sanitizedName, sanitizedEmail, hashedPassword])
    const { id } = result.rows[0]

    await client.query('COMMIT') // Commit the transaction

    res.json({ id, message: 'User created successfully' })
  } catch (error) {
    await client.query('ROLLBACK') // Rollback the transaction if an error occurred

    console.error('Error creating user:', error)
    res.status(500).json({ error: 'Error creating user' })
  } finally {
    client.release() // Release the connection to the database
  }
}

// Route to get all users from the 'users' table
const read = async (req, res) => {
  try {
    const client = await pool.connect()

    // Query SQL to get all users from the 'users' table
    const selectQuery = 'SELECT id, name, email, created_at FROM users'

    const result = await client.query(selectQuery)
    const users = result.rows
    client.release()

    res.json(users)
  } catch (error) {
    console.error('Error getting users:', error)
    res.status(500).json({ error: 'Error getting users' })
  }
}

// Route to update a user in the 'users' table
const update = async (req, res) => {
  const client = await pool.connect() // Connect to the database

  try {
    await client.query('BEGIN') // Start a transaction

    const { id } = req.params

    // Check if the user with the specified ID exists before updating it
    const checkUserQuery = `
      SELECT id FROM users
      WHERE id = $1
    `
    const checkResult = await client.query(checkUserQuery, [id])

    // If the user with the specified ID doesn't exist, return a 404 error
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const { name, email } = req.body

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const updateFields = [] // Array to store fields to be updated
    const values = [] // Array to store corresponding values

    // Check if each property is present in the request body and add it to the updateFields and values arrays
    if (name !== undefined) {
      updateFields.push('name')
      values.push(sanitizeUserInput(name))
    }

    if (email !== undefined) {
      updateFields.push('email')
      values.push(sanitizeUserInput(email))
    }

    // Construct the dynamic update query based on the fields provided
    const updateQuery = `
      UPDATE users
      SET ${updateFields.map((field, index) => `${field} = $${index + 1}`).join(', ')}
      WHERE id = $${updateFields.length + 1}
    `

    await client.query(updateQuery, [...values, id])

    await client.query('COMMIT') // Commit the transaction

    res.json({ message: 'User updated successfully' })
  } catch (error) {
    await client.query('ROLLBACK') // Rollback the transaction if an error occurred

    console.error('Error updating user:', error)
    res.status(500).json({ error: 'Error updating user' })
  } finally {
    client.release() // Release the connection to the database
  }
}

// Route to delete a user and all their poems from the 'users' and 'poems' tables
// Route to delete a user and all their poems from the 'users' and 'poems' tables
const remove = async (req, res) => {
  const client = await pool.connect() // Connect to the database

  try {
    await client.query('BEGIN') // Start a transaction

    const { id } = req.params

    // Query SQL to check if the user with the specified ID exists
    const checkUserQuery = `
      SELECT id FROM users
      WHERE id = $1
    `

    const checkResult = await client.query(checkUserQuery, [id])

    // If the user with the specified ID doesn't exist, return a 404 error
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Query SQL to delete all poems by the user from the 'poems' table
    const deletePoemsByUserQuery = `
      DELETE FROM poems
      WHERE user_id = $1
    `

    // Delete all poems by the user
    await client.query(deletePoemsByUserQuery, [id])

    // Query SQL to delete a user from the 'users' table
    const deleteUserQuery = `
      DELETE FROM users
      WHERE id = $1
    `

    // Delete the user
    await client.query(deleteUserQuery, [id])

    await client.query('COMMIT') // Commit the transaction

    res.json({ message: 'User and associated poems deleted successfully' })
  } catch (error) {
    await client.query('ROLLBACK') // Rollback the transaction if an error occurred

    console.error('Error deleting user and poems:', error)
    res.status(500).json({ error: 'Error deleting user and poems' })
  } finally {
    client.release() // Release the connection to the database
  }
}

module.exports = {
  create: [
    // Use the validateInput middleware to validate the request body
    validateInput(['name', 'email', 'password']),
    create
  ],
  read,
  update,
  remove
}
