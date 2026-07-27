const express =  require('express');
const router =  express.Router();
const jwt = require('jsonwebtoken');

//when a request is made, it travels to the server. before it reaches the server, middleware files run for any checks you want before the request is able to actually do anything. 
function requireAuth(req, res, next){ //next has to be used in middleware. next means we're done here. move to the next step. 
const authHeader = req.headers.authorization; //we will pass the token when making the request with the name authorization. this is how it becomes accessible here. However, we're manually passing the authorization token now because our goal is not to build the frontend right now. 
//otherwise, when the user logs in, the jwt token is stored on the frontend and whenever the user makes any request, frontend sends the token automatically. 

if(!authHeader){
    return res.status(401).json({error: 'No token provided'});
}
const token = authHeader.split(' ')[1]; //the authorization is passed like this : Bearer <token>, since we want just the token, we split on space and keep the 1st element, ignoring the 0th element because the 1st element is our token and 0th element is just "Bearer" tag. 
try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET); //this function takes header+payload from token and using the secret key, recompute the token. Then the recomputed token's third part is matched with this original token's third part. if both match, no interference. otherwise, throw error. otherwise, jwt returns decoded payload. 
    req.user = decoded; //the entire purpose of this middleware activity is 
    //1- ensure this exact token wasn't altered after our server originally signed it
    //2- to know what user is this request by: basically their user id and role or whatever is there in the payload. 
    //the middleware section is run before the actual request because this info about who is making the request is needed to run the request. so to pass the info from the middleware to the route handler, we add the user property to the req object. since route handler is able to access req object too, they will be able to access the user id and role during route handling. so req is a shared object between middleware and route handler. 
    next(); //carries on with the route handler. 
} catch(error){
    return res.status(401).json({error: 'Invalid or expired token'});
}
}

module.exports = requireAuth;