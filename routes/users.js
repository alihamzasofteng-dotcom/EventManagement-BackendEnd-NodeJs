const bycrpt = require('bcrypt');

const _ = require('lodash');
const jwt= require('jsonwebtoken');
const config =require('config');
const {User, validate} = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

//registering a user
router.post('/', async (req, res) => {
    //jo request main data aya ha wo scehma ky mutabiq ha ya nai 
    const { error } = validate(req.body); 
    if (error) return res.status(400).send(error.details[0].message);
  
    // user already register ha ya nai 
    //kisi aik property sy usy dhondhna ha to id nai use kry gy findbyone use krty han 
   let user = await User.findOne({email: req.body.email});
   if(user)  return res.status(400).send('user already exist');

     user = new User(
        _.pick(req.body, ['name', 'email', 'password']) 
    );

    const salt = await bycrpt.genSalt(10);
     user.password = await bycrpt.hash(user.password, salt);
     await user.save();

     // ye token us ky liye ha agar direct register sy login krwana ho to register sy header main pass kr do token.
     // wesy ye token login main hota ha auth main
     const token =user.generateToken();
     // jo bi custom header ap define krty ho usy prefix krna prta ha x- sy or agy koi bi name dy do auth-token etc
     //header main name or value pass krni prti ha
   //  res.send(_.pick(user,['_id','name','email']));
    res.header('x-auth-token',token).send(_.pick(user,['_id','name','email']));
});

module.exports = router;