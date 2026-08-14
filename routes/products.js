const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { body } = require('express-validator');
const { requireAuth, requireRole } = require('../middleware/auth');
 
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
router.post('/', requireAuth, requireRole('Seller'), async (req,res) => 
{
    try{
        let products_added = await Product.create({
            ...req.body,
            seller: req.user.userId
    });
        res.status(201).json(products_added);
    } catch(error){
        res.status(500).json({error: error.message});
    }
});

//Update product details 
router.put('/:id', requireAuth, requireRole('Seller'), async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
        return res.status(404).json({ error: 'Product not found' });
        }

        if (req.user.userId !== product.seller.toString()) {
        return res.status(403).json({ error: 'You do not own this product' });
        }

        let updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json(updated);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
//Delete a product 
router.delete('/:id', requireAuth, requireRole('Seller'), async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
        return res.status(404).json({ error: 'Product not found' });
        }

        if (req.user.userId !== product.seller.toString()) {
        return res.status(403).json({ error: 'You do not own this product' });
        }

        let deleted = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        res.status(200).json(deleted);

    } catch (error) {
        res.status(500).json({ error: error.message });
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

//Get products by a certain seller 
router.get('/:id', async(req, res)=>{
try{
    let products_by_seller_id = await Product.findById(req.params.id);
    if(!products_by_seller_id){
        res.status(404).json({error: 'Add products to see them here'});
    }
    else{
        res.status(200).json(products_by_seller_id);
    }
}
catch(error){
    res.status(500).json({error: error.message});
}
});

module.exports = router;
