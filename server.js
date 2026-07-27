require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const app=express();

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('Connection error:', err));


const productRoutes = require('./routes/products'); //imports the router object imported from ./routes/products. This means everything written in routes/products is in productRoutes. 
app.use('/products', productRoutes); //adding this to the list of methods: function 

const categoryRoutes = require('./routes/categories');
app.use('/categories', categoryRoutes);

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running');
});