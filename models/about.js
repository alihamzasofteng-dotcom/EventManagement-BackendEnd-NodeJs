const Joi = require('joi');
const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
    name: { type: String, required: true }
}); 

const About = mongoose.model('About', aboutSchema );

function validateAbout(genre) {
  const schema = {
    name: Joi.string().required()
  };
  return Joi.validate(genre, schema);
}

exports.About = About; 
exports.aboutSchema = aboutSchema; 
exports.validate = validateAbout;