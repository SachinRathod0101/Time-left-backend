const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const icebreakersRoutes = require('./routes/icebreakerRoutes');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// Middleware
// तुमच्या Render Environment Variables मध्ये FRONTEND_URL सेट केल्याची खात्री करा.
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// Connect to MongoDB
// useNewUrlParser आणि useUnifiedTopology हे पर्याय काढले आहेत कारण ते आता आवश्यक नाहीत.
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/icebreakers', icebreakersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('TimeLeft API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
