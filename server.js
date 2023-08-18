if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
  // load all the enviroment variables in development mode
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const users = []

const initializePassport = require('./passport-config')

initializePassport(
  passport,
  (email) => {
    return users.find((user) => user.email === email)
  },
  (id) => users.find((user) => user.id === id)
)

app.set('view-engine', 'ejs')
// use ejs syntax
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    // if notthing is changed, resave no
    saveUninitialized: false,
    // save empty value if theres no value
  })
)
app.use(passport.initialize())
app.use(passport.session())
// store variables to be persistant across the entire session the user has
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', { name: req.user.name })
  // using session with passport, req.user is always to be sent to the user authenticated at that moment
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
  // console.log(users, 'server 44')
})

app.post(
  '/login',
  checkNotAuthenticated,
  passport.authenticate(
    'local',
    {
      successRedirect: '/',
      failureRedirect: '/login',
      failureFlash: true,
      // flash message, passport-config.js-message
    }
    // console.log(users)
  )
)

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10) // hash sault 10
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    })
    res.redirect('/login')
  } catch (err) {
    console.log(err)
    res.redirect('/register')
  }
  // console.log(users)
})

// app.delete('/logout', (req, res) => {
//   req.logOut()
//   // passport sets up for us automatically, clear the session and logout the user
//   res.redirect('/login')
// })

/*  old
app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})
 */

app.delete('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err)
    }
    res.redirect('/')
  })
})

// protecting routes middleware------------------------

// dont allow none login user to access homepage /
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    // from passport,  returns true/false
    return next()
  }

  res.redirect('/login')
}

// loged in user acesss /login  /register,    redirect them to /

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

app.listen(3000)
