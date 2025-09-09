const Joi = require('joi');
const mongoose = require('mongoose');
Joi.objectId = require('joi-objectid')(Joi);

const navbarSchema = new mongoose.Schema({
    title: { type: String, required: true },
    dropdown: [
        {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'dropdownType'
        }
    ],
    dropdownType: {
        type: String,
        required: true,
        enum: ['Category', 'Service', 'About', 'None'] // None isi liye simple object bi save ho ga jis ka dropdown ni ha further categories ni ha
    }
});

const Navbar = mongoose.model('Navbar', navbarSchema );

function validateNavbar(navbar) {
    const schema = Joi.object({
        title: Joi.string().required(),
        dropdown: Joi.array().items(Joi.objectId()).optional(),
        dropdownType: Joi.string().valid('Category', 'Service', 'About', 'None').required()
    });
    
    return schema.validate(navbar);
}

//module.exports = mongoose.model('Navbar', navbarSchema);
exports.Navbar = Navbar; 
exports.navbarSchema = navbarSchema; 
exports.validate = validateNavbar;
