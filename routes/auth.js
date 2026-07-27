const express = require('express');
const User = require('../models/User');
const router =  express.Router();
const bcrypt =  require('bcrypt');
const jwt = require('jsonwebtoken');


//write Post register, Post login 

router.post('/register', async(req, res)=>{ 
//the user enters an email and a password. 
//hash the password. 
//store the email and password in the database using .create in User table
//there must be something like req.email, req.password. 
try{
let hashed_password = await bcrypt.hash(req.body.password, 10); //hash the password and store it into var hashed_password
let newUser = await User.create({ //create a new user keeping everything except the password exactly as given by the user. password goes hashed. 
    ...req.body, 
     password: hashed_password});
res.status(201).json(newUser); //a success message and return the newUser
} catch(error){
    res.json({error: error.message});
}
});

//this is called when the user tries to log in. 
router.post('/login', async(req,res)=>{
//you have to first find email in your database. if it isnt there, the user has not registered yet so it should throw an error.
//once that succeeds, you need to hash the password entered by the user and match it with the hashed password we have stored against that user in our database. 
//once that succeeds, you will create a jwt token and return that. 

try{
const user = await User.findOne({email: req.body.email}); //find the email in database and store the user's object with that email in var user
if(!user){
    return res.status(401).json({error: "Invalid credentials"});
}

const isMatch =  await bcrypt.compare(req.body.password, user.password); //match the password in our database and the one entered by user. isMatch = true if both match, false if not. 
if(!isMatch){
    return res.status(401).json({error: "Invalid credentials"});
}
let token = jwt.sign(  //this function creates a jwt token that is used for authorization later. Token comprises of three parts: header, payload, signature. essentially, the token is created by using hashfunction that takes header, payload, and ou jwt_secret key as input and generates a token that changes if there's any slight change. 
    {userId:user._id, role: user.role},
    process.env.JWT_SECRET,
    {expiresIn: '7d'}
);
res.json({token}); //return token 

} catch(error) {
res.status(500).json({error: error.message});
}

});

module.exports = router;