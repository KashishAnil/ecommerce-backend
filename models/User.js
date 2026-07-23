const mongoose = require('mongoose'); //require('mongoose') gives an object with many different methods that allow us to create schemas (through constructor), converty schema into a usable model, etc. 


const userSchema = new mongoose.Schema( //Schema is the name of the constructor of mongoose. 
    {
        fName: {type: String, required: true, trim: true},
        lName: {type: String, required: true, trim: true},
        email: {type: String, required: true, unique: true, lowercase: true, trim: true},
        password: {type: String, required: true, minlength: 8},
        phone: {type: Number, required: true},
        address: {
            area: {type: String, required: true},
            description: {type: String, required: false},
            city: {type: String, required: true},
            country: {type: String, required: true}
        },
        role: {type: String, required: true, enum: ['Customer', 'Admin', 'Seller'], default: 'Customer'},
    }, 
    {
        timestamps: true //timestamps:true adds two new fields to each user document: UpdatedAt, CreatedAt
    }


);

module.exports = mongoose.model('User', userSchema); // before this: userSchema is just text. has nothing to do with database. when we do .model('User',userSchema), MongoDB creates a hierarchy in which User becomes a table. 
//Database (ecomm)
//    -> User (Table)
//           ->Document1 (user1)
//           ->Document2 (user2)
//userSchema is being passed because this is where the actual structure comes from. so it's .model(<TableName>,Table)
// .model attaches a lot of methods on the object it returns. these allow us to actually talk to the database. within these methods, the logic of network request
//has been handled. 

