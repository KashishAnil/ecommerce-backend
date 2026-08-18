const mongoose = require('mongoose');

const ordersSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            required: true,
        }, 
        items: [
            { 
             product: {
                        type: mongoose.Schema.Types.ObjectId, 
                        ref: 'Product', 
                        required: true
            }, 
             name:  {
                       type: String, 
                       required: true     
            },
             priceAtPurchase: {
                        type: Number,
                        required: true, 
                        min: 0
            }, 
            quantity: {
                        type: Number, 
                        required: true, 
                        min:1
            }
            }
        ], 
        totalPrice: {
            type: Number, 
            required: true, 
            min: 0
        },
        shippingAddress:{
             street: { type: String, required: true },
             city: { type: String, required: true },
             country: { type: String, required: true }
        }, 
        paymentStatus: {
            type: String,
            required: true,
            enum: ['unpaid', 'paid'],
            default: 'unpaid'
        },
        stripeSessionId: {type: String}, //this is the id for checkout session. A checkout session is a Stripe-hosted webpage to pay customized to every order (each order has different bill and different items).
        stripePaymentIntentId: {type: String} //this contains all details of what happened at Stripe with the customer. 
        }, 
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Order', ordersSchema);