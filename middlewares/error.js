const winston = require('winston');
module.exports= function(err, req, res, next){
    // need to wrote all the logic for handeling error in app 
    // jab bi koi excepton aye gi winston sy log kr lain gy 
    // pehla argument is main logging level ka hota ha 
    //logging level determins importance of the message we are going to log jesy error , info, warn, verbose, silly
     winston.error(err.message,err);
    res.status(500).send('Something failed');
    }
  