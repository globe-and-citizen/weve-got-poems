const { generateNonce, SiweMessage } = require('siwe')

const nonce = (_, res) => {
  res.setHeader('Content-Type', 'text/plain')
  res.send(generateNonce())
}

const verify = async (req, res) => {
  const { message, signature } = req.body
  const siweMessage = new SiweMessage(message)
  try {
    await siweMessage.verify({ signature })
    res.send(true)
  } catch {
    res.send(false)
  }
}

module.exports = {
  nonce,
  verify
}
