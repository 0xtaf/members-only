const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//crypt here
const bcrypt = require('bcryptjs')

const UserSchema = new Schema({
  first_name: { type: String, min: 2, max: 100, required: true },
  last_name: { type: String, min: 2, max: 100, required: true },
  username: { type: String, min: 1, max: 20, required: true },
  password: { type: String, min: 4, required: true },
  membership: { type: Boolean, required: true, default: false },
});


//pre save the schema. check if the pass got modified
UserSchema.pre('save',function(next){
  if(!this.isModified('password'))
      return next();
  bcrypt.hash(this.password,10,(err,passwordHash)=>{
      if(err)
          return next(err);
      this.password = passwordHash;
      next();
  });
});

//add compare method to the schema.
UserSchema.methods.comparePassword = function(password, cb){
  bcrypt.compare(password, this.password, (err, isMatch) => {
    if (err) {
      return cb(err)
    } else {
      if (!isMatch){
        return cb(null, isMatch);
      }
      return cb(null, this);
    }
  })
}


module.exports = mongoose.model('User', UserSchema);
