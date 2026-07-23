const mongoose = require('mongoose');

const ordersSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            required: true,
        }, 
        items: [
            { product: {
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
        deliveryStatus: {
            type: String,
            required: true,
            enum: ['pending', 'shipped', 'delivered'],
            default: 'pending'
        }
    }, 

    {
        timestamps: true
    }
);

module.exports = mongoose.model('Order', ordersSchema);