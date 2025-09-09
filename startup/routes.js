const error = require('../middlewares/error');
const express = require('express');
const cors = require('cors');
const genres = require('../routes/genres');
const movies = require('../routes/movies');
const users = require('../routes/users');
const auth = require('../routes/auth');
const customers = require('../routes/customers');
const rentals = require('../routes/rentals');
const returns = require('../routes/returns');
const about = require('../routes/about');
const subservices = require('../routes/subservices');
const services = require('../routes/services');
const subcategories = require('../routes/subcategories');
const categories = require('../routes/categories');
const navbar = require('../routes/navbar');
const event = require('../routes/events');

module.exports= function (app){
app.use(express.json());
app.use(cors());
// app.use(cors({
//     origin: 'http://localhost:5173', // Allow only this origin
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed methods
//     credentials: true, // Allow credentials
//     optionsSuccessStatus: 204 // For older browsers
// }));
app.use('/api/genres', genres);
app.use('/api/movies', movies);
app.use('/api/customers', customers);
app.use('/api/rentals', rentals);
app.use('/api/users', users);
app.use('/api/auth', auth); 
app.use('/api/returns', returns); 
app.use('/api/about', about);
app.use('/api/subservices', subservices); 
app.use('/api/services', services); 
app.use('/api/subcategories', subcategories); 
app.use('/api/categories', categories); 
app.use('/api/navbar', navbar); 
app.use('/api/events', event); 
// app main kisi bi jga error aye pkar saky ye middle ware ka function ha express main use hota 
// lgaty bi is ky bad hi han 
// Error handling middleware
app.use(error);
app.use('/images', express.static('public/images'));

}