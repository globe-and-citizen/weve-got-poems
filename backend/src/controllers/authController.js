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
      SELECT * FROM users
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
        name: user.name,
        eth_address: user.eth_address,
        created_at: user.created_at
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

// Route to authenticate a user using SIWE
const siwe = async (req, res) => {
  const { message, signature } = req.body
  const siweMessage = new SiweMessage(message)
  const eth_address = siweMessage.address // Get the eth_address from the Siwe message

  try {
    const isVerified = await siweMessage.verify({ signature })

    if (!isVerified) {
      res.status(401).json({ message: 'Signature is not valid' })
      return
    }

    // Here, you need to check if a user with the provided eth_address exists in the database.
    // If the user exists, generate and return a JWT for that user (sign in).
    // If the user doesn't exist, create a new user in the database and then generate and return a JWT (sign up).
    const checkUserQuery = `
      SELECT * FROM users
      WHERE eth_address = $1
    `

    const userCheckResult = await pool.query(checkUserQuery, [eth_address])

    if (userCheckResult.rows.length > 0) {
      // User with the provided eth_address exists, so generate a JWT for sign in.
      const user = userCheckResult.rows[0]
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          eth_address: user.eth_address,
          created_at: user.created_at
        },
        secret,
        { expiresIn: '1h' }
      )

      res.status(200).json({ token, message: 'Sign in successful' })
    } else {
      // Query SQL to insert a new user into the 'users' table
      const insertQuery = `
        INSERT INTO users (eth_address, created_at)
        VALUES ($1, NOW())
        RETURNING id;
      `

      const insertResult = await pool.query(insertQuery, [eth_address])

      // Generate a JWT for sign up
      const user = insertResult.rows[0]
      const token = jwt.sign(
        {
          id: user.id,
          eth_address: eth_address,
          created_at: user.created_at
        },
        secret,
        { expiresIn: '1h' }
      )

      res.status(201).json({ token, message: 'Sign up successful' })
    }
  } catch (error) {
    console.error('Error during SIWE authentication:', error)
    res.status(500).json({ error: 'Error during SIWE authentication' })
  }
}

module.exports = {
  login: [validateInput(['email', 'password']), login],
  nonce,
  siwe
}
