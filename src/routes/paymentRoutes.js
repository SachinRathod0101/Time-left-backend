const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const { createOrder } = require('../controllers/createOrder');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

router.post('/create-order', async (req, res) => {
  const { eventId } = req.body;

  const options = {
    amount: 50000, // ₹500 in paisa
    currency: 'INR',
    receipt: `receipt_${eventId}_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error('Razorpay error:', err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
