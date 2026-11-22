const jwt = require('jsonwebtoken');
const env = require('../config/env');

module.exports = function authenticate(req, res, next) {
  const token = req.cookies[env.cookieName];
  if (!token) {
    return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Faça login para continuar.' });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret, {
      algorithms: ['HS256'],
      issuer: 'rustikcg-api',
      audience: 'rustikcg-web'
    });
    if (typeof payload.sub !== 'string') throw new Error('JWT sem subject.');
    req.auth = { userId: payload.sub, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Sua sessão expirou. Entre novamente.' });
  }
};