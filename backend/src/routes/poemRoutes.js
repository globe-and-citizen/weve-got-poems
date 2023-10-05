const express = require('express')
const router = express.Router()
const poemController = require('../controllers/poemController')

router.post('/poem', poemController.create)
router.get('/poems', poemController.read)
router.put('/poem/:id', poemController.update)
router.delete('/poem/:id', poemController.remove)

router.get('/authors', poemController.authors)

module.exports = router
