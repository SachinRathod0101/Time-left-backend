const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  eventDate: {
    type: Date,
    required: [true, 'Please add an event date']
  },
  revealDate: {
    type: Date,
    required: [true, 'Please add a reveal date']
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  maxParticipants: {
    type: Number,
    required: [true, 'Please add maximum number of participants'],
    default: 6
  },
  imageUrl: {
    type: String,
    required: false // Optional image URL from Cloudinary
  },
  participants: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
      },
      joinedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  icebreakers: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Icebreaker'
    }
  ],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Cascade delete participants when an event is deleted
EventSchema.pre('remove', async function(next) {
  console.log(`Participants being removed from event ${this._id}`);
  next();
});

module.exports = mongoose.model('Event', EventSchema);