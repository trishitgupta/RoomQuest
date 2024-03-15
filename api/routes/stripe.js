
import express from "express";
const router=express.Router();
import stripe from 'stripe';
import dotenv from "dotenv";


dotenv.config()

const stripeClient = stripe(process.env.STRIPE_SECRET);

router.post('/create-payment-intent', async (req, res) => {
  try {
    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Hotel',
                description: 'Description of your product',
              },
              unit_amount: 2000, // Amount in cents (e.g., $20.00)
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: '', // Redirect URL after successful payment
        cancel_url: '', // Redirect URL if user cancels payment
      });
  
      // Redirect the user to the Stripe Checkout page
      res.redirect(303, session.url);
    } catch (error) {
      console.error('Error initiating payment:', error);
      res.status(500).send('Error initiating payment');
    }
});

export default router;