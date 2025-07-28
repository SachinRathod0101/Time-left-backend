const express = require('express');
const { check } = require('express-validator');
const icebreakerController = require('../controllers/icebreakerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// @route   POST /api/icebreakers
// @desc    Create a new icebreaker
// @access  Private
router.post(
  '/',
  [
    protect,
    check('question', 'Question is required').not().isEmpty(),
    check('category', 'Category is required').not().isEmpty()
  ],
  icebreakerController.createIcebreaker
);

// @route   GET /api/icebreakers
// @desc    Get all icebreakers
// @access  Private
router.get('/', protect, icebreakerController.getIcebreakers);

// @route   GET /api/icebreakers/:id
// @desc    Get icebreaker by ID
// @access  Private
router.get('/:id', protect, icebreakerController.getIcebreaker);

// @route   PUT /api/icebreakers/:id
// @desc    Update icebreaker
// @access  Private (Icebreaker Creator or Admin)
router.put(
  '/:id',
  [
    protect,
    check('question', 'Question is required').optional(),
    check('category', 'Category is required').optional()
  ],
  icebreakerController.updateIcebreaker
);

// @route   DELETE /api/icebreakers/:id
// @desc    Delete icebreaker
// @access  Private (Icebreaker Creator or Admin)
router.delete('/:id', protect, icebreakerController.deleteIcebreaker);

// Event-specific icebreaker routes

// @route   POST /api/events/:eventId/icebreakers
// @desc    Add icebreaker to event
// @access  Private (Event Creator or Admin)
router.post(
  '/events/:eventId/icebreakers',
  [
    protect,
    check('icebreakerId', 'Icebreaker ID is required').not().isEmpty()
  ],
  icebreakerController.addIcebreakerToEvent
);

// @route   DELETE /api/events/:eventId/icebreakers/:icebreakerId
// @desc    Remove icebreaker from event
// @access  Private (Event Creator or Admin)
router.delete(
  '/events/:eventId/icebreakers/:icebreakerId',
  protect,
  icebreakerController.removeIcebreakerFromEvent
);

module.exports = router;