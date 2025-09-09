const validateObjectId = require('../middlewares/validateObjectId');
const auth = require('../middlewares/auth');
const {Navbar, validate} = require('../models/navbar');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipIndex = (page - 1) * limit;

    try {
        const count = await Navbar.countDocuments(); // Total count of Navbar items
        const navbars = await Navbar.find()
            .skip(skipIndex)
            .limit(limit);

        const results = await Promise.all(navbars.map(async (item) => {
            let populatedDropdown = item.dropdown;

            // Populate only if dropdownType is not 'None'
            if (item.dropdownType !== 'None') {
                populatedDropdown = await Navbar.populate(item, {
                    path: 'dropdown',
                    populate: { path: 'subcategories subservices', model: 'Subcategory' }
                });
            }

            return {
                id: item._id,
                title: item.title,
                dropdown: populatedDropdown.dropdown || [],
            };
        }));

        const pagination = {
            count,
            next: page * limit < count ? `/api/navbars?page=${page + 1}&limit=${limit}` : null,
            previous: page > 1 ? `/api/navbars?page=${page - 1}&limit=${limit}` : null,
            results
        };

        res.send(pagination);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.post('/', auth,async (req, res) => {

    const { error } = validate(req.body);
    if (error) return res.status(400).send({ error: error.details[0].message });
 
     try {
         const { title, dropdown, dropdownType } = req.body;
 
         // Validate the dropdown type
         if (!['Category', 'Service', 'About','None'].includes(dropdownType)) {
             return res.status(400).send({ error: "Invalid dropdownType. Must be 'Category', 'Service', or 'About'." });
         }
 
         // Create new Navbar item
         const navbarItem = new Navbar({
             title,
             dropdown,   
             dropdownType    
         });
 
         // Save Navbar item to the database
         await navbarItem.save();
     //    const populatedNavbarItem = await Navbar.findById(navbarItem._id).populate('dropdown');
           const populatedNavbarItem = dropdownType !== 'None'
             ? await Navbar.findById(navbarItem._id).populate({
                 path: 'dropdown',
                 model: dropdownType,  // Dynamic model based on dropdownType
             })
             : navbarItem; 
 
         res.status(201).send(populatedNavbarItem);
     } catch (error) {
         res.status(400).send({ error: error.message });
     }
 });

router.get('/:id', validateObjectId, async (req, res) => {
    try {
        const navbarItem = await Navbar.findById(req.params.id);

        if (!navbarItem) return res.status(404).send('Navbar item not found.');

        // Populate only if dropdownType is not 'None'
        if (navbarItem.dropdownType !== 'None') {
            await Navbar.populate(navbarItem, {
                path: 'dropdown',
                populate: { path: 'subcategories subservices', model: 'Subcategory' }
            });
        }

        res.send({
            id: navbarItem._id,
            title: navbarItem.title,
            dropdown: navbarItem.dropdown || [],
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});


router.put('/:id', validateObjectId, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send({ error: error.details[0].message });

    try {
        const { title, dropdown, dropdownType } = req.body;

        if (!['Category', 'Service', 'About', 'None'].includes(dropdownType)) {
            return res.status(400).send({ error: "Invalid dropdownType. Must be 'Category', 'Service', 'About', or 'None'." });
        }

        const updatedNavbarItem = await Navbar.findByIdAndUpdate(
            req.params.id,
            { title, dropdown, dropdownType },
            { new: true, runValidators: true }
        );

        if (!updatedNavbarItem) return res.status(404).send('Navbar item not found.');

        // Populate dropdown if necessary
        if (dropdownType !== 'None') {
            await Navbar.populate(updatedNavbarItem, {
                path: 'dropdown',
                populate: { path: 'subcategories subservices', model: 'Subcategory' }
            });
        }

        res.send(updatedNavbarItem);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});


router.delete('/:id', validateObjectId, async (req, res) => {
    try {
        const navbarItem = await Navbar.findByIdAndRemove(req.params.id);

        if (!navbarItem) return res.status(404).send('Navbar item not found.');

        res.send({ message: 'Navbar item deleted successfully.' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});



module.exports = router;