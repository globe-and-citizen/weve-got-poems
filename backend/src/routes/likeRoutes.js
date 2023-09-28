const express = require('express')
const router = express.Router()
const likesController = require('../controllers/likesController')

router.post('/like', likesController.create)
router.post('/dislike', likesController.create)
router.delete('/like/:id', likesController.remove)
router.delete('/dislike/:id', likesController.remove)

module.exports = router
