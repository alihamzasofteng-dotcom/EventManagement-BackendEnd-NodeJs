const validateObjectId = require('../middlewares/validateObjectId');
const auth = require('../middlewares/auth');
const {Subservice, validate} = require('../models/subservice');
const mongoose = require('mongoose');
const express = require('express');
const admin = require('../middlewares/admin');
const router = express.Router();

router.get('/', async (req, res) => {
  const subservice = await Subservice.find().sort('name');
  res.send(subservice);
});

router.get('/:id', validateObjectId ,async (req, res) => {

  const subservice = await Subservice.findById(req.params.id);

  if (!subservice) return res.status(404).send('The genre with the given ID was not found.');

  res.send(subservice);
});

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let subservice = new Subservice({ name: req.body.name });
  subservice = await subservice.save();
  
  res.send(subservice);
});

router.put('/:id', [auth, validateObjectId],async (req, res) => {

  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const subservice = await Subservice.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
    new: true
  });

  if (!subservice) return res.status(404).send('The genre with the given ID was not found.');
  
  res.send(subservice);
});

router.delete('/:id',[auth, admin, validateObjectId], async (req, res) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).send('Invalid ID.');
  }
  
  const subservice = await Subservice.findByIdAndRemove(req.params.id);

  if (!subservice) return res.status(404).send('The genre with the given ID was not found.');

  res.send(subservice);
});


module.exports = router;