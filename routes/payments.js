const express = require('express');
const router = express.Router();
const Orders = require('../models/Orders.js');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const {requireAuth, requireRole} = require('../middleware/auth');

//create a checkout session
//A checkout session is created when the customer presses 'Place Order' button. We tell Stripe the order details and Stripe creates a payment page for that customer and gives a url. We redirect customer browser to that URL. 
router.post('/checkout/:orderId', requireAuth, requireRole('Customer'), async(req,res)=>{
    try{
        let order = await Orders.findById(req.params.orderId); 
        if(!order){
            return res.status(404).json({error: 'Order not found'});
        }
        const session = await stripe.checkout.sessions.create({ //this creates a checkout session with the details given within
            payment_method_types: ['card'],
            line_items: order.items.map(item => ({
                price_data: {
                    currency: 'usd',
                    product_data: {name: item.name},
                    unit_amount: Math.round(item.priceAtPurchase * 100)
                },
                quantity: item.quantity
            })), 
            mode: 'payment', //one-time payment
            success_url: 'https://react.customdev.solutions/ecommerce-frontend/success',
            cancel_url: 'https://react.customdev.solutions/ecommerce-frontend/',
            metadata: { orderId: order._id.toString() } //we're giving additional info of orderId. 
        }); 
        order.stripeSessionId = session.id; //stripeSessionId is a variable we had in our order schema.  

        await order.save(); 
        res.json({checkoutUrl: session.url});//returns session url that we then redirect our client's browser to 

    }catch(error){
        res.status(500).json({ error: error.message });
    }
})

//webhook is what stripe uses to talk with us. This is the aftermath of user interaction with Stripe.
//Stripe makes an HTTp request to the url you gave it. However, bcs the url you gave is publically available, anybody else can use it too.
// So to ensure it is Stripe only, mkaing the request to your url, Stripe sends a SECRET_WEBHOOK_KEY. 
// Stripe attahces the signature- a piece of data calculated from sthe secret key. you also recompute the signature. 
// if both match, the request is indeed from stripe. if they dont, the request is from somebody else. dont accept. 
router.post('/webhook', express.raw({type: 'application/json'}), async(req,res)=>{ // the general syntax includes: path, middleware functions, async. generally, middleware func were requireAuth, requireRole.
    //here, it is express.raw({type: 'application/json}). Generally, we write app.use(express.json()) in script.js. What that does is: it takes the content that comes in through req and parses it as JSON and makes a JSON object out of req.body so it is accessible. Here, to recompute the signature, we need raw req.body. Otherwise, the signature wont match. 
    console.log("line1",req);
    const sig = req.headers['stripe-signature']; //stripe attaches its own signature to header of req. 

let event;
try{

    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
}catch(error){
    return res.status(400).send(`Webhook signature verification failed: ${error.message}`);
  }
if (event.type==='checkout.session.completed'){
    const session = event.data.object;
    const orderId = session.metadata.orderId;

    const successful=await Orders.findByIdAndUpdate(orderId, {
      paymentStatus: 'paid',
      stripePaymentIntentId: session.payment_intent
    });
    console.log("success", successful);
}
 res.json({ received: true });
 console.log("function end");
 
}



)
module.exports = router;

