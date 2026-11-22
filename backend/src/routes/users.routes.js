const express = require('express');
const asyncHandler = require('../utils/async-handler');
const authenticate = require('../middlewares/auth.middleware');
const usersController = require('../controllers/users.controller');
const { profileLimiter } = require('../middlewares/rate-limit.middleware');

const router = express.Router();

router.use(authenticate);
router.get('/me', asyncHandler(usersController.getMe));
router.put('/me', profileLimiter, asyncHandler(usersController.updateMe));

module.exports = router;
