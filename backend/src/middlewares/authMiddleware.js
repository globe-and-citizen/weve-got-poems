const jwt = require('jsonwebtoken')
const { secret } = require('./jwtConfig')

function authenticateJWT(req, res, next) {
  const token = req.header('Authorization')

  if (!token) {
    return res.status(401).json({ message: 'Token not found' })
  }

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' })
    }

    req.user = user
    next()
  })
}

module.exports = authenticateJWT
