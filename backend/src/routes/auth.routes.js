const express = require('express');
const asyncHandler = require('../utils/async-handler');
const authController = require('../controllers/auth.controller');
const {
  registrationLimiter,
  loginLimiter,
  tokenLimiter,
  logoutLimiter
} = require('../middlewares/rate-limit.middleware');

const router = express.Router();

router.post('/register', registrationLimiter, asyncHandler(authController.register));
router.post('/verify-email', tokenLimiter, asyncHandler(authController.verifyEmail));
router.post('/login', loginLimiter, asyncHandler(authController.login));
router.post('/verify-login', tokenLimiter, asyncHandler(authController.verifyLogin));
router.post('/resend-token', tokenLimiter, asyncHandler(authController.resendToken));
router.post('/logout', logoutLimiter, asyncHandler(authController.logout));

module.exports = router;
