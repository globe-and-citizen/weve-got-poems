const express = require('express')
const cors = require('cors')

//
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const popsicle = require('popsicle')
const ClientOAuth2 = require('client-oauth2')

// const layer8 = require('layer8-middleware-wasm')
require('dotenv').config()

const SECRET_KEY = 'my_very_secret_key'
const FRONTEND_URL = process.env.FRONTEND_URL
const LAYER8_URL = process.env.LAYER8_URL

const LAYER8_CALLBACK_URL = `${FRONTEND_URL}/oauth2/callback`
const LAYER8_RESOURCE_URL = `${LAYER8_URL}/api/user`

const layer8Auth = new ClientOAuth2({
  clientId: 'notanid',
  clientSecret: 'absolutelynotasecret!',
  accessTokenUri: `${LAYER8_URL}/api/oauth`,
  authorizationUri: `${LAYER8_URL}/authorize`,
  redirectUri: LAYER8_CALLBACK_URL,
  scopes: ['read:user']
})

const app = express()
const port = process.env.PORT || 3000

app.get('/healthcheck', (req, res) => {
  console.log('Enpoint for testing')
  console.log('req.body: ', req.body)
  res.send('Bro, ur poems coming soon. Relax a little.')
})

const Layer8 = require('./dist/loadWASM.js')
app.use(Layer8)

app.use(cors())
app.use(express.json())

const authRoutes = require('./routes/authRoutes')
const configRoutes = require('./routes/configRoutes')
const likeRoutes = require('./routes/likeRoutes')
const poemRoutes = require('./routes/poemRoutes')
const userRoutes = require('./routes/userRoutes')
const swaggerRoute = require('./routes/swaggerRoute')

app.use('/', swaggerRoute)
app.use('/v1', authRoutes, likeRoutes, poemRoutes, userRoutes)
app.use('/config', configRoutes) // Uncomment if you want to use the config routes

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`)
})
