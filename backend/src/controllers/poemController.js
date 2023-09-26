require('dotenv').config()
const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const pool = require('../db')
const sanitizeUserInput = require('../utils/sanitizeUserInput')
const validateInput = require('../middlewares/validateInput')
const { secret } = require('../middlewares/jwtConfig')

// Route to add a new poem to the 'poems' table
const create = async (req, res) => {
  const client = await pool.connect() // Connect to the database

  try {
    await client.query('BEGIN') // Start a transaction

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { title, content } = req.body // Get the title and content from the request body

    // Sanitize the title and content to prevent XSS attacks
    const sanitizedTitle = sanitizeUserInput(title)
    const sanitizedContent = sanitizeUserInput(content)

    const authorizationHeader = req.headers.authorization // Get the Authorization header from the request

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Bearer token not provided' })
    }

    const token = authorizationHeader.split(' ')[1] // Extract the token (remove "Bearer " prefix)

    const decoded = jwt.verify(token, secret) // Verify and decode the JWT token

    const userId = decoded.id // Get the user ID from the decoded JWT token

    const insertQuery = `
      INSERT INTO poems (title, user_id, content, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id;
    `

    const result = await client.query(insertQuery, [sanitizedTitle, userId, sanitizedContent])
    const { id } = result.rows[0]

    await client.query('COMMIT') // Commit the transaction

    res.json({ id, message: 'Poem added successfully' })
  } catch (error) {
    await client.query('ROLLBACK') // Rollback the transaction if an error occurred

    console.error('Error adding poem:', error)
    res.status(500).json({ error: 'Error adding poem' })
  } finally {
    client.release() // Release the connection to the database
  }
}

// Route to get all poems from the 'poems' table with likes and dislikes
const read = async (req, res) => {
  try {
    const client = await pool.connect()

    // Query SQL to get all poems from the 'poems' table with likes and dislikes
    const selectQuery = `
      SELECT
        poems.id,
        poems.content,
        poems.created_at,
        poems.title,
        users.id AS user_id,
        users.name AS user_name,
        ( SELECT ARRAY_AGG(user_id) FROM likes WHERE poem_id = poems.id ) AS likes,
        ( SELECT ARRAY_AGG(user_id) FROM dislikes WHERE poem_id = poems.id ) AS dislikes
      FROM poems
      INNER JOIN users ON poems.user_id = users.id
    `

    const result = await client.query(selectQuery)
    const poems = result.rows.map((row) => ({
      id: row.id,
      author: {
        id: row.user_id,
        name: row.user_name
      },
      content: row.content,
      created_at: row.created_at,
      dislikes: row.dislikes || [],
      likes: row.likes || [],
      title: row.title
    }))

    client.release()

    res.json(poems)
  } catch (error) {
    console.error('Error getting poems:', error)
    res.status(500).json({ error: 'Error getting poems' })
  }
}

// Route to update a poem in the 'poems' table
const update = async (req, res) => {
  const client = await pool.connect() // Connect to the database

  try {
    await client.query('BEGIN') // Start a transaction

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { id } = req.params // Get the poem ID from the request parameters
    const { title, content } = req.body // Get the updated title and content from the request body

    // Sanitize the title and content to prevent XSS attacks
    const sanitizedTitle = sanitizeUserInput(title)
    const sanitizedContent = sanitizeUserInput(content)

    const authorizationHeader = req.headers.authorization // Get the Authorization header from the request

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Bearer token not provided' })
    }

    const token = authorizationHeader.split(' ')[1] // Extract the token (remove "Bearer " prefix)

    const decoded = jwt.verify(token, secret) // Verify and decode the JWT token

    const userId = decoded.id // Get the user ID from the decoded JWT token

    // Check if the poem with the specified ID exists and belongs to the authenticated user
    const checkOwnershipQuery = `
      SELECT id
      FROM poems
      WHERE id = $1 AND user_id = $2;
    `

    const ownershipCheckResult = await client.query(checkOwnershipQuery, [id, userId])

    if (ownershipCheckResult.rows.length === 0) {
      return res.status(403).json({ error: 'Permission denied' })
    }

    // Update the poem with the specified ID
    const updateQuery = `
      UPDATE poems
      SET title = $1, content = $2
      WHERE id = $3;
    `

    await client.query(updateQuery, [sanitizedTitle, sanitizedContent, id])

    await client.query('COMMIT') // Commit the transaction

    res.json({ message: 'Poem updated successfully' })
  } catch (error) {
    await client.query('ROLLBACK') // Rollback the transaction if an error occurred

    console.error('Error updating poem:', error)
    res.status(500).json({ error: 'Error updating poem' })
  } finally {
    client.release() // Release the connection to the database
  }
}

// Route to delete a poem from the 'poems' table
const remove = async (req, res) => {
  const client = await pool.connect() // Connect to the database

  try {
    await client.query('BEGIN') // Start a transaction

    const { id } = req.params

    // Sanitize the poem ID to prevent potential SQL injection
    const sanitizedId = parseInt(id)

    const authorizationHeader = req.headers.authorization // Get the Authorization header from the request

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Bearer token not provided' })
    }

    const token = authorizationHeader.split(' ')[1] // Extract the token (remove "Bearer " prefix)

    const decoded = jwt.verify(token, secret) // Verify and decode the JWT token

    const userId = decoded.id // Get the user ID from the decoded JWT token

    // Check if the poem with the specified ID exists before deleting it and if it belongs to the authenticated user
    const checkPoemQuery = `
      SELECT id FROM poems
      WHERE id = $1 AND user_id = $2
    `

    const checkResult = await client.query(checkPoemQuery, [sanitizedId, userId])

    // If the poem with the specified ID doesn't exist or doesn't belong to the authenticated user, return a 404 error
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Poem not found or permission denied' })
    }

    // Query SQL to delete a poem from the 'poems' table
    const deleteQuery = `
      DELETE FROM poems
      WHERE id = $1
    `

    await client.query(deleteQuery, [sanitizedId])

    await client.query('COMMIT') // Commit the transaction

    res.json({ message: 'Poem deleted successfully' })
  } catch (error) {
    await client.query('ROLLBACK') // Rollback the transaction if an error occurred

    console.error('Error deleting poem:', error)
    res.status(500).json({ error: 'Error deleting poem' })
  } finally {
    client.release() // Release the connection to the database
  }
}

module.exports = {
  create: [
    // Use the validateInput middleware to validate the request body
    validateInput(['title', 'content']),
    create
  ],
  read,
  update,
  remove
}
