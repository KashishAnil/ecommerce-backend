const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const { requireAuth, requireRole } = require('../middleware/auth');

//create cart
//creating a cart means adding items. 
//no neeed to check that the user is adding items in their own cart only
//checks you do need to make:
//first: get the user whose cart this is
//second: if a cart is brand new, add the item and increment the quantity
//third: if the cart already exists, 
//                                  search whether the product that we want to add is already in the cart.if yes, increase the quantity. else, add the product to cart and return the cart. 
router.post('/', requireAuth, requireRole('Customer'), async(req,res)=>{
try{
    let cart = await Cart.findOne({user: req.user.userId}); //find the user whose cart this is
    if(!cart){ 
        cart= await Cart.create({
            user: req.user.userId,
            items: [ {product: req.body.productId, quantity: req.body.quantity} ]
        });
        return res.status(200).json(cart); 
    }
    else{
        //check if the product already exists in the cart
        let product_exists_in_cart = cart.items.find(item => item.product.toString() == req.body.productId); //checking if the product already exists in cart
         //Note: find() is a javascript synchronous function that does not return a promise and thus does not need await. find looks within an array and on each element of the array, runs a function. returns a reference to the object.  Here, find() works because we already have the document of user. we want to look within it from something. we already have cart.items. findOne() is a mongoose method that queries the database for a document in a collection of documents. For example, if you need to find a user, you will use findOne(). 
        if(!product_exists_in_cart){ //
         cart.items.push({product: req.body.productId, quantity: req.body.quantity});
         await cart.save(); //we need cart.save() here because we cart.push(...) just changed the cart object in our memory. the database is unchanged. await cart.save() makes changes in database. 
         return res.status(200).json(cart); 
        }
        else{
          //i need to update the quantity of the existing product to this new quantity. items.product_exists_in_cart is the product thats already in database. we need to update its quantity. 
          product_exists_in_cart.quantity+=req.body.quantity;
          await cart.save();
          return res.status(200).json(cart); 
        }
    }
    res.status(200).json(cart);
} catch(error){
    res.status(500).json({error: error.message});
}
});






//Get cart: 
// You cannot fetch by id here because the schema of cart is different. You set one cart per user. One to one relationship between user and cart. 
// Each user has a cart. To find out whether a cart exists, check if a user exists. To access cart details, you can use the user object. 
// the cart details will be accessible through the user. Now, here, before fetching, we want to see whether the cart exists. to do that, we use userID. 
// if we passed '/:id' in the path, that would create problems bcs firstly, the cart id might not exist as of yet because to pass the cart id in the path, you need to
//know it before you run this get route. However, you might not have it before you run this route because you can only have it in two ways:
//1- you created the cart (What if user has not created any cart so far? no id)
//2- you fetched the cart and now you have its id. but this is circular flaw bcs to have its id, you need to fetch and to fetch, you need id. thus, this wont work. 
router.get('/', requireAuth, requireRole('Customer'), async(req,res)=>{
    try{
        let cartExists = await Cart.findOne({user: req.user.userId});
        if(!cartExists){
            return res.status(403).json({error: "Cart is Empty"});
        }
        // if(req.user.userId!=cartExists.Id){
        //     return res.status(403).json({error: "You do not own this cart"});
        // } dont need this part. this check is required when you fear that a user is accessing another user's cart. however, the cartExists object has the user with that userId so the cart has to belong to this user only. redundant check. 
        res.json(cartExists);
    }catch(error){
        res.status(500).json({error: error.message});
    }
    
});
//update cart

router.put('/:id', requireAuth, requireRole('Customer'), async(req,res)=>{
try{
    let cart = await Cart.findOne({user: req.user.userId});
    if(!cart){
        return res.status(404).json({error: 'Cart is empty'});
    }
    let product_to_be_updated = cart.items.find(item => item.product.toString() == req.params.id);
    if(!product_to_be_updated){
        return res.status(404).json({error: 'This item does not exist in the cart'});
    }
    product_to_be_updated.quantity=req.body.quantity;
    await cart.save();
    res.status(200).json(product_to_be_updated);
} catch(error){
    res.status(500).json({error: error.message});
}
});

//delete cart 
//delete that specific product from items list of cart of this user. would require prouctId
router.delete('/:id', requireAuth, requireRole('Customer'), async(req,res)=>{
    try{
        let cart = await Cart.findOne({user: req.user.userId});
        if(!cart){
            return res.status(404).json({error: 'Cart is empty'});
        }
        let existingItem = cart.items.find(item => item.product.toString() == req.params.id);
        if(!existingItem){
            return res.status(404).json({error: 'This item does not exist in the cart'});
        }
        cart.items = cart.items.filter(item=> item.product.toString()!=req.params.id); //filter is a js function that iterates on all elements in the array and runs the function on them. if the function returns false for any element, that element is deleted from the array and returns a plain javascript array. 
        await cart.save();
        res.status(200).json(product_to_be_deleted);
    }catch(error){
        res.status(500).json({error: error.message});
    }
});

module.exports = router;
