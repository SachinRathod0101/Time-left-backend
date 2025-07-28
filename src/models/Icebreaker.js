const mongoose = require('mongoose');

const IcebreakerSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Please add a question'],
    trim: true,
    maxlength: [200, 'Question cannot be more than 200 characters']
  },
  category: {
    type: String,
    enum: ['fun', 'personal', 'professional', 'philosophical', 'other'],
    default: 'fun'
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Icebreaker', IcebreakerSchema);