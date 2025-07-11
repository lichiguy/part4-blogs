const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body
  if(!password) {
    return response.status(400).json({error: 'password is required'})
  }
  const regex = /^.{3,}$/;
  if(!regex.test(password)) {
    return response.status(400).json({error: 'password must have at least 3 characters'})
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs', { title: 1, author: 1, url: 1})
    response.json(users)
})

module.exports = usersRouter