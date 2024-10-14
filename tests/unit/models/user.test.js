const {User} = require('../../../models/user');
// hmain USer chahiye na ky us ky sath validate wala function bi
const jwt = require('jsonwebtoken');
const config = require('config');
const mongoose = require('mongoose');

describe('user.generateToken',()=>{
    it('should return a valid JWT token',()=>{

    // generate token ky function ko test krny ky liye aik user bnao genreate kro token validate kro match kro
    // id valid chahiye mongoose sy banwai ha jwt usy string main badal deti ha to hmain tohex use krna pra ta ky real wali bi 
    // hex main convert ho ky jwt wali sy match ho saky
    const payload= {
        _id: new mongoose.Types.ObjectId().toHexString(),
         isAdmin: true
        };
     const user = new User(payload);
     const token= user.generateToken();
     // now need to validate this token
   const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
   expect(decoded).toMatchObject(payload);
    })
})