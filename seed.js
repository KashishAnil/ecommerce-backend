//this is a seeding script - meaning it puts some data to populate database to ensure data is getting added etc. 


require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); //bcrypt is used to hash passwords. Hashing passwords is important because if passwords are not hashed, anybody with access to our database can login to that account. bcrypt uses some mathematical formula to make the password unreadable. it can never be converted to its original form once hashed. when user enters password for login, it is hashed and if the hashed password in our database matches the one user entered, they can log in. 
const {faker} = require('@faker-js/faker');

const User = require('./models/User'); //./models/User is the path to User.js file. .js is added automatically by require. 
const Product = require('./models/Product');
const Category = require('./models/Category');

async function seed(){ //async because this function is going to make actual network calls which are gonna take time. 
    try{
        await mongoose.connect(process.env.MONGO_URI); //accessing the database using connection string
        console.log('Connected for seeding');

        await User.deleteMany({}); //each time this script runs, it creates 1 seller, 3 categories, 15 products. if you run this repeatedly, the same seller, category, and products data will get recreated, introducing duplicates to database. this will throw error wherever properties are limited to be unique. Thus, we delete old data before running this script. 
        await Product.deleteMany({});
        await Category.deleteMany({});

        const hashedPassword = await bcrypt.hash('password123',10);  
        const seller = await User.create({
                fName: 'Test',
                lName: 'Seller',
                email: 'seller@example.com',
                password: hashedPassword,
                phone: '1234567890',
                address: { area: 'Test Area', city: 'Karachi', country: 'Pakistan' },
                role: 'Seller'
        }
    );

    // create a few categories
    const categoryNames = ['Electronics', 'Clothing', 'Home & Kitchen'];
    const categories = [];
    for (let name of categoryNames) { // for..of is suitable for async data. 
      let category = await Category.create({ categoryName: name, createdBy: seller._id }); //mongodb assigns an id to each document. To access that id, write <name of the document>._id. 
      //This returns the full saved document into category, including the id that was assigned to the doc by mongodb. an id is given only after the doc is saved in atlas, not before.  
      categories.push(category); 
    }

    //create 15 products, randomly assigned to categories
    for(let i = 0; i < 15; i++){
        let randomCategory=categories[Math.floor(Math.random()*categories.length)]; //Math.random() generates a value between 0 and 1. multiplyig with length generates a number between 0 and length, never the length bcs Math.random() never gives 1. we take Math.floor because we dont want the index to be equal to the length bcs if length is 3, indices are 0,1,2. if we got 3, that's be a problem. by taking the floor, if we get 2.9, it gets floored to 2, which is valid. basically, this is the standard way to generate random indices in an array. 
        let products = await Product.create({ 
            productName:faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            price: faker.commerce.price({min:5, max: 10000}),
            quantityAvailable:faker.number.int({min:1, max: 100}), 
            imageURL: faker.image.url(),
            category: randomCategory._id,
            seller: seller._id
        });
    }
    console.log('Seeding Complete');

    } catch (error){
        console.log('Seeding error:',error);
    } finally{ //finally comes after try and catch. finally always runs, regardless of whether try succeeded or the error block got executed. 
        await mongoose.disconnect(); // if we dont write this line, no terminal output would show. that's because we wrote mongoose.connect() in server.js. This opens a live real connection to Atlas. That connection stays open until you explicity close it. The seed script is meant to run once and exit. Thus you disconnect here and close the connection.  
    }
    
};

seed();

