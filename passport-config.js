const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail) {
  const authenticateUser = async (email, password, done) => {
    const user = getUserByEmail(email)
    // const user = users.find((user) => user.email === email)
    console.log(getUserByEmail)
    console.log(user)
    console.log(email)
    if (user == null) {
      return done(null, false, { message: 'No user with that email' })
    }
    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user)
      } else {
        return done(null, false, { message: 'Password incorrect' })
      }
    } catch (e) {
      return done(e)
    }
  }

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
  // sepcify what is our user called, by default its username, in this case its email

  passport.serializeUser((user, done) => {
    // done(null, user.id)
  })
  // null error, save user.id in session, user.id is the serialized version of our user
  passport.deserializeUser((id, done) => {
    // return done(null, getUserById(id))
  })
}

module.exports = initialize
