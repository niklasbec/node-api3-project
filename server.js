const express = require('express');
const server = express();
const PostDB = require('./posts/postDb')
const UserDB = require('./users/userDb')

//custom middleware

function errorHandle(err, req, res, next) {
  res.status(500).json(err.message);
}

const requestTime = function (req, res, next) {
  req.requestTime = Date.now()
  next()
}


function logger(req, res, next) {
  let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl
  console.log(`Request method: ${req.method} -- Request URL: ${fullUrl} -- Timestamp: ${req.requestTime} `)
  next()
}

const validateUserId = async (req, res, next) => {
  try {
    const checkedID = await UserDB.getById(req.params.id)
    if (checkedID.id) {
      next()
    } else {
      res.status(404).json({
        error: 'Sorry ID not found'
      })
    }} catch (error) {
      res.status(500).json(error.message)
    }
}

const validateUser = (req, res, next) => {
  
  if(Object.entries(req.body).length === 0) {
    res.status(400).json({
      error: 'Missing User Data'
    })
  } else if(!req.body.name) {
    res.status(400).json({
      error: 'Missing required name field'
    })
  } else {
    next()
  }
}

const validatePost = (req, res, next) => {

  if(Object.entries(req.body).length === 0) {
    res.status(400).json({
      error: 'Missing Post Data'
    })
  } else if(!req.body.text) {
    res.status(400).json({
      error: 'Missing required text field'
    })
  } else {
    next()
  }
}

// use

server.use(express.json())
server.use(requestTime)
server.use(logger)

//endpoints

server.get('/api/users', (req, res) => {
  UserDB.get()
  .then(users => {
    res.status(200).json(users)
  })
  .catch(error => {
    errorHandle({message: 'Server Error'})
  })
})

server.get('/api/users/:id', validateUserId, (req, res) => {
  const { id } = req.params
  

  UserDB.getById(id)
    .then(user => {
      res.status(200).json({user})
    })
    .catch(error => {
      errorHandle({message: 'Server Error'})
    })
})

server.delete('/api/users/:id', validateUserId, async (req, res) => {
  const { id } = req.params

  UserDB.remove(id)
    .then(user => {
      res.status(202).json({
        sucess: 'sucessfully deleted'
      })
    })
    .catch(error => {
      errorHandle({message: 'Server Error'})
    })
})

server.post('/api/users', validateUser, (req, res) => {
   newUser = req.body
  
   UserDB.insert(newUser)
     .then(user => {
       res.status(201).json({
         success: 'User created',
         user: user
       })
    })
     .catch(error => {
      errorHandle({message: 'Server Error'})
     })
 })

 server.put('/api/users/:id', validateUserId, (req, res) => {
  const { id } = req.params

   UserDB.update(id, req.body)
    .then(user => {
      res.status(204).json({
        success: 'User updated',
        userUpdated: req.body
      })
    })
    .catch(error => {
      errorHandle({message: 'Server Error'})
    })
 })

//edgecase

server.get('*', (req, res) => {
  let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl
  res.status(404).json({ message: `Request method: ${req.method} -- Request URL: ${fullUrl}  -- NOT FOUND!! `})
})

//exports

module.exports = server;
