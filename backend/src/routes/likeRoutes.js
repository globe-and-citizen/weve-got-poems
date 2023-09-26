const express = require('express')
const router = express.Router()
const likesController = require('../controllers/likesController')
const { check } = require('express-validator')
const { validateJWT } = require('../middlewares/auth')

router.use(validateJWT)

router.post(
  '/like',
  [check('poem_id', 'Poem ID is required').not().isEmpty(), check('poem_id', 'Poem ID must be an integer').isInt()],
  likesController.likePoem
)

router.post(
  '/dislike',
  [check('poem_id', 'Poem ID is required').not().isEmpty(), check('poem_id', 'Poem ID must be an integer').isInt()],
  likesController.dislikePoem
)

module.exports = router
