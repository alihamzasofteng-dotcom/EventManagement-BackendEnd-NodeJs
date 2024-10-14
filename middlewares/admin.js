

module.exports = function (req, res, next){
    if (!req.user.isAdmin) return res.status(403).send('Access Denied');
    // agar admin ha to agly ko control pass kr dain gy 
    // is case main jo route handler ha 
    next();
}

// req.status(401): Not authenticated, try logging in.
//402: Payment is required (not commonly used).
//403: Authenticated but not authorized, lacks permission.
//404 : 404 Not Found:the URL is incorrect, or the resource (such as a webpage or file) does not exist on the server.