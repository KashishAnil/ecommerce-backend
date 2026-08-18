const express = require('express');
const router = express.Router();
const Order = require('../models/Orders');
const Cart = require('../models/Cart');
const Product = require('../models/Product')
const mongoose = require('mongoose');
const total_Price = require('../utils/total_price');
const { requireAuth, requireRole } = require('../middleware/auth');

//create order 
// -> first items go in cart and then order is placed. 
// -> quantity reduces, cart emptied, items ordered added to order object, payment status updated. 
router.post('/', requireAuth, requireRole('Customer'), async (req, res) => {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    let cart = await Cart.findOne({ user: req.user.userId }).populate('items.product').session(session); //we want a cart document here that has req.user.userId. However, the Cart Schema references two schemas User and Cart. WWe only have references to those schemas, not the real documents. Here, however, we want to access attributes of referenced schema object so we will need the full document. .populate() gets the full document. 

    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Nothing added to cart yet' }); 
    }

    //we cannot allow an order to be placed if the quantity required here is greater than the quantity available. 
    //we will have to check the available quantity of all items in the cart. 
    for (let item of cart.items) {
      if (item.product.quantityAvailable < item.quantity) {
      await session.abortTransaction();
      return res.status(400).json({
      error: `Not enough stock for ${item.product.productName}`
    });
  }
}
    let order_placed = await Order.create([{ 
        user: req.user.userId, 
        items: cart.items.map(item => ({ 
        product: item.product._id,
        name: item.product.productName,
        priceAtPurchase: item.product.price,
        quantity: item.quantity
      })),
      totalPrice: total_Price(cart.items), //calling utils function
      shippingAddress: req.body.shippingAddress 
    }],{session, new: true});

    for(let item of cart.items){
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: {quantityAvailable: -item.quantity} //inc operator is used to tell the server to look this field up (quantityAvailable in this case) and update it atomically. no read operation or write operation from any other request happens until this is done fully. 
      }, {session});
    }

    cart.items = []; // need to empty the old cart once the order is placed. 
    await cart.save({ session });

    await session.commitTransaction();
    res.status(201).json(order_placed[0]);
    
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally{
    session.endSession();
    console.log({session});
    
  }
});

//Get Orders

router.get('/',requireAuth, requireRole('Customer'), async(req,res)=>{
try{
  //i want to find the seller of the order and get 
  let order = await Order.find({user: req.user.userId}); //no need for if(!order) bcs if order is empty, find will return [], which is okay. 
  res.status(200).json(order);
}catch(error){
   res.status(500).json({ error: error.message });
}
});

//get an order's details.
router.get('/:id', requireAuth, requireRole('Customer'), async(req,res)=>{
  try{
    let order = await Order.findById(req.params.id);
    if (!order){
      return res.status(404).json({error: 'You have not placed any order yet.'});
    }
      if (order.user.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'You do not own this order' });
    } //It is possible to fetch the order of another customer if their order id is given. By writing this, we allow the user to fetch only his order details. 
    res.json(order);
  }catch(error){
    res.status(500).json({error: error.message});
  }
})

module.exports = router;