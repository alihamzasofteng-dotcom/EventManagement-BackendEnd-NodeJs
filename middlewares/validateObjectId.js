const mongoose = require('mongoose');

module.exports = function (req, res, next)
 {
    // agar koi invalid id bejta ha let say /api/genre/1 jo ky exist ni krti db main
    // to mongoose sy check kro object id ko mil jati ha route handle ko control pass kr dy 
    // warna 404 error dy
    // ye har aik pe test ho ga /id waly route pe. 
    if (req.params.id) {
        // Validate the id using mongoose's ObjectId check
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).send('Invalid Id');
        }
    }
    next();

 }
