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
        const filters = {};
        if (type) filters.type = type;
        if (budget) filters.budget = budget;

        const sortOrder = order === 'desc' ? -1 : 1;

        const events = await Event.find(filters)
            .sort({ [sort]: sortOrder })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Event.countDocuments(filters);

        let priceBounds = undefined;
        if (budget && ['Mehndi', 'Barat', 'Walima'].includes(type)) {
            const map = {
                Low: { minPrice: 1000, maxPrice: 2000 },
                Medium: { minPrice: 2000, maxPrice: 3500 },
                High: { minPrice: 5000, maxPrice: 50000 }
            };
            priceBounds = map[budget] || undefined;
        }

        res.send({
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            events,
            priceBounds
        });
    } catch (err) {
        res.status(500).send('An error occurred while retrieving events.');
    }
});


router.get('/:slugOrId', async (req, res) => {
    try {
        const id = req.params.slugOrId;

        let event = null;

        // Try ID lookup
        if (/^[0-9a-fA-F]{24}$/.test(id)) {
            event = await Event.findById(id);
        }

        // Try slug lookup
        if (!event) {
            event = await Event.findOne({ slug: id });
        }

        if (!event) {
            return res.status(404).send('Event not found');
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

router.post('/backfill', [auth, admin], async (req, res) => {
    try {
        const filter = {
            type: { $in: ['Mehndi', 'Barat', 'Walima'] },
            budget: { $in: ['Low', 'Medium', 'High'] }
        };
        const events = await Event.find(filter);

        const rules = {
            Low: {
                priceRange: { minPrice: 1000, maxPrice: 2000 },
                peopleRange: { minPeople: 3, maxPeople: 20 },
                availability: { days: 'Monday–Friday', startTime: '09:00', endTime: '22:00' }
            },
            Medium: {
                priceRange: { minPrice: 2000, maxPrice: 3500 },
                peopleRange: { minPeople: 3, maxPeople: 30 },
                availability: { days: 'Monday–Saturday', startTime: '09:00', endTime: '23:00' }
            },
            High: {
                priceRange: { minPrice: 5000, maxPrice: 50000 },
                peopleRange: { minPeople: 3, maxPeople: 100 },
                availability: { days: 'All days', startTime: '00:00', endTime: '24:00' }
            }
        };

        let updated = 0;
        for (const e of events) {
            const cfg = rules[e.budget];
            if (!cfg) continue;
            e.priceRange = cfg.priceRange;
            e.peopleRange = cfg.peopleRange;
            e.availability = cfg.availability;
            await e.save();
            updated += 1;
        }

        res.send({ matched: events.length, updated });
    } catch (err) {
        res.status(500).send('An error occurred while backfilling events.');
    }
});

module.exports = router;
