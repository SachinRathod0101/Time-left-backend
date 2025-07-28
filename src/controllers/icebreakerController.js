const Icebreaker = require('../models/Icebreaker');
const Event = require('../models/Event');
const { validationResult } = require('express-validator');

// @desc    Create new icebreaker
// @route   POST /api/icebreakers
// @access  Private
exports.createIcebreaker = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    // Create icebreaker
    const icebreaker = await Icebreaker.create(req.body);

    res.status(201).json({
      success: true,
      data: icebreaker
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all icebreakers
// @route   GET /api/icebreakers
// @access  Private
exports.getIcebreakers = async (req, res) => {
  try {
    const icebreakers = await Icebreaker.find();

    res.status(200).json({
      success: true,
      count: icebreakers.length,
      data: icebreakers
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single icebreaker
// @route   GET /api/icebreakers/:id
// @access  Private
exports.getIcebreaker = async (req, res) => {
  try {
    const icebreaker = await Icebreaker.findById(req.params.id);

    if (!icebreaker) {
      return res.status(404).json({ message: 'Icebreaker not found' });
    }

    res.status(200).json({
      success: true,
      data: icebreaker
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update icebreaker
// @route   PUT /api/icebreakers/:id
// @access  Private
exports.updateIcebreaker = async (req, res) => {
  try {
    let icebreaker = await Icebreaker.findById(req.params.id);

    if (!icebreaker) {
      return res.status(404).json({ message: 'Icebreaker not found' });
    }

    // Make sure user is icebreaker owner or admin
    if (
      icebreaker.createdBy &&
      icebreaker.createdBy.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({ message: 'Not authorized to update this icebreaker' });
    }

    icebreaker = await Icebreaker.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: icebreaker
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete icebreaker
// @route   DELETE /api/icebreakers/:id
// @access  Private
exports.deleteIcebreaker = async (req, res) => {
  try {
    const icebreaker = await Icebreaker.findById(req.params.id);

    if (!icebreaker) {
      return res.status(404).json({ message: 'Icebreaker not found' });
    }

    // Make sure user is icebreaker owner or admin
    if (
      icebreaker.createdBy &&
      icebreaker.createdBy.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({ message: 'Not authorized to delete this icebreaker' });
    }

    await icebreaker.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add icebreaker to event
// @route   POST /api/events/:eventId/icebreakers
// @access  Private
exports.addIcebreakerToEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    const icebreaker = await Icebreaker.findById(req.body.icebreakerId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!icebreaker) {
      return res.status(404).json({ message: 'Icebreaker not found' });
    }

    // Make sure user is event owner or admin
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to add icebreakers to this event' });
    }

    // Check if icebreaker is already added
    if (event.icebreakers.includes(req.body.icebreakerId)) {
      return res.status(400).json({ message: 'Icebreaker already added to this event' });
    }

    event.icebreakers.push(req.body.icebreakerId);
    await event.save();

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove icebreaker from event
// @route   DELETE /api/events/:eventId/icebreakers/:icebreakerId
// @access  Private
exports.removeIcebreakerFromEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Make sure user is event owner or admin
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to remove icebreakers from this event' });
    }

    // Check if icebreaker exists in event
    if (!event.icebreakers.includes(req.params.icebreakerId)) {
      return res.status(400).json({ message: 'Icebreaker not found in this event' });
    }

    event.icebreakers = event.icebreakers.filter(
      icebreaker => icebreaker.toString() !== req.params.icebreakerId
    );

    await event.save();

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};