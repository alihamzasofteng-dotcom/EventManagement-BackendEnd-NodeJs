const error = require('../middlewares/error');
const express = require('express');
const genres = require('../routes/genres');
const movies = require('../routes/movies');
const users = require('../routes/users');
const auth = require('../routes/auth');
const customers = require('../routes/customers');
const rentals = require('../routes/rentals');
const returns = require('../routes/returns');

module.exports= function (app){
app.use(express.json());
app.use('/api/genres', genres);
app.use('/api/movies', movies);
app.use('/api/customers', customers);
app.use('/api/rentals', rentals);
app.use('/api/users', users);
app.use('/api/auth', auth); 
app.use('/api/returns', returns); 
// app main kisi bi jga error aye pkar saky ye middle ware ka function ha express main use hota 
// lgaty bi is ky bad hi han 
// Error handling middleware
app.use(error);
}