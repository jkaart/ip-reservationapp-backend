const http = require('http')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const app = express()

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

const password = process.argv[2]
const url =
  `mongodb+srv://admin:${password}@cluster0.chqauzf.mongodb.net/ipdatabase?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const kayttajaSchema = new mongoose.Schema({
  id: Number, 
  nimi: String,
  sahkoposti: String,
  salasana: String,
  ip: String,
  ryhma: String,
  tyyppi: String,

})

const Kayttaja = mongoose.model('Kayttaja', kayttajaSchema)

const kayttaja = new Kayttaja({
  id: 1, 
  nimi: "Petteri Hellman",
  sahkoposti: "hfhfhf@gmail.com",
  salasana: "123456",
  ip: "192.1.128.31",
  ryhma: "STMI17SPA",
  tyyppi: "user",
})

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.post('/api/iptable/user', (request, response) =>{
  response.json(request)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// kayttaja.save().then(result => {
//   console.log('User saved!')
mongoose.connection.close()
// })