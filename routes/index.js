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
router.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

router.get('/', async (req, res, next) => {
  try {
    const results = await Post.find({});
    res.render('index', { data: results });
  } catch (err) {
    return next(err);
  }
});

router.get('/register', (req, res, next) => {
  res.render('register', { title: 'Register Page' });
});

router.post(
  '/register',
  [
    body('firstName', 'Fields cannot be empty.').trim().isLength({ min: 1 }),
    body('lastName', 'Fields cannot be empty.').trim().isLength({ min: 1 }),
    body('username', 'Fields cannot be empty.').trim().isLength({ min: 1 }),
    body('passwordConfirmation', 'passwords must match')
      .exists()
      .custom((value, { req }) => value === req.body.password),
    body('*').escape(),
  ],
  async (req, res, next) => {
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
    }
    try {
      const user = await User.findOne({ username });

      if (user) {
        let newUser = new User({
          first_name: firstName,
          last_name: lastName,
          username: username,
          password: password,
        });
        res.render('register', {
          title: 'Register Page',
          data: newUser,
          errors: [{ msg: 'Username is already taken.' }],
        });
      } else {
        let newUser = new User({
          first_name: firstName,
          last_name: lastName,
          username: username,
          password: password,
        });
        try {
          await newUser.save();
          var status = encodeURIComponent('registersuccessful');
          res.redirect('/login?valid=' + status);
        } catch (err) {
          return next(err);
        }
      }
    } catch (err) {
      return next(err);
    }
  }
);

router.get('/login', (req, res, next) => {
  let passedVariable = req.query.valid;
  res.render('login', { msg: passedVariable });
});

router.post(
  '/login',
  [
    body('password', 'Fields cannot be empty.')
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body('username', 'Fields cannot be empty.')
      .trim()
      .isLength({ min: 1 })
      .escape(),
  ],
  async (req, res, next) => {
    try {
      await passport.authenticate('local', function (err, user, info) {
        if (!user) {
          var loginstatus = encodeURIComponent('loginfailed');
          return res.redirect('/login?valid=' + loginstatus);
        }
        req.logIn(user, function (err) {
          if (err) {
            return next(err);
          }
          return res.redirect('/');
        });
      })(req, res, next);
      console.log('beam me up scotty');
    } catch (err) {
      return next(err);
    }
  }
);

router.post(
  '/post',
  [body('postarea', 'Fields cannot be empty.').trim().isLength({ min: 1 })],
  async (req, res, next) => {
    const { postarea } = req.body;
    let newPost = new Post({
      message: postarea,
      createdBy: req.user.first_name + ' ' + req.user.last_name,
      createdAt: Date.now(),
    });
    try {
      await newPost.save();
      res.redirect('/');
    } catch (err) {
      return next(err);
    }
  }
);

router.get('/secretclub', (req, res, next) => {
  let passedVariable = req.query.entrance;
  res.render('secretclub', { msg: passedVariable });
});

router.post('/vault', async (req, res, next) => {
  if (req.body.secret === process.env.SECRET_VAULT) {
    try {
      await User.findByIdAndUpdate(req.user._id, { membership: true }, {});
      res.redirect('/');
    } catch (err) {
      return next(err);
    }
  } else {
    var member = encodeURIComponent('failed');
    res.redirect('/secretclub?entrance=' + member);
  }
});

//logout deals with closing sessions
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
