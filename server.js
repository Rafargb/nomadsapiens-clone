import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

// Use the environment variable if present, otherwise use a placeholder test key
// To get your real test key, go to Stripe Dashboard -> Developers -> API Keys
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51MockSecretKeyChangeMe123456');

const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { courseId, price } = req.body;
    
    // In a real application, you would fetch the course from your database 
    // to ensure the user hasn't tampered with the price in the frontend.
    // Here we trust the incoming price for demonstration, or default to $67 (6700 cents).
    
    let amount = 6700; 
    
    // Convert string price like "$67" to 6700 integer cents
    if (price && typeof price === 'string') {
        const numericStr = price.replace(/[^0-9]/g, '');
        if (numericStr) {
            amount = parseInt(numericStr) * 100;
        }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).send({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Node backend listening on port ${PORT}!`));
