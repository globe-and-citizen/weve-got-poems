const express = require('express')
const router = express.Router()
const cryptoTransactionController = require('../controllers/cryptoTransactionController')

router.post('/ctransactions', cryptoTransactionController.create)
router.get('/ctransactions', cryptoTransactionController.read)


module.exports = router
