const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 characters'),
    body('role').optional().isIn(['user', 'artist']).withMessage('Invalid role')
  ],
  authController.register
);
router.post('/login', authController.login);
router.get('/me', protect, authController.me);

module.exports = router;
