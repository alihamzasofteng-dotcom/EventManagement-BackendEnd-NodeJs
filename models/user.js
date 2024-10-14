const Joi = require('joi');
const mongoose = require('mongoose');
const config =require('config');
const jwt= require('jsonwebtoken');
const { type } = require('joi/lib/types/object');
//const {genreSchema} = require('./genre');

const userSchema =  new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  email:{
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
    unique: true
  },
  password:{
    type: String,
    required: true,
    minlength: 0,
    maxlength: 1024
  },
  isAdmin: Boolean
})

userSchema.methods.generateToken = function() {
    // userSchema.methods ye is liye kiya kue ky you need to define custom methods that are available on all documents created with the User model
   //This is where you define a custom method generateToken for every instance of a User. Inside this method, 
   //this refers to the current instance (or document) of the User schema.
  //id chahiye ye method user object ka part ha to object ko khud ko refer krny ky liye this use krna pry ga
  // or this arrow function ka hisa nai ha so oper proper function ka name likho gy 
 // arrow functions stand alone function ky tor pe use hoty . agar koi method create krna ho jo object ka hisa ha udr arrow function nai use krty
//  const token = jwt.sign({_id : user._id},config.get('jwtPrivateKey')); 
   const token = jwt.sign({_id : this._id , isAdmin: this.isAdmin},config.get('jwtPrivateKey')); 
    return token;
}

const User = mongoose.model('USer',userSchema);

function validateUSer(user) {
    //what client sends us api ki input
  const schema = {
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required()
  };
  
  return Joi.validate(user, schema);
}

exports.User = User; 
exports.validate = validateUSer;