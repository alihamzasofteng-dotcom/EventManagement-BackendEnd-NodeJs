const Joi = require('joi');
const mongoose = require('mongoose');
const { subcategorySchema } = require('./subcategory');
const { EventSchema } = require('./event');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    image_background: { type: String, required: false }, 
    // events: [EventSchema],
    // subcategories: [subcategorySchema],
}); 

const Category = mongoose.model('Category', categorySchema );

function validateCategory(genre) {
  const schema = {
    name: Joi.string().required(),
    type: Joi.string().required(),
    image_background: Joi.string(),
    // budget: Joi.string().valid('Low', 'Medium', 'High').required(),
    // eventIds: Joi.array().items(Joi.objectId()).optional(),
    // subcategoryIds: Joi.array().items(Joi.objectId()).optional() // only decor has subservices
  };
  return Joi.validate(genre, schema);
}

exports.Category = Category; 
exports.categorySchema = categorySchema; 
exports.validate = validateCategory;