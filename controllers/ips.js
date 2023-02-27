const ipsRouter = require('express').Router()

const IPs = require('../models/ip')
const User = require('../models/user')

const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

//haetaan kaikki IP-osoitteet
ipsRouter.get('/', async (request, response) => {
  const ips = await IPs
  //  .find({}).populate('user', { email: 1, name: 1 })
    .find({})

  response.json(ips)
})

//tallennetaan ip osoite
ipsRouter.post('/', async (request, response) => {
  const body = request.body
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const user = await User.findById(decodedToken.id)

  //Vanhenemis aika millisekunneissa jos body.TTL on vuorokausia
  const expireDate = Date.now() + body.TTL * 86400 *1000

  const ip = new IPs({
    ip: body.ip,
    desc: body.desc,
    user: user._id,
    expirationDate: expireDate
  })
 
  const savedIP = await ip.save()

  user.ips = user.ips.concat(savedIP._id)
  await user.save()

  response.status(201).json(savedIP)
})

//Haetaan yksittäinen IP-osoite
ipsRouter.get('/:id', async (request, response) => {
  const ip = await IPs.findById(request.params.id)
  if (ip) {
    response.json(ip)
  } else {
    response.status(404).end()
  }
})

//Poistetaan IP-osoite
ipsRouter.delete('/:id', async (request, response) => {
  await IPs.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

//Muokataan IP-osoitetta ja/tai kuvausta
ipsRouter.put('/:id', (request, response, next) => {
  const body = request.body

  const ip = {
    ip: body.ip,
    desc: body.desc,
  }

  IPs.findByIdAndUpdate(request.params.id, ip, { new: true })
    .then(updatedIP => {
      response.json(updatedIP)
    })
    .catch(error => next(error))
})

module.exports = ipsRouter