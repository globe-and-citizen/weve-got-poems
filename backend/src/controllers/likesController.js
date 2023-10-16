const pool = require('../db')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const { secret } = require('../middlewares/jwtConfig')
const validateInput = require('../middlewares/validateInput')

// Route to create a new like or dislike for a poem (toggle if reaction already exists)
const create = async (req, res) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN') // Start a transaction

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { poem_id } = req.params // Get poem_id from the route parameters

    const parts = req.path.split('/')
    const type = parts[parts.length - 1] // Get type (like or dislike) from the route path (/like or /dislike)

    const authorizationHeader = req.headers.authorization // Get the Authorization header from the request

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Bearer token not provided' })
    }

    const token = authorizationHeader.split(' ')[1] // Extract the token (remove "Bearer " prefix)

    const decoded = jwt.verify(token, secret) // Verify and decode the JWT token

    const userId = decoded.id // Get the user ID from the decoded JWT token

    // Check if the user has already reacted to the poem
    const checkReactionQuery = `
      SELECT id, reaction_type FROM reactions
      WHERE user_id = $1 AND poem_id = $2
    `

    const checkResult = await client.query(checkReactionQuery, [userId, poem_id])

    if (checkResult.rows.length > 0) {
      // User has already reacted to the poem, determine the current type of reaction
      const currentReaction = checkResult.rows[0]

      if (currentReaction.reaction_type === type) {
        return res.status(400).json({ message: `You already ${type}d this poem` })
      }

      // Toggle between like and dislike
      const newType = type

      // Update the reaction in the database with the new type
      const updateQuery = `
        UPDATE reactions
        SET reaction_type = $1
        WHERE id = $2
      `

      await client.query(updateQuery, [newType, currentReaction.id])

      await client.query('COMMIT') // Commit the transaction

      res.status(201).json({ id: currentReaction.id, message: `Reaction toggled to ${newType} successfully` })
    } else {
      // User has not reacted to the poem, create a new entry in reactions table
      const insertQuery = `
        INSERT INTO reactions (user_id, poem_id, reaction_type, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING id;
      `

      const result = await client.query(insertQuery, [userId, poem_id, type])
      const { id } = result.rows[0]

      await client.query('COMMIT') // Commit the transaction

      res.status(201).json({ id, message: `${type} added successfully` })
    }
  } catch (error) {
    await client.query('ROLLBACK') // Rollback the transaction if an error occurred

    console.error('Error:', error)
    res.status(500).json({ error: 'Error' })
  } finally {
    client.release() // Release the connection to the database
  }
}

// Route to remove a like or dislike from a poem
const remove = async (req, res) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN') // Start a transaction

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { poem_id } = req.params // Get poem_id from the route parameters

    const parts = req.path.split('/')
    const type = parts[parts.length - 1] // Get type (like or dislike) from the route path (/like or /dislike)

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

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: `The ${type} was not found or does not belong to the user` })
    }

    // Delete the like or dislike of the specific user for the poem
    const deleteQuery = `
      DELETE FROM ${type}s
      WHERE user_id = $1 AND poem_id = $2
    `

    await client.query(deleteQuery, [userId, poem_id])

    await client.query('COMMIT') // Commit the transaction

    res.status(204).send()
  } catch (error) {
    await client.query('ROLLBACK') // Rollback the transaction if an error occurred

    console.error('Error:', error)
    res.status(500).json({ error: 'Error' })
  } finally {
    client.release() // Release the connection to the database
  }
}

module.exports = {
  create,
  remove
}
