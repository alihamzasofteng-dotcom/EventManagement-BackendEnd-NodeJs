const Joi = require('joi');
const mongoose = require('mongoose');
const {genreSchema} = require('./genre');

const Movie = mongoose.model('Movies', new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  genre:{
    type: genreSchema,
    required : true
  },
  numberInStock:{
    type: Number,
    required: true,
    minlength: 0,
    maxlength: 250
  },
  dailyRentalRate:{
    type: Number,
    required: true,
    minlength: 0,
    maxlength: 250
  }
}));

function validateMovies(movie) {
    //what client sends us api ki input
  const schema = {
    title: Joi.string().min(3).required(),
    //client sirf id bejy ga 
    genreId: Joi.objectId().required(),
    numberInStock: Joi.number().min(0).required(),
    dailyRentalRate: Joi.number().min(0).required()
  };

  return Joi.validate(movie, schema);
}

exports.Movie = Movie; 
exports.validate = validateMovies;