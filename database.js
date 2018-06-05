// Initializing sequelize with a SQLite database
const Sequelize = require('sequelize')

// Pasword hashing function 
const bcrypt = require('bcrypt')

const sequelize = new Sequelize('sqlite:./.data/database.sqlite', {
    logging: console.log
})


//Intitializing models in database
sequelize.sync()

// Custom function to hash password attribute
// on User model
const hashPassword = (user, options) => {
    return bcrypt.hash(user.password, 10)
        .then(hash => {
            user.password = hash
        })
        .catch(error => {
            throw new Error(error)
        })
}

// Creating an empty object
const db = {}

db.User = sequelize.define('user', {
    username: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.STRING(20),
        allowNull: false
    },
})

db.Dormitory = sequelize.define('dormitory', {
    dormitoryname: {
        type: Sequelize.STRING(20),
        allowNull: false
    },
})

db.Event = sequelize.define('event', {
    eventname: {
        type: Sequelize.STRING(20),
        allowNull: false,
    },
    eventDescription: {
        type: Sequelize.STRING(100),
        allowNull: false
    },
})

// In-between table
db.Guestlist = sequelize.define('guestList')

db.Comment = sequelize.define('comment', {
    comment: {
        type: Sequelize.STRING(100)
    },
})

// Associtions
//Each event belongs to a specific dormitory
db.Event.belongsTo(db.Dormitory);
//Each comment belogs to a specific user
db.Comment.belongsTo(db.User);
//Each comment belongs to a specific event
db.Comment.belongsTo(db.Event);

//Connecting the Events and Users through the Gueslist. This will be for the participation list of an event
db.Event.belongsToMany(db.User, {
    through: db.Guestlist
});
db.User.belongsToMany(db.Event, {
    through: db.Guestlist
});

// Making sure password of the users is hashed
// when user is created and updated
db.User.beforeCreate(hashPassword)
db.User.beforeUpdate(hashPassword)

//Add the Sequalize instance to an object
db.sequelize = sequelize

module.exports = db

