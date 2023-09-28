const express = require('express')
const router = express.Router()
const likesController = require('../controllers/likesController')

router.post('/like', likesController.create)
router.post('/dislike', likesController.create)

module.exports = router
