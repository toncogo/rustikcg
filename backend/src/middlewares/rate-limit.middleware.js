const rateLimit = require('express-rate-limit');

const isRateLimitDisabled =
  process.env.NODE_ENV !== 'production' ||
  process.env.DISABLE_RATE_LIMIT === 'true';

function authRateLimit(max, windowMs) {
  return rateLimit({
    windowMs,
    limit: max,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: () => isRateLimitDisabled,
    handler(req, res) {
      res.status(429).json({
        error: 'TOO_MANY_REQUESTS',
        message: 'Muitas tentativas. Aguarde antes de tentar novamente.'
      });
    }
  });
}

module.exports = {
  registrationLimiter: authRateLimit(5, 60 * 60 * 1000),
  loginLimiter: authRateLimit(10, 15 * 60 * 1000),
  tokenLimiter: authRateLimit(10, 15 * 60 * 1000),
  logoutLimiter: authRateLimit(30, 15 * 60 * 1000),
  profileLimiter: authRateLimit(30, 15 * 60 * 1000)
};
