var express = require('express');
var router = express.Router();
const passport = require('passport');
const passportConfig = require('../passport');
const User = require('../models/user');
const Post = require('../models/post');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Members Only' });
});
router.get('/register', (req, res, next) => {
  res.render('register', { title: 'Register Page' });
});
router.post('/register', (req, res, next) => {
  const { firstName, lastName, username, password } = req.body;
  User.findOne({ username }, (err, user) => {
    if (err) {
      res
        .status(500)
        .json({ message: { msgBody: 'Error has occured', msgError: true } });
    }
    if (user) {
      res.status(500).json({
        message: { msgBody: 'Username is already taken', msgError: true },
      });
    } else {
      let newUser = new User({
        first_name: firstName,
        last_name: lastName,
        username: username,
        password: password,
      });
      newUser.save((err) => {
        if (err) {
          console.log(newUser);

          res.status(500).json({
            message: { msgBody: 'Could not be saved', msgError: err },
          });
        } else
          res.status(201).json({
            message: {
              msgBody: 'Account successfully created',
              msgError: false,
            },
          });
      });
    }
  });
});

router.get('/login', (req, res, next) => {
  res.render('login', { title: 'Login Page' });
});
router.get('/inside', (req, res, next) => {
  res.render('inside', { title: 'Inside Page' });
});

router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/inside',
    failureRedirect: '/login',
  })
);

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.use(passport.initialize());
module.exports = router;
