const ngrok = require('ngrok');
const express = require('express')
require('dotenv').config()
const app = express()
const port = process.env.PORT





    app.post('/', (req, res) => {
        console.log(req.body)
        res.send('Hello World!')
      })
    
      app.get('/', (req, res) => {
        res.send('Hello World!')
      })


  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })


