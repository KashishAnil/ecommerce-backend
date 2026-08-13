const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app=express();
const https = require("https");
const http = require("http");
const env = process.env.NODE_ENV || "development";
const credentials = require('./ssl');

require("dotenv").config(
  { path: `.env.${env}` }
);
const {NODE_ENV}=process.env

app.use(cors()); //allowing this enables different websites/ports to talk to each other. backend and frontend live on different ports. By default, ports cannot talk with other ports. Only when you allow cors

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('Connection error:', err));

app.use((req, res, next) => {
  if (req.originalUrl === '/payments/webhook') {
    next(); // skip JSON parsing for this one route
  } else {
    express.json()(req, res, next);
  }
});

//mounting paths on server
const productRoutes = require('./routes/products'); //imports the router object imported from ./routes/products. This means everything written in routes/products is in productRoutes. 
app.use('/products', productRoutes); //adding this to the list of methods: function 

const categoryRoutes = require('./routes/categories');
app.use('/categories', categoryRoutes);

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const cartRoutes = require('./routes/cart');
app.use('/cart', cartRoutes);

const orderRoutes = require('./routes/orders');
app.use('/orders', orderRoutes);

const paymentsRoutes = require('./routes/payments');

app.use('/payments', paymentsRoutes);

app.use(express.json());

var httpsServer;
if (NODE_ENV === "customdev") httpsServer = https.createServer(credentials, app);
else httpsServer = http.createServer(app);

httpsServer.listen(process.env.PORT || 3000, () => {
  console.log('Server is running');
});