const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const User = require ('../models/user');

passport.use(new LocalStrategy((username, password, done)=>{
  User.findOne({username},(err,user)=>{
    //if something wrong with db
    if(err){
      return done(err);
    }
    //if no such user exists
    if(!user){
      return done(null,false);
    } 
    //user exists check if pass correct
    user.comparePassword(password,done)
  })  
}))

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});