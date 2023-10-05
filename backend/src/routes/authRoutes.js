const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')

router.post('/login', userController.login)
router.get('/nonce', authController.nonce)
router.post('/verify', authController.verify)

module.exports = router
