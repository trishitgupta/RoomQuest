
import express from "express";
const router=express.Router();
import stripe from 'stripe';
import dotenv from "dotenv";


dotenv.config()

const stripeClient = stripe(process.env.STRIPE_SECRET);

router.post('/create-checkout-session', async (req, res) => {
  const {products}=req.body;
  
//   console.log(products)
   const price = products[0]; 
 const qnty = products[1]; 
// console.log(price)
//  console.log(quantity)


//   const lineItems = products.map((product)=>({
//     price_data:{
//         currency:"inr",
//         product_data:{
//             name:'Payment for Hotel Booking',
           
//         },
//         unit_amount:price * 100,
//     },
//      quantity:1
// }));

const lineItems = [{
  price_data: {
    currency: "inr",
    product_data: {
      name: 'Payment for Hotel Booking',
    },
    unit_amount: price * 100, // Assuming price is a property of the product
  },
  quantity: 1
}];


  const session = await stripeClient.checkout.sessions.create({

    payment_method_types:["card"],
    line_items:lineItems,
    mode:"payment",
    success_url:"http://localhost:3000/success",
    cancel_url:"http://localhost:3000/cancel",
    //customer_email: 'customer@example.com', // Provide customer email
  // billing_address_collection: 'required', // Require billing address
  // shipping_address_collection: {
  //   allowed_countries: ['US'], // Allow shipping to India
  //},
  });


  res.json({id:session.id})

  
});

export default router;