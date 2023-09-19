const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const port = 3000

app.use(cors())
app.use(express.json())

app.get("/", (req, res)=>{
    console.log(req.headers)
    res.send("Poems coming soon... ")
})

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
})