require('dotenv').config()
const bcrypt = require('bcrypt')
const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const { Pool } = require('pg')
const sanitizeUserInput = require('../utils/sanitizeUserInput')
const { secret } = require('../middlewares/jwtConfig')
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

    // Sanitize user input
    const sanitizedName = sanitizeUserInput(name)
    const sanitizedEmail = sanitizeUserInput(email)
    const hashedPassword = await bcrypt.hash(password, 10) // Hash the user's password before storing it in the database

    // Query SQL to insert a new user into the 'users' table
    const insertQuery = `
      INSERT INTO users (name, email, password, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id;
    `

    const user = await client.query(insertQuery, [sanitizedName, sanitizedEmail, hashedPassword])
    const token = jwt.sign({ id: user.rows[0].id }, secret, { expiresIn: '1h' })

    await client.query('COMMIT') // Commit the transaction

    res.json({ token, message: 'User created successfully' })
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

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

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

    const authorizationHeader = req.headers.authorization // Get the Authorization header from the request

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Bearer token not provided' })
    }

    const token = authorizationHeader.split(' ')[1] // Extract the token (remove "Bearer " prefix)

    const decoded = jwt.verify(token, secret) // Verify and decode the JWT token

    // Verificar se o usuário autenticado é o mesmo que está tentando fazer a atualização
    if (decoded.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Permission denied' })
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

    const authorizationHeader = req.headers.authorization // Get the Authorization header from the request

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Bearer token not provided' })
    }

    const token = authorizationHeader.split(' ')[1] // Extract the token (remove "Bearer " prefix)

    const decoded = jwt.verify(token, secret) // Verify and decode the JWT token

    // Verificar se o usuário autenticado é o mesmo que está tentando fazer a exclusão
    if (decoded.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Permission denied' })
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

const login = async (req, res) => {
  const client = await pool.connect() // Connect to the database

  try {
    await client.query('BEGIN') // Start a transaction

    const { email, password } = req.body // Get user data from the request body

    // Sanitize user input
    const sanitizedEmail = sanitizeUserInput(email)

    // Query SQL to get the user with the specified email from the 'users' table
    const selectQuery = `
      SELECT id, name, email, password FROM users
      WHERE email = $1
    `

    const result = await client.query(selectQuery, [sanitizedEmail])

    // If the user with the specified email doesn't exist, return a 404 error
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const user = result.rows[0]

    // Compare the password provided with the user's password
    const isPasswordCorrect = await bcrypt.compare(password, user.password)

    // If the password is incorrect, return a 401 error
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Incorrect password' })
    }

    const token = jwt.sign({ id: user.id }, secret, { expiresIn: '1h' })

    await client.query('COMMIT') // Commit the transaction

    res.json({ token, message: 'Login successful' })
  } catch (error) {
    await client.query('ROLLBACK') // Rollback the transaction if an error occurred

    console.error('Error logging in:', error)
    res.status(500).json({ error: 'Error logging in' })
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
  remove,
  login: [validateInput(['email', 'password']), login]
}
