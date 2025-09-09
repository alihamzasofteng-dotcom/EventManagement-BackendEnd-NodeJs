const Joi = require('joi');
const mongoose = require('mongoose');

const subserviceSchema = new mongoose.Schema({
    name: { type: String, required: true }
}); 

const Subservice = mongoose.model('Subservice', subserviceSchema );

function validatesubservice(genre) {
  const schema = {
    name: Joi.string().required()
  };
  return Joi.validate(genre, schema);
}

exports.Subservice = Subservice; 
exports.subserviceSchema = subserviceSchema; 
exports.validate = validatesubservice;