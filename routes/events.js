const express = require('express');
const validateObjectId = require('../middlewares/validateObjectId');
const auth = require('../middlewares/auth');
const { Event, validate } = require('../models/event');
const admin = require('../middlewares/admin');
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/events');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// router.get('/', async (req, res) => {
//     const event = await Event.find().sort('name');
//     res.send(event);
//   });
router.get('/', async (req, res) => {
    try {
        const { type, budget, page = 1, limit = 10, sort = 'name', order = 'asc' } = req.query;
        if (budget && !['Mehndi', 'Barat', 'Walima'].includes(type)) {
            return res.status(400).send("Budget filtering is not applicable for the given event type.");
        }
        // Create a filter object based on query parameters
        const filters = {};
        if (type) filters.type = type;
        if (budget) filters.budget = budget;

        // Determine sorting order
        const sortOrder = order === 'desc' ? -1 : 1;

        // Query the database with filters and apply pagination and sorting
        const events = await Event.find(filters)
            .sort({ [sort]: sortOrder }) // Sort dynamically by field
            .skip((page - 1) * limit)   // Apply pagination
            .limit(parseInt(limit));   // Limit results

        // Get total count for pagination
        const total = await Event.countDocuments(filters);

        res.send({
            total,                  // Total number of filtered events
            page: parseInt(page),   // Current page
            limit: parseInt(limit), // Limit per page
            events                  // Paginated events
        });
    } catch (err) {
        res.status(500).send('An error occurred while retrieving events.');
    }
});


router.get('/:id', validateObjectId, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).send('The event with the given ID was not found.');
        }
        
        res.send(event);
    } catch (err) {
        res.status(500).send('An error occurred while retrieving the event.');
    }
});

// Route to fetch a single event by its slug
router.get('/:slug', async (req, res) => {
    try {
        const event = await Event.findOne({ slug: req.params.slug });
        
        if (!event) {
            return res.status(404).send('The event with this slug was not found.');
        }
        
        res.send(event);
    } catch (err) {
        res.status(500).send('An error occurred while retrieving the event.');
    }
});

router.post('/', upload.array('images', 10), async (req, res) => {

    // Map uploaded files to `images` and add it to `req.body` before validation
      req.body.images = req.files.map(file => `/images/events/${file.filename}`);

    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //req.body.images = req.files.map(file => `/images/events/${file.filename}`);
    
    const event = new Event({
        ...req.body,
        images: req.body.images
    });

    await event.save();
    res.send(event);
});

module.exports = router;
