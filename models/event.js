const Joi = require('joi');
const mongoose = require('mongoose');
const slugify = require('slugify');

// -------------------------------
// Event Schema
// -------------------------------
const EventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    type: {
        type: String,
        required: true,
        enum: [
            'Mehndi',
            'Barat',
            'Walima',
            'Corporate',
            'Dawat',
            'Qawali Night',
            'Birthday'
        ]
    },

    images: [{ type: String, required: true }],
    description: { type: String, required: true },

    // Wedding categories only
    budget: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        required: function () {
            return ['Mehndi', 'Barat', 'Walima'].includes(this.type);
        }
    },

    videoUrl: { type: String, required: false },

    priceRange: {
        minPrice: { type: Number },
        maxPrice: { type: Number }
    },

    peopleRange: {
        minPeople: { type: Number },
        maxPeople: { type: Number }
    },

    availability: {
        days: { type: String },
        startTime: { type: String },
        endTime: { type: String }
    }
});


// ------------------------------------------------------
// AUTO RULES
// Weddings → auto price + capacity
// Static Types → auto correct ranges + NO budget allowed
// ------------------------------------------------------
EventSchema.pre('validate', function (next) {

    const type = this.type;

    /* ================================
       1. Wedding Types (Budget Required)
       ================================ */
    if (['Mehndi', 'Barat', 'Walima'].includes(type)) {

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

        const cfg = rules[this.budget];
        if (cfg) {
            this.priceRange = cfg.priceRange;
            this.peopleRange = cfg.peopleRange;
            this.availability = cfg.availability;
        }
    }

    /* ================================
       2. Static Types (NO budget allowed)
       ================================ */
    const STATIC_TYPES = {
        'Corporate': { minPrice: 2000, minPeople: 3, maxPeople: 2000 },
        'Dawat': { minPrice: 1000, minPeople: 3, maxPeople: 2000 },
        'Qawali Night': { minPrice: 1000, minPeople: 3, maxPeople: 1500 },
        'Birthday': { minPrice: 1000, minPeople: 3, maxPeople: 1000 }
    };

    if (STATIC_TYPES[type]) {

        // Budget forbidden
        if (this.budget) {
            return next(new Error(`Budget must NOT be set for ${type} events.`));
        }

        // Auto-apply static ranges if missing
        const cfg = STATIC_TYPES[type];

        // Starting from price shown in chat only (not max)
        this.priceRange = {
            minPrice: cfg.minPrice,
            maxPrice: cfg.minPrice
        };

        // Capacity ranges
        this.peopleRange = {
            minPeople: cfg.minPeople,
            maxPeople: cfg.maxPeople
        };

        // Optional: can add availability defaults
        if (!this.availability) {
            this.availability = { days: "All days", startTime: "00:00", endTime: "24:00" };
        }
    }

    next();
});

// Auto-generate slug from name before saving
EventSchema.pre('save', function (next) {
    if (!this.slug || this.isModified('name')) {
        this.slug = slugify(this.name, {
            replacement: '-',
            lower: true,
            strict: true,
            trim: true
        });
    }
    next();
});


// -------------------------------
// Joi Validation
// -------------------------------
function validateEvent(event) {
    const schema = Joi.object({
        name: Joi.string().required(),
        slug: Joi.string().optional(),
        type: Joi.string()
            .valid(
                'Mehndi',
                'Barat',
                'Walima',
                'Corporate',
                'Dawat',
                'Qawali Night',
                'Birthday'
            )
            .required(),

        images: Joi.array().items(Joi.string()).required(),
        description: Joi.string().required(),

        budget: Joi.string()
            .valid('Low', 'Medium', 'High')
            .when('type', {
                is: Joi.valid('Mehndi', 'Barat', 'Walima'),
                then: Joi.required(),
                otherwise: Joi.forbidden()
            }),

        videoUrl: Joi.string().optional()
    });

    return schema.validate(event);
}

exports.Event = mongoose.model('Event', EventSchema);
exports.EventSchema = EventSchema;
exports.validate = validateEvent;
