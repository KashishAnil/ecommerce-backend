const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
   { 
        productName: {
            type: String, 
            required: true, 
            trim: true
        },
        description: {
            type: String, 
            required: true, 
            trim: true
        },
        price: {
            type: Number, 
            required: true, 
            min: 0
        }, 
        quantityAvailable: {
            type: Number, 
            required: true, 
            min: 0
        },
        imageURL: {
            type: String, 
            required: true
        }, 
        category: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Category',
            required: true
        }, 
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users', 
            required: true
        }

   }, 
   {
        timestamps: true
   }
);

module.exports = mongoose.model('Product', productSchema);