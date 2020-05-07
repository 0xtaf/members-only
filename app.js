//initialize
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//passport
require('./config/passport');
const passport = require('passport');
const session = require('express-session');
var flash = require('connect-flash');

//save session to mongo
const MongoStore = require('connect-mongo')(session);

//routes
var indexRouter = require('./routes/index');

//self explanatory
require('dotenv').config();
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// db setup & connection
var mongoose = require('mongoose');
var mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongoose.set('useFindAndModify', false);
// db connection for session
const connection = mongoose.createConnection(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
//first create session
const sessionStore = new MongoStore({
  mongooseConnection: connection,
  collection: 'sessions',
});

//express-session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      maxAge: 60 * 60 * 1000, // cookie expires after 1h
    },
  })
);
app.use(flash());

//after** express-session. initialize passport.js
app.use(passport.initialize());
app.use(passport.session());

//default settings
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//define which routes to use
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
