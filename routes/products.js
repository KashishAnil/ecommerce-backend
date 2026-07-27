const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { body } = require('express-validator');
const requireAuth = require('../middleware/auth');

//CRUD -> Create, Read, Update, Delete

//GET ALL PRODUCTS
router.get('/', async (req,res)=>{
    try{
        let products = await Product.find();
        res.json(products)
    }catch(error){
            res.status(500).json({error: 'Server error'});
    }
});

//Post a product
router.post('/', requireAuth, async (req,res) => 
{
    try{
        let products_added = await Product.create(req.body);
        res.status(201).json(products_added);
    } catch(error){
        res.status(500).json({error: error.message});
    }
});

//Update a product 
router.put('/:id',requireAuth, async (req, res)=>{
    try{
            let updated = await Product.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
            if (!updated) {
                res.status(404).json({ error: 'Product not found' });
            }
            else{
                res.status(200).json(updated);
            }
    } catch(error){
        res.status(500).json({error: error.message});
    }
});

//Delete a product 
router.delete('/:id', requireAuth, async (req, res) => {
    try{
        let deleted = await Product.findByIdAndUpdate(req.params.id, {isActive: false}, {new:true}  );
        if(!deleted) {
            res.status(404).json({error: 'Product not found'});
        }
        else{
            res.status(200).json(deleted);
        }
    } catch(error){
        res.status(500).json({error: error.message});
    }
});

//Get a certain product

router.get('/:id', async (req,res)=>{
    try{
        let item_retrieved = await Product.findById(req.params.id);
        if(!item_retrieved){
            res.status(404).json({error: 'Product not found'});
        }
        else{
        res.status(200).json(item_retrieved);
        }
    } catch(error){
        res.status(500).json({error: error.message});
    }
});

module.exports = router;
