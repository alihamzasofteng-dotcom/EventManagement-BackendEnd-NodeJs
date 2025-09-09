const Joi = require('joi');
const mongoose = require('mongoose');

const EventSchema  = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    type: { type: String, required: true},
    images: [{ type: String, required: true }],
    description: { type: String, required: true },
    //budget: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
    // sirf mehndi barat walima waly events pe budget lgy ga 
    budget: { type: String, enum: ['Low', 'Medium', 'High'], required: function() {
        // Make budget required only for specific types
        return ['Mehndi', 'Barat', 'Walima'].includes(this.type);
    }},
    videoUrl: { type: String, required: false }
}); 

const Event = mongoose.model('Event', EventSchema);

function validateEvent(event) {
    const schema = Joi.object({
        name: Joi.string().required(),
        slug: Joi.string().required(),
        type: Joi.string().required(),
        images: Joi.array().items(Joi.string()).required(),
        description: Joi.string().required(),
        // budget: Joi.string().valid('Low', 'Medium', 'High').required(),
        budget: Joi.string().valid('Low', 'Medium', 'High')
            .when('type', { 
                is: Joi.string().valid('Mehndi', 'Barat', 'Walima'), 
                then: Joi.required(), 
                otherwise: Joi.forbidden() 
            }),
        videoUrl: Joi.string().optional()
    });
    return schema.validate(event);
}

exports.Event = Event; 
exports.EventSchema = EventSchema; 
exports.validate = validateEvent;