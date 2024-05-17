require('dotenv').config()
const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const pool = require('../db')
const sanitizeUserInput = require('../utils/sanitizeUserInput')
const validateInput = require('../middlewares/validateInput')
const { secret } = require('../middlewares/jwtConfig')

// Route to add a new poem to the 'cryptoTransactions' table
const create = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // Start a transaction

    const { poem_id, tx_hash,network_name } = req.body; // Assuming poem_id and tx_hash are provided in the request body
    console.log("the req========= ", req.body);
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Bearer token not provided' });
    }

    const token = authorizationHeader.split(' ')[1];
    const decoded = jwt.verify(token, secret);
    const userId = decoded.id;

    // First, insert the new transaction
    const insertQuery = `
      INSERT INTO cryptoTransactions (poem_id, user_id, tx_hash, network_name, created_at)
      VALUES ($1, $2, $3,$4, NOW())
      RETURNING id;
    `;
    const result = await client.query(insertQuery, [poem_id, userId, tx_hash,network_name]);
    const { id } = result.rows[0];

    // Update the is_paid status in the poems table
    const updatePoemQuery = `
      UPDATE poems
      SET is_paid = TRUE
      WHERE id = $1;
    `;
    await client.query(updatePoemQuery, [poem_id]);

    await client.query('COMMIT');
    res.status(201).json({ id, message: 'CryptoTransaction added and poem marked as paid successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during creating transaction and updating poem:', error);
    res.status(500).json({ error: 'Error during creating transaction and updating poem' });
  } finally {
    client.release();
  }
};


// Route to get all cryptoTransactions from the 'cryptoTransactions' table with likes and dislikes
const read = async (req, res) => {
  const client = await pool.connect();
  try {
    const queryParams = [];
    const whereConditions = [];

    if (req.query.tx_hash) {
      queryParams.push(`%${req.query.tx_hash}%`);
      whereConditions.push(`cryptoTransactions.tx_hash ILIKE $${queryParams.length}`);
    }

    if (req.query.poem_id) {
      queryParams.push(parseInt(req.query.poem_id)); // Convert to integer to ensure the input is a valid number
      whereConditions.push(`cryptoTransactions.poem_id = $${queryParams.length}`);
    }

    let selectQuery = `
      SELECT
       cryptotransactions.id, cryptotransactions.tx_hash,cryptotransactions.network_name, cryptotransactions.created_at, cryptotransactions.poem_id, cryptotransactions.user_id,
        users.name AS user_name,
        poems.title AS poem_title
      FROM cryptotransactions 
      JOIN users ON users.id = cryptotransactions.user_id
      JOIN poems ON poems.id = cryptotransactions.poem_id
    `;

    if (whereConditions.length > 0) {
      selectQuery += ' WHERE ' + whereConditions.join(' AND ');
    }

    const result = await client.query(selectQuery, queryParams);
    const cryptoTransactions = result.rows;

    client.release();
    res.json(cryptoTransactions);
  } catch (error) {
    console.error('Error getting cryptoTransactions:', error);
    res.status(500).json({ error: 'Error getting cryptoTransactions' });
  }
};



module.exports = {
  create: [
    // Use the validateInput middleware to validate the request body
    validateInput(['tx_hash', 'poem_id','network_name']),
    create
  ],
  read,
}
