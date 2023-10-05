require('dotenv').config()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const pool = require('../db')
const sanitizeUserInput = require('../utils/sanitizeUserInput')
const { secret } = require('../middlewares/jwtConfig')
const validateInput = require('../middlewares/validateInput')
const { generateNonce, SiweMessage } = require('siwe')

// Route to login a user
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

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name
      },
      secret,
      { expiresIn: '1h' }
    )

    await client.query('COMMIT') // Commit the transaction

    res.status(201).json({ token, message: 'Login successful' })
  } catch (error) {
    await client.query('ROLLBACK') // Rollback the transaction if an error occurred

    console.error('Error logging in:', error)
    res.status(500).json({ error: 'Error logging in' })
  } finally {
    client.release() // Release the connection to the database
  }
}

const nonce = (_, res) => {
  res.setHeader('Content-Type', 'text/plain')
  res.send(generateNonce())
}

const verify = async (req, res) => {
  const { message, signature } = req.body
  const siweMessage = new SiweMessage(message)
  try {
    await siweMessage.verify({ signature })
    res.send(true)
  } catch {
    res.send(false)
  }
}

module.exports = {
  login: [validateInput(['email', 'password']), login],
  nonce,
  verify
}
