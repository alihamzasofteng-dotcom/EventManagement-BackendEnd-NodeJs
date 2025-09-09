const validateObjectId = require('../middlewares/validateObjectId');
const auth = require('../middlewares/auth');
const {Subcategory} = require('../models/subcategory');
const {Category, validate: validateCategory} = require('../models/category');
const {Event, validate: validateEvent} = require('../models/event');
const multer = require('multer');
const mongoose = require('mongoose');
const express = require('express');
const admin = require('../middlewares/admin');
const router = express.Router();


// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'public/images/categories');
  },
  filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

router.get('/', async (req, res) => {
  const category = await Category.find().sort('name');
  res.send(category);
});

router.get('/:id', validateObjectId ,async (req, res) => {

  const category = await Category.findById(req.params.id);

  if (!category) return res.status(404).send('The genre with the given ID was not found.');

  res.send(category);
});

// is main events ki array or subcategories ki array dali thi ye na comment khtam krna 

// router.post('/', auth, upload.single('image_background'), async (req, res) => {
//   // Convert comma-separated strings to arrays for eventIds and subcategoryIds
//   let eventIds = req.body.eventIds;
//   if (typeof eventIds === 'string') {
//     eventIds = eventIds.split(',').map(id => id.trim());
//   }

//   let subcategoryIds = req.body.subcategoryIds;
//   if (typeof subcategoryIds === 'string') {
//     subcategoryIds = subcategoryIds.split(',').map(id => id.trim());
//   }

//   // Update the request body with the converted arrays
//   req.body.eventIds = eventIds;
//   req.body.subcategoryIds = subcategoryIds;

//   // Validate the request body using validateCategory
//   const { error } = validateCategory(req.body);
//   if (error) return res.status(400).send(error.details[0].message);

//   // Retrieve full event and subcategory objects
//   const events = eventIds ? await Event.find({ _id: { $in: eventIds } }) : [];
//   if (eventIds && events.length !== eventIds.length) {
//     return res.status(400).send('One or more invalid event IDs');
//   }

//   const subcategories = subcategoryIds ? await Subcategory.find({ _id: { $in: subcategoryIds } }) : [];
//   if (subcategoryIds && subcategories.length !== subcategoryIds.length) {
//     return res.status(400).send('One or more invalid subcategory IDs');
//   }

//   // Assign uploaded image path
//   const imageUrl = req.file ? `/images/categories/${req.file.filename}` : null;
//   req.body.image_background = imageUrl;

//   // Create a new category document with nested event and subcategory data
//   const category = new Category({
//     name: req.body.name,
//     category: req.body.category,
//     budget: req.body.budget,
//     image_background: imageUrl,
//     events: events.map(event => ({
//       _id: event._id,
//       name: event.name,
//       slug: event.slug,
//       images: event.images,
//       description: event.description,
//       budget: event.budget
//     })),
//     subcategories: subcategories.map(subcategory => ({
//       _id: subcategory._id,
//       name: subcategory.name
//     }))
//   });

//   await category.save();
//   res.send(category);
// });
router.post('/', auth, upload.single('image_background'), async (req, res) => {
  // Validate the request body using validateCategory
  const { error } = validateCategory(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Assign uploaded image path
  const imageUrl = req.file ? `/images/categories/${req.file.filename}` : null;
  req.body.image_background = imageUrl;

  // Create a new category document with nested event and subcategory data
  const category = new Category({
    name: req.body.name,
    type: req.body.type,
    image_background: imageUrl,
  });

  await category.save();
  res.send(category);
});


router.put('/:id', [auth, validateObjectId],async (req, res) => {

  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const category = await Category.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
    new: true
  });

  if (!category) return res.status(404).send('The genre with the given ID was not found.');
  
  res.send(category);
});

router.delete('/:id',[auth, admin, validateObjectId], async (req, res) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).send('Invalid ID.');
  }
  
  const category = await Category.findByIdAndRemove(req.params.id);

  if (!category) return res.status(404).send('The genre with the given ID was not found.');

  res.send(category);
});


module.exports = router;



