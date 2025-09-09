const validateObjectId = require('../middlewares/validateObjectId');
const auth = require('../middlewares/auth');
const {Subservice} = require('../models/subservice');
const {Service, validate} = require('../models/service');
const mongoose = require('mongoose');
const express = require('express');
const admin = require('../middlewares/admin');
const router = express.Router();

router.get('/', async (req, res) => {
  const service = await Service.find().sort('name');
  res.send(service);
});

router.get('/:id', validateObjectId ,async (req, res) => {

  const service = await Service.findById(req.params.id);

  if (!service) return res.status(404).send('The genre with the given ID was not found.');

  res.send(service);
});

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  // const subserviceIds = req.body.subserviceIds; // Array of IDs passed in the request
  // const subservices = await Subservice.find({ _id: { $in: subserviceIds } });

  // if (subservices.length !== subserviceIds.length) {
  //   return res.status(400).send('One or more invalid subservice IDs');
  // }
  let subservices = []; // only decor has subservices other objects has not. 
  if (req.body.subserviceIds) {
    subservices = await Subservice.find({ _id: { $in: req.body.subserviceIds } });
    if (subservices.length !== req.body.subserviceIds.length) {
      return res.status(400).send('One or more invalid subservice IDs');
    }
  }

  // Create new service with full subservice objects
  let service = new Service({ 
    name: req.body.name,
    subservices: subservices.map(subservice => ({
      _id: subservice._id,
      name: subservice.name
    }))
  });
  
  service = await service.save();
  
  res.send(service);
});

router.put('/:id', [auth, validateObjectId],async (req, res) => {

  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const service = await Service.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
    new: true
  });

  if (!service) return res.status(404).send('The genre with the given ID was not found.');
  
  res.send(service);
});

router.delete('/:id',[auth, admin, validateObjectId], async (req, res) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).send('Invalid ID.');
  }
  
  const service = await Service.findByIdAndRemove(req.params.id);

  if (!service) return res.status(404).send('The genre with the given ID was not found.');

  res.send(service);
});


module.exports = router;