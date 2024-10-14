
const jwt= require('jsonwebtoken');
const config =require('config');

module.exports = function (req, res, next) {
    const token =req.header('x-auth-token');
    if(!token) return res.status(401).send('Access deniad. no token provided');

    //othewirse agar token mil gya to verify kro token ko us privatekey sy jo use hoti ha decoding krny ky liye token ko 
    // ham ny us key ko environment varible main store krwaya hwaha config module sy read ho ga 
     // agar valid ha to decode ho ga or return kry ga payload ko 
    // agar nai to exception dy ga 
    try{
        const decoded= jwt.verify(token, config.get('jwtPrivateKey'));
        // decode ho gya to req main user property set kro . us main bej do 
        req.user = decoded;
       // This makes the user information (e.g., _id, roles) available throughout the request lifecycle.
       // Now, any subsequent middleware or route handler that needs to access user data can retrieve it from req.user.
     //  By attaching the decoded user information to req.user, we make it available for further processing in the route handler.
      // For example, the route handler can now check if the user has permission to access a resource, find the user’s data in the database, or log user activity based on req.user._id.
        // pehly ham ny payload main id beji thi generatetoken krty waqt user main 
        //jwt ko udr decode kiya tha to id ka object mila tha 
        // ham ny us request ko req.user main dal dya ha like ham ab req.user._id kr ky access kr sakty han isy 
        //router.get('/me', auth, (req, res) => {
       // res.send(`User ID: ${req.user._id}`);  // Now we can access the user info from req.user
         //});
        // ab control pass kr do agly middle ware function ko jo ky rote handler ha 
        next();

        // middle ware main ham ya to terminate kr dety han pipeline process ko ya agy pass kr dety control 
    }
    catch(ex){
        res.status(400).send('Invalid token');
    } 
}