require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const app=express();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('Connection error:', err));

app.get('/products', (req,res)=>{
res.send('here are the products');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running');
});