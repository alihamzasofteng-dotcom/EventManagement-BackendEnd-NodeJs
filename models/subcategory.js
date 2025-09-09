const Joi = require('joi');
const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
    name: { type: String, required: true }
}); 

const Subcategory = mongoose.model('Subcategory', subcategorySchema );

function validatesubcategory(genre) {
  const schema = {
    name: Joi.string().required()
  };
  return Joi.validate(genre, schema);
}

exports.Subcategory = Subcategory; 
exports.subcategorySchema = subcategorySchema; 
exports.validate = validatesubcategory;