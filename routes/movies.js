const {Movie, validate} = require('../models/movies');
const mongoose = require('mongoose');
const {Genre} = require('../models/genre');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const movies = await Movie.find().sort('name');
  res.send(movies);
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);
  // bejny wala mje title bejy ga post man ya front end sy movie ka 
  //sath main genre kki id bejy ga main find kronga or us main sy 2 chizain nikal ky movie ky sath rakh ky save krwa donga
  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send('Invalid Genre');

  const movie = new Movie({ 
    title: req.body.title,
    genre: {
        _id: genre._id,
        name: genre.name
    },
    numberInStock: req.body.numberInStock,
    dailyRentalRate : req.body.dailyRentalRate
});
  await movie.save();
  
  res.send(movie);
});

router.put('/:id', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const movie = await Movie.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
    new: true
  });

  if (!movie) return res.status(404).send('The genre with the given ID was not found.');
  
  res.send(movie);
});

router.delete('/:id', async (req, res) => {
  const movie = await Movie.findByIdAndRemove(req.params.id);

  if (!movie) return res.status(404).send('The genre with the given ID was not found.');

  res.send(movie);
});

router.get('/:id', async (req, res) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie) return res.status(404).send('The genre with the given ID was not found.');

  res.send(movie);
});

module.exports = router;