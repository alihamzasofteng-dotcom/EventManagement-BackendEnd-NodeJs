const validateObjectId = require('../middlewares/validateObjectId');
const auth = require('../middlewares/auth');
const {Subcategory, validate} = require('../models/subcategory');
const mongoose = require('mongoose');
const express = require('express');
const admin = require('../middlewares/admin');
const router = express.Router();

router.get('/', async (req, res) => {
  const subcategory = await Subcategory.find().sort('name');
  res.send(subcategory);
});

router.get('/:id', validateObjectId ,async (req, res) => {

  const subcategory = await Subcategory.findById(req.params.id);

  if (!subcategory) return res.status(404).send('The genre with the given ID was not found.');

  res.send(subcategory);
});

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let subcategory = new Subcategory({ name: req.body.name });
  subcategory = await subcategory.save();
  
  res.send(subcategory);
});

router.put('/:id', [auth, validateObjectId],async (req, res) => {

  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const subcategory = await Subcategory.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
    new: true
  });

  if (!subcategory) return res.status(404).send('The genre with the given ID was not found.');
  
  res.send(subcategory);
});

router.delete('/:id',[auth, admin, validateObjectId], async (req, res) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).send('Invalid ID.');
  }
  
  const subcategory = await Subcategory.findByIdAndRemove(req.params.id);

  if (!subcategory) return res.status(404).send('The genre with the given ID was not found.');

  res.send(subcategory);
});


module.exports = router;