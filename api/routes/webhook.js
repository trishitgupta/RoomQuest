import express from 'express';
import { Stripe } from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET, {
  apiVersion: '2020-08-27', // Specify Stripe API version
});

router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.sendStatus(400);
  }

  // Handle specific event types
  switch (event.type) {
    case 'checkout.session.completed':
      // Payment successful, handle further processing
      const session = event.data.object;
      console.log('Payment successful:', session);
      // Update database or trigger other actions
      break;
    case 'payment_intent.payment_failed':
      // Payment failed, handle accordingly
      console.log('Payment failed:', event);
      break;
    default:
      // Handle other event types if needed
      console.log('Received event:', event);
  }

  res.sendStatus(200);
});

export default router;
