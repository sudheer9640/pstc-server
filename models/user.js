const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    // require: true
    // minlength: 6
  }, 
  userName: {
    type: String,
    require: true,
    unique: true
  },
  role: {
    type: String,
    require: true
  }, 
  mobile: {
    type: String,
    require: true,
   // minlength: 10
  },
  lastLoginTime:{
    type:Date
  },
  isLoggedIn:{
    type:Boolean
  }
},{timestamps: true});


userSchema.methods.generateHash = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
}

userSchema.methods.validPassword = function(password){
  return bcrypt.compareSync(password, this.password)
}

const User = mongoose.model('User', userSchema);

module.exports = {User}
