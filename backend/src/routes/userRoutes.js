const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

router.post('/user', userController.create)
// router.get('/users', userController.read) // Commented out for security reasons
router.put('/user/:id', userController.update)
router.delete('/user/:id', userController.remove)

module.exports = router
