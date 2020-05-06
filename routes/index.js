var express = require('express');
var router = express.Router();
const passport = require('passport');
// const passportConfig = require('../passport');
const User = require('../models/user');
const Post = require('../models/post');

const { body } = require('express-validator');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Members Only', user: req.user });
});
router.get('/register', (req, res, next) => {
  res.render('register', { title: 'Register Page' });
});
router.post('/post', [
  body('postarea', 'Fields cannot be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),

  (req, res, next) => {
    const { postarea } = req.body;
    // console.log(req.body);
    // console.log(req.session);
    // console.log("this is user: ",req.user);
    let newPost = new Post({
      message: postarea,
      createdBy: req.user.first_name + ' ' + req.user.last_name,
      createdAt: Date.now(),
    });
    newPost.save((err) => {
      if (err) {
        res.status(500).json({
          message: { msgBody: 'Could not be saved', msgError: err },
        });
      } else
        res.status(201).json({
          message: {
            msgBody: 'Post successfully created',
            msgError: false,
          },
        });
    });
  },
]);
router.post('/register', [
  body('firstName', 'Fields cannot be empty.').trim().isLength({ min: 1 }),
  body('lastName', 'Fields cannot be empty.').trim().isLength({ min: 1 }),
  body('username', 'Fields cannot be empty.').trim().isLength({ min: 1 }),

  body('*').escape(),

  (req, res, next) => {
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
        // console.log(newUser);
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
  },
]);

router.get('/login', (req, res, next) => {
  res.render('login', { title: 'Login Page' });
});

// router.post(

//   '/login',
//   passport.authenticate('local', {
//     successRedirect: '/inside',
//     failureRedirect: '/login',
//   })

// );
router.post('/login', [
  body('password', 'Fields cannot be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('username', 'Fields cannot be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),

  (req, res, next) => {
    passport.authenticate('local', function (err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.redirect('/login');
      }
      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        }

        return res.redirect('/');
      });
    })(req, res, next),
      console.log(req.session);
  },
]);

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.use(passport.initialize());
module.exports = router;
