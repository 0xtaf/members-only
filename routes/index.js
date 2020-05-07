//default settings
var express = require('express');
var router = express.Router();
const passport = require('passport');
require('dotenv').config();
//models to be used
const User = require('../models/user');
const Post = require('../models/post');

//the old one is deprecated
const { body, validationResult } = require('express-validator');

//watch out this. this prevents me to hard code the current user in the views
//because it attaches the req.user in the middleware and define it to currentUser var.
router.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

/* routers. */
router.get('/', function (req, res, next) {
  Post.find((err, results) => {
    if (err) {
      return next(err);
    }

    res.render('index', { data: results });
  });
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
      } else res.redirect('/');
    });
  },
]);

router.post('/register', [
  body('firstName', 'Fields cannot be empty.').trim().isLength({ min: 1 }),
  body('lastName', 'Fields cannot be empty.').trim().isLength({ min: 1 }),
  body('username', 'Fields cannot be empty.').trim().isLength({ min: 1 }),
  body(
    'passwordConfirmation',
    'passwords must match'
  )
    .exists()
    .custom((value, { req }) => value === req.body.password),
  body('*').escape(),

  (req, res, next) => {
    const { firstName, lastName, username, password } = req.body;

    const errors = validationResult(req);
    let newUser = new User({
      first_name: firstName,
      last_name: lastName,
      username: username,
      password: password,
    });

    if (!errors.isEmpty()) {
      res.render('register', {
        title: 'Register Page',
        data: newUser,
        errors: errors.array(),
      });
    } else {
      User.findOne({ username }, (err, user) => {
        if (err) {
          res
            .status(500)
            .json({
              message: { msgBody: 'Error has occured', msgError: true },
            });
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
              res.status(500).json({
                message: { msgBody: 'Could not be saved', msgError: err },
              });
            } else var status = encodeURIComponent('registersuccessful');
            res.redirect('/login?valid=' + status);
          });
        }
      });
    }
  },
]);

router.get('/login', (req, res, next) => {
  let passedVariable = req.query.valid;
  res.render('login', { msg: passedVariable });
});

router.get('/secretclub', (req, res, next) => {
  let passedVariable = req.query.entrance;
  res.render('secretclub', { msg: passedVariable });
});

router.post('/vault', (req, res, next) => {
  if (req.body.secret === process.env.SECRET_VAULT) {
    let isMember = new User({
      membership: true,
    });

    User.findByIdAndUpdate(
      req.user._id,
      { membership: true },
      {},
      (err, success) => {
        console.log(success);
        if (err) {
          return next(err);
        }
        res.redirect('/');
      }
    );
  } else {
    var member = encodeURIComponent('failed');
    res.redirect('/secretclub?entrance=' + member);
  }
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
        console.log('1');
        return next(err);
      }
      if (!user) {
        var loginstatus = encodeURIComponent('loginfailed');
        return res.redirect('/login?valid=' + loginstatus);
      }
      req.logIn(user, function (err) {
        if (err) {
          console.log('3');
          return next(err);
        }
        console.log('4?');
        return res.redirect('/');
      });
    })(req, res, next);
    console.log('5??');
  },
]);

//logout deals with closing sessions
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
