// agar user valid deta ha to us ka payload ko user ki property main rakhwana ha req.user main.
const {User} = require('../../../models/user');
const auth = require('../../../middlewares/auth');
const mongoose = require('mongoose');

describe('auth middleware',()=>{

    beforeEach(() => { 
      process.env.PORT = 3001;
        server = require('../../../index'); 
    });
    afterEach(async () => { 
        try {
            await server.close();
            server = null; // Avoid reusing the same server instance
          } catch (err) {
            console.log("Error closing server:", err);
          }
    });

    it(' should populate req.user with the payload of a valid json web token', async()=>{

    const user={_id: mongoose.Types.ObjectId().toHexString(), isAdmin: true}
       // we need a valiad json web token
     const token= new User(user).generateToken();
     // auth middleware function chahiye  auth(req,res,user); or req, res ko mock krna pry ga idr 
     // req main kya chahiye ? auth.js main dekho req.header ko call krty han header ko read krny ky liye 
     // mock object main method hona chahiye header name ka
     const req ={
        header: jest.fn().mockReturnValue(token)
     };
    // is main ham response pe kam ni kr rhy
     const res ={};
     // next bi chahiye mock
     const next = jest.fn();
    // ab dalo isy auth ky function main tino ko
    auth(req,res,next);

    expect(req.user).toMatchObject(user);
     });
})