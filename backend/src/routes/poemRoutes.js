const express = require('express')
const router = express.Router()
const poemController = require('../controllers/poemController')

router.post('/poems', poemController.create)
router.get('/poems', poemController.read)
router.put('/poems/:id', poemController.update)
router.delete('/poems/:id', poemController.remove)

router.get('/authors', poemController.authors)

module.exports = router
