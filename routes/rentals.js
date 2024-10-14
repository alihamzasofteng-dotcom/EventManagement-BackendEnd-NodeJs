const {Rental, validate} = require('../models/rentals');
const mongoose = require('mongoose');
const {Movie} = require('../models/movies');
const {Customer} = require('../models/customer');
const express = require('express');
const router = express.Router();
const Fawn =require ('fawn');


Fawn.init(mongoose);

router.get('/', async (req, res) => {
  const rentals = await Rental.find().sort('-dateOut');
  res.send(rentals);
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send('Invalid customer.');

  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(400).send('Invalid movie.');


  if (movie.numberInStock === 0) return res.status(400).send('Movie not in stock.');

  let rental = new Rental({ 
    customer: {
        _id: customer._id,
        name: customer.name,
        phone: customer.phone,
        isGold: customer.isGold
    },
    movie:{
        _id: movie._id,
        title: movie.title,
        dailyRentalRate: movie.dailyRentalRate
    }
});

// rental = await rental.save();
//   movie.numberInStock--;
//   await movie.save();

//we will do task object
// is main multiple operations dalo wo aik ky tor pe treat hongy
// collection pass krni ha case sensitive ha or object pass kro
// collection matlb database main rentals sy save ho rha ha na 
//update ka aisy hi code ha 
//or bi bry hty han is ky functions jesy remove etc
//last pe run krna prta ha 
try{
new Fawn.Task()
    .save('rentals', rental)
    .update('movies', 
        { _id : movie._id},
        { $inc :{ numberInStock : -1}
    })
    .run();
  res.send(rental);
  }
  catch (ex){
    res.status(500).send('something failed');
  }
});

router.put('/:id', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const rental = await Rental.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
    new: true
  });

  if (!rental) return res.status(404).send('The genre with the given ID was not found.');
  
  res.send(rental);
});

router.delete('/:id', async (req, res) => {
  const rental = await Rental.findByIdAndRemove(req.params.id);

  if (!rental) return res.status(404).send('The genre with the given ID was not found.');

  res.send(rental);
});

router.get('/:id', async (req, res) => {
  const rental = await Rental.findById(req.params.id);

  if (!rental) return res.status(404).send('The genre with the given ID was not found.');

  res.send(rental);
});

module.exports = router;