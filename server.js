// Load Express and create app
const express = require('express')
//load Express session
const session = require('express-session')

// Load bcrypt for password hashing
// Used to compare password with stored and encrypted password
const bcrypt = require('bcrypt')

// Load Joi module for validation
const Joi = require('joi')


// Load database
const db = require('./database.js')

// Make an instance of Express
const app = express()

// Enable JSON support
// Handle Json request
// Documentation: https://expressjs.com/en/api.html#express.json
app.use(express.json())

//Set up express-session
const expressSession = session({
    secret: 'audl2018'
})

// Documentation: https://expressjs.com/en/api.html#app.engine
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')

// Load express-session and set it up
// Documentation: https://github.com/expressjs/session

// Use the above settings
app.use(expressSession)

// Load Socket.io to support real-time features
const server = require('http').Server(app)
const io = require('socket.io')(server)
// Share sessions between Express and Socket.io
const ioSession = require('express-socket.io-session')
// Setup session sharing between Express and Socket.io
io.use(ioSession(expressSession, {
    autoSave: true
}))
// Set up templates
// Documentation: https://expressjs.com/en/api.html#app.engine
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')

// Serve static files/serve public folder
// Documentation: https://expressjs.com/en/starter/static-files.html
app.use(express.static('public'))


// Load Socket.io and set it up
// Documentation: https://socket.io/get-started/chat/
const http = require('http').Server(app)


// Stuff to do when a user (socket) connects to the site
io.on('connection', socket => {
    console.log('Socket connected', socket.id)

    socket.emit('debug message', 'Socket connected to server!')
    // Take the user object from the session
    // It contains the user's ID and username
    let {
        user
    } = socket.handshake.session
})

// Authentication middleware
const requireAuthentication = (req, res, next) => {
    if (!req.session.user) {
        return res.json({
            status: 'ERROR',
            message: 'Authentication required!'
        })
    }

    next()
}

// Manually check if user is logged in - if not, redirect to login.html
app.get('/', (req, res) => {
    if (!req.session.user) {
        return res.redirect('login.html')
    }

    res.sendFile(__dirname + '/public/dormitorylist.html')
})

//AUTHENTICATION
// Endpoint to handle user authentication
app.post('/api/auth', (req, res) => {
    let {
        username,
        password
    } = req.body

    // Make sure username and password are present
    let schema = {
        username: Joi.string().alphanum().required(),
        password: Joi.string().required()
    }

    // Validate using Joi
    let result = Joi.validate(req.body, schema)

    // Return an error if validation failed
    if (result.error != null) {
        return res.status(422).json({
            message: 'Invalid request'
        })
    }


    // Build query for looking up the user
    let query = {
        where: {
            username
        }
    }

    db.User.findOne(query)
        .then(user => {
            // Return an error if user was not found
            if (!user) {
                return res.status(422).json({
                    status: 'ERROR',
                    message: 'Invalid credentials'

                })
            }

            // Compare the found user's password with the submitted password
            // bcrypt encrypts the submitted and stores the password
            bcrypt.compare(password, user.password)
                .then(result => {
                    // If comparison fails return an error
                    if (!result) {
                        return res.status(422).json({
                            status: 'ERROR',
                            message: 'Invalid credentials'
                        })
                    }

                    // Otherwise set the session with the user's details
                    req.session.user = {
                        id: user.id,
                        username: user.username
                    }

                    // Send a response
                    res.json({
                        status: 'OK',
                        message: 'You can now GoMeet other students'
                    })
                })
        })
})

// Endpoint to destroy the session's data
app.get('/api/auth/logout', (req, res) => {
    req.session.destroy()

    res.redirect('/')
})


//USER
// Endpoint to register a new user
app.post('/api/users', (req, res) => {
    let {
        username,
        password
    } = req.body

    let schema = {
        username: Joi.string().alphanum().required(),
        password: Joi.string().required()
    }

    const result = Joi.validate(req.body, schema)

    if (result.error !== null) {
        return res.status(422).json({
            status: 'ERROR',
            message: 'Validation failed'
        })
    }

    // Create new user
    db.User.create({
            username,
            password
        })
        .then(user => {
            // HTTP 201 = Created
            res.status(201).json({
                status: 'OK',
                message: 'User created!'
            })
        })
        .catch(error => {
            res.status(422).json({
                status: 'ERROR',
                message: 'Error creating user!'
            })
        })
})

//Endpoint for updating user by id
app.put('/api/users/:id', (req, res) => { 
    const id = req.params.id;
    const updates = req.body.updates;
    db.User.find({
        where: {
            id:id
        }
    })
    .then(user => {
        return user.updateAttributes(updates)
    })
    .then(updateUser => {
        res.json(updateUser)
    })

 })

 //Endpoint for deleting a user by id from
 app.delete('/api/users/:id', (req,res) => {
     const id =  req.params.id;
     db.User.destroy({
         where: {
             id: id
         }
     })
     .then(deleteUser => {
         res.json(deleteUser)
    })
 })

//DORMITORY
 // Create new dormitry
app.post('/api/dormitory', (req, res) => {
    let {
        dormitoryName
    } = req.body;

    db.Dormitory.create({
            dormitoryname: dormitoryName
        })
        .then(dorm => {
            res.json(dorm)
        })
})

//Endpoint for updating dormitory by id
app.put('/api/dormitory/:id', (req, res) => { 
    const id = req.params.id;
    const updates = req.body.updates;
    db.User.find({
        where: {
            id:id
        }
    })
    .then(user => {
        return user.updateAttributes(updates)
    })
    .then(updateUser => {
        res.json(updateUser)
    })

 })

//Endpoint for deleting a dormitory by id 
app.delete('/api/dormitory/:id', (req,res) => {
    const id =  req.params.id;
    db.User.destroy({
        where: {
            id: id
        }
    })
    .then(deleteUser => {
        res.json(deleteUser)
   })
})

// Return a list of dormitories
app.get('/api/dormitories', (req, res) => {
    db.Dormitory.findAll()
        .then(dormitories => {
            //console.log("Returning this JSON: ", dormitories);
            res.json(dormitories);
        })
        .error(error => {
            console.log(error);
            res.status(422).json({
                status: 'ERROR',
                message: 'Could not retrieve list of dormitories'
            })
        })
})
// Endpoint which returns all events relevant to the dormitory
app.get('/api/dormitories/:id/events', (req, res) => {
    let query = {
        where: {
            dormitoryId: req.params.id
        }
    }
    // SELECT * FROM events WHERE dormitoryId = 123

    db.Event.findAll(query).then(events => {
        res.json(events)
    })
})

// Endpoint which returns all events relevant to the dormitory
app.put('/api/dormitories/:id/events', (req, res) => {
    let query = {
        where: {
            dormitoryId: req.params.id
        }
    }
    // SELECT * FROM events WHERE dormitoryId = 123

    db.Event.findAll(query).then(events => {
        res.json(events)
    })
})


// Endpoint which returns an event relevant to the dormitory
app.get('/api/dormitories/:dormitoryId/event/:eventid', (req, res) => {
    let query = {
        where: {
            dormitoryId: req.params.dormitoryId,
            id: req.params.eventid
        }
    }
    // SELECT * FROM events WHERE dormitoryId = 123 AND id = 1

    db.Event.findOne(query).then(events => {
        res.json(events)
    })
})

//EVENT
// Create event for a given dormitry :id
app.post('/api/dormitory/:id/event', async (req, res) => {
    let {
        eventName,
        eventDescription
    } = req.body;
    let dormitoryId = req.params.id;

    db.Event.create({
            dormitoryId,
            eventname: eventName,
            eventDescription: eventDescription,
    
        })
        .then(dorm => {
            res.json(dorm)
        })
})


//COMMENTS
// Endpoint which returns all comments relevant to the event
app.get('/api/events/:id/comments', (req, res) => {
    let query = {
        where: {
        eventId: req.params.id
        }
    }
    // SELECT * FROM comments WHERE eventId = 123

    db.Comment.findAll(query).then(comments => {
        res.json(comments)
    })
})

// Endpoint to save new comment to an event
// Requires that user is logged in
app.post('/api/events/:id/comment', requireAuthentication, (req, res) => {
    let {
        text
    } = req.body


    let schema = {
        text: Joi.string().required()
    }
    let result = Joi.validate(req.body, schema)

    if (result.error !== null) {
        return res.status(422).json({
            status: 'ERROR',
            message: 'Missing text for comment'
        })
    }

    // Create comment and take the userId from the session
    // Addid the userId associates the comment to the user
    db.Comment.create({
        text,
        userId: req.session.user.id,
        eventId: req.params.id
    }, {
        include: [{
            model: db.User,
            attributes: ['username']
        }]
    })
    .then(comment => {
        //Select the messahe again with the associated user
        return comment.reload()
    })
    .then(comment => {
        //Emit the newly created message to all sockets
        io.emit('new comment', comment)

        // Return a HTTP 201 response
        return res.status(201).json({
            status: 'OK',
            message: 'Comment created'
        })
    })
    .catch(error => {
        res.status(422).json({
            status: 'ERROR',
            message: 'An error occured when creating a comment'
        })
    })
})

// Endpoint which returns all guests relevant to event
app.get('/api/events/:id/guestlist', (req, res) => {
    let query = {
        where: {
            eventId: req.params.id
        }
    }
    // SELECT * FROM eventId WHERE GuestlistId = 123

    db.Comment.findAll(query).then(comments => {
        res.json(comments)
    })
})


// Create
// Synchronize database models
// Documentation: http://docs.sequelizejs.com/
db.sequelize.sync({
    force: false
}).then(() => {
    console.log('Database synchronized..')

    http.listen(3000, () => {
        console.log('Web server started..')
    })
})
