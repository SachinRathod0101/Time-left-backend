const express = require('express');
const { check, validationResult } = require('express-validator');
const multer = require('multer');
const eventController = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (validTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, or GIF images are allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

// @route   POST /api/events
// @desc    Create a new event
// @access  Private (Authenticated users)
router.post(
  '/',
  [
    protect,
    upload.single('image'),
    check('title', 'Title is required')
      .not()
      .isEmpty()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Title cannot be more than 100 characters'),
    check('description', 'Description is required')
      .not()
      .isEmpty()
      .isLength({ max: 1000 })
      .withMessage('Description cannot be more than 1000 characters'),
    check('eventDate', 'Event date is required')
      .not()
      .isEmpty()
      .custom((value) => {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid event date format');
        }
        return true;
      }),
    check('revealDate', 'Reveal date is required')
      .not()
      .isEmpty()
      .custom((value) => {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid reveal date format');
        }
        return true;
      }),
    check('location', 'Location is required').not().isEmpty().trim(),
    check('maxParticipants', 'Maximum participants is required')
      .isNumeric()
      .custom((value) => {
        const num = parseInt(value);
        if (num < 2) {
          throw new Error('At least 2 participants are required');
        }
        if (num > 100) {
          throw new Error('Maximum 100 participants allowed');
        }
        return true;
      })
  ],
  eventController.createEvent
);

// Other routes unchanged
router.get('/', protect, eventController.getEvents);
router.get('/:id', protect, eventController.getEvent);
router.put(
  '/:id',
  [
    protect,
    check('title').optional(),
    check('description').optional(),
    check('eventDate').optional(),
    check('revealDate').optional(),
    check('location').optional(),
    check('maxParticipants').optional().isNumeric(),
  ],
  eventController.updateEvent
);
router.delete('/:id', protect, eventController.deleteEvent);
router.put('/:id/join', protect, eventController.joinEvent);
router.put('/:id/leave', protect, eventController.leaveEvent);
router.put('/:id/approve', [protect, authorize('admin')], eventController.approveEvent);
router.put('/:id/reject', [protect, authorize('admin')], eventController.rejectEvent);

module.exports = router;