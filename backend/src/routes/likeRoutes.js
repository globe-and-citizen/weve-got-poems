const express = require('express')
const router = express.Router()
const likesController = require('../controllers/likesController')

router.post('/poems/:poem_id/like', likesController.create)
router.delete('/poems/:poem_id/like', likesController.remove)

router.post('/poems/:poem_id/dislike', likesController.create)
router.delete('/poems/:poem_id/dislike', likesController.remove)

module.exports = router
