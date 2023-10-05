const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')

router.get('/nonce', authController.nonce)
router.post('/verify', authController.verify)

module.exports = router
