const express = require('express');
const router = express.Router(); // .Router() is a mini version of app; meaning it can do everything app can (except server config and making the server listen). express.Router() allows us to write routes separately for different files. then express does the work of tracing when to call which file and which route within each file. 
const Category = require('../models/Category'); 


//When routes are created, they are just stored as a pair of the method(GET, POST, DELETE) and the path ('/', '/products') etc. Then, once we get a real request, tracing the path begins and we execute the correct function, if it exists. Otherwise, we return an error. 

//GET all categories
router.get('/', async (req, res) =>{  //We're in Categories.js. if it is GET localhost/3000/categories, this method will be called. 
    try{
    let categories = await Category.find();
    res.json(categories);
    } catch (error){
        res.status(500).json({error: 'Server error'});
    }

} );

//POST a new category

router.post('/', async(req,res)=>{
    try{
        let category = await Category.create(req.body);
        res.status(201).json(category);
    } catch(error){
         res.status(400).json({ error: error.message });
    }
});

module.exports = router;