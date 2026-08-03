const express = require('express');
const router = express.Router();
const Order = require('../models/Orders');
const Cart = require('../models/Cart');
const total_Price = require('../utils/total_price');
const { requireAuth, requireRole } = require('../middleware/auth');

//create order 
// -> first items go in cart and then order is place. 
// -> quantity reduces, cart emptied, items ordered added to order object, payment status updated. 
router.post('/', requireAuth, requireRole('Customer'), async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.userId }).populate('items.product'); //we want a cart document here that has req.user.userId. However, the Cart Schema references two schemas User and Cart. WWe only have references to those schemas, not the real documents. Here, however, we want to access attributes of referenced schema object so we will need the full document. .populate() gets the full document. 

    if (!cart || cart.items.length === 0) {
      return res.status(404).json({ error: 'Nothing added to cart yet' }); 
    }

    let order_placed = await Order.create({ 
      user: req.user.userId, 
      items: cart.items.map(item => ({ 
        product: item.product._id,
        name: item.product.productName,
        priceAtPurchase: item.product.price,
        quantity: item.quantity
      })),
      totalPrice: total_Price(cart.items), //calling utils function
      shippingAddress: req.body.shippingAddress 
    });

    cart.items = []; // need to empty the old cart once the order is placed. 
    await cart.save();

    res.status(201).json(order_placed);

  } catch (error) {
    res.status(500).json({ error: error.message });
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