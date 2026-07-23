const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema(
    { 
    categoryName:{ 
        type: String, 
            required: true,
            unique: true, 
            trim: true
        },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    }

    },
    {
    timestamps: true
    }
);

module.exports = mongoose.model('Category',categorySchema);