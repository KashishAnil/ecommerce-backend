function total_price(items){ //this should be an array of items objects because i am accessing item.product.price. 
const total = items.reduce((sum, item)=>{
    return sum + (item.product.price * item.quantity) 
},0);
return Math.round(total * 100) / 100;
}
module.exports = total_price;
