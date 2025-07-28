// POST /api/payments/create-order

const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

exports.createOrder = async (req, res) => {
  const { eventId } = req.body;

  // Replace with dynamic event amount
  const amount = 50000; // ₹500
  const currency = 'INR';

  const options = {
    amount,
    currency,
    receipt: `receipt_order_${eventId}_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      user: {
        name: 'Sachin Rathod',
        email: 'sachin@example.com',
        phone: '9876543210',
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating Razorpay order' });
  }
};
