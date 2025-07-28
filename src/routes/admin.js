const express = require('express');
const router = express.Router();
const { loginAdmin } = require('../controllers/adminController');

// @route   POST /api/admin/login
// @desc    Admin Login
// @access  Public
router.post('/login', loginAdmin);

module.exports = router;
