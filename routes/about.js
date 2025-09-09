const validateObjectId = require('../middlewares/validateObjectId');
const auth = require('../middlewares/auth');
const {About, validate} = require('../models/about');
const mongoose = require('mongoose');
const express = require('express');
const admin = require('../middlewares/admin');
const router = express.Router();

router.get('/', async (req, res) => {
  const about = await About.find().sort('name');
  res.send(about);
});

router.get('/:id', validateObjectId ,async (req, res) => {

  const about = await About.findById(req.params.id);

  if (!about) return res.status(404).send('The genre with the given ID was not found.');

  res.send(about);
});

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let about = new About({ name: req.body.name });
  about = await about.save();
  
  res.send(about);
});

router.put('/:id', [auth, validateObjectId],async (req, res) => {

  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const about = await About.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
    new: true
  });

  if (!about) return res.status(404).send('The genre with the given ID was not found.');
  
  res.send(about);
});

router.delete('/:id',[auth, admin, validateObjectId], async (req, res) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).send('Invalid ID.');
  }
  
  const about = await About.findByIdAndRemove(req.params.id);

  if (!about) return res.status(404).send('The genre with the given ID was not found.');

  res.send(about);
});


module.exports = router;