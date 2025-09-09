const Joi = require('joi');
const mongoose = require('mongoose');
const { subserviceSchema } = require('./subservice');

const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    subservices: [subserviceSchema]
}); 

const Service = mongoose.model('Service', serviceSchema );

function validateService(genre) {
  const schema = {
    name: Joi.string().required(),
    subserviceIds: Joi.array().items(Joi.objectId()).optional() // only decor has subservices
  };
  return Joi.validate(genre, schema);
}

exports.Service = Service; 
exports.serviceSchema = serviceSchema; 
exports.validate = validateService;

