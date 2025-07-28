const { validationResult } = require('express-validator');
const Event = require('../models/Event');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;
const sendEmail = require('../utils/sendEmail');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.createEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  try {
    // Log the incoming request
    console.log('Creating event with data:', {
      ...req.body,
      description: req.body.description
        ? req.body.description.substring(0, 30) + '...'
        : 'No description',
    });

    // Validate required fields
    const requiredFields = [
      'title',
      'description',
      'eventDate',
      'revealDate',
      'location',
      'maxParticipants',
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    // Validate dates
    const eventDate = new Date(req.body.eventDate);
    const revealDate = new Date(req.body.revealDate);
    const now = new Date();

    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event date format',
      });
    }

    if (isNaN(revealDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reveal date format',
      });
    }

    if (eventDate < now) {
      return res.status(400).json({
        success: false,
        message: 'Event date must be in the future',
      });
    }

    if (revealDate > eventDate) {
      return res.status(400).json({
        success: false,
        message: 'Reveal date must be before the event date',
      });
    }

    // Prepare event data
    const eventData = {
      title: req.body.title,
      description: req.body.description,
      eventDate,
      revealDate,
      location: req.body.location,
      maxParticipants: parseInt(req.body.maxParticipants),
      createdBy: req.user.id,
    };

    // Handle image upload to Cloudinary
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'events', resource_type: 'image' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file.buffer);
      });
      eventData.imageUrl = result.secure_url;
    }

    // Create event
    const event = await Event.create(eventData);

    console.log(`Event created successfully with ID: ${event._id}`);

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (err) {
    console.error('Error creating event:', err);

    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate field value entered',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating event',
    });
  }
};

// Other controller functions unchanged
exports.getEvents = async (req, res) => {
  try {
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach((param) => delete reqQuery[param]);
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);
    let query = Event.find(JSON.parse(queryStr));

    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Event.countDocuments();

    query = query.skip(startIndex).limit(limit);
    const events = await query.populate('createdBy participants.user icebreakers');

    const pagination = {};
    if (endIndex < total) {
      pagination.next = { page: page + 1, limit };
    }
    if (startIndex > 0) {
      pagination.prev = { page: page - 1, limit };
    }

    res.status(200).json({
      success: true,
      count: events.length,
      pagination,
      data: events,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy participants.user icebreakers');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to update this event' });
    }
    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this event' });
    }
    await event.remove();
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.joinEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is already full' });
    }
    if (event.participants.some((participant) => participant.user.toString() === req.user.id)) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }
    event.participants.push({
      user: req.user.id,
      joinedAt: Date.now(),
    });
    await event.save();
    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.leaveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (!event.participants.some((participant) => participant.user.toString() === req.user.id)) {
      return res.status(400).json({ message: 'Not registered for this event' });
    }
    event.participants = event.participants.filter(
      (participant) => participant.user.toString() !== req.user.id
    );
    await event.save();
    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.approveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    event.status = 'approved';
    await event.save();

    const participants = await User.find({
      _id: { $in: event.participants.map((p) => p.user) },
    });

    for (let participant of participants) {
      await sendEmail({
        email: participant.email,
        subject: `Event Approved: ${event.title}`,
        message: `Your event ${event.title} has been approved and will take place on ${new Date(
          event.eventDate
        ).toLocaleDateString()}. Location: ${event.location}`,
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.rejectEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    event.status = 'rejected';
    await event.save();
    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};