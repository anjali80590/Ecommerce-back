const express = require('express');
const userController = require('../controller/authController');
const { requireAuth, requireEmailVerified } = require ('../middleware/authMiddleware')
const router = express.Router();

router.post('/register', userController.register);
router.post('/verify-email', requireAuth, userController.verifyEmail);
router.post('/login', userController.login);

module.exports = router;
