const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')

router.post('/login', authController.login)
router.get('/nonce', authController.nonce)
router.post('/siwe', authController.siwe)

module.exports = router
