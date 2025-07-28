const express = require('express');
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('city', 'City is optional').optional(),
  ],
  userController.registerUser
);

router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  userController.loginUser
);

router.get('/me', protect, userController.getMe);

router.put(
  '/me',
  [
    protect,
    check('name', 'Name is required').optional(),
    check('email', 'Please include a valid email').optional().isEmail(),
    check('password', 'Please enter a password with 6 or more characters').optional().isLength({ min: 6 }),
    check('city', 'City is optional').optional(),
  ],
  userController.updateProfile
);

router.get('/', [protect, authorize('admin')], userController.getUsers);

router.get('/:id', [protect, authorize('admin')], userController.getUser);

module.exports = router;