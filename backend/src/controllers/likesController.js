const pool = require('../db')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const { secret } = require('../middlewares/jwtConfig')

// Route to create a new like or dislike for a poem
const create = async (req, res) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN') // Start a transaction

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { poem_id } = req.body // Get poem_id from the request body
    const type = req.path.split('/')[1] // Get type (like or dislike) from the route path (/like or /dislike)

    const authorizationHeader = req.headers.authorization // Get the Authorization header from the request

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Bearer token not provided' })
    }

    const token = authorizationHeader.split(' ')[1] // Extract the token (remove "Bearer " prefix)

    const decoded = jwt.verify(token, secret) // Verify and decode the JWT token

    const userId = decoded.id // Get the user ID from the decoded JWT token

    // Check if the user has already liked or disliked the poem
    const checkLikeDislikeQuery = `
      SELECT id FROM ${type}s
      WHERE user_id = $1 AND poem_id = $2
    `

    const checkResult = await client.query(checkLikeDislikeQuery, [userId, poem_id])

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: `User has already ${type}d this poem` })
    }

    const insertQuery = `
      INSERT INTO ${type}s (user_id, poem_id, created_at)
      VALUES ($1, $2, NOW())
      RETURNING id;
    `

    const result = await client.query(insertQuery, [userId, poem_id])
    const { id } = result.rows[0]

    await client.query('COMMIT') // Commit the transaction

    res.json({ id, message: `${type} added successfully` })
  } catch (error) {
    await client.query('ROLLBACK') // Rollback the transaction if an error occurred

    console.error(`Error adding ${type}: `, error)
    res.status(500).json({ error: `Error adding ${type}` })
  } finally {
    client.release() // Release the connection to the database
  }
}

module.exports = {
  create
}
