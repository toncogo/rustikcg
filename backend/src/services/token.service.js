const crypto = require('node:crypto');
const env = require('../config/env');

const TOKEN_SETTINGS = Object.freeze({
  EMAIL_VERIFICATION: '15 minutes',
  LOGIN_OTP: '10 minutes'
});

function hashToken(userId, type, token) {
  return crypto
    .createHmac('sha256', env.tokenPepper)
    .update(userId + ':' + type + ':' + token, 'utf8')
    .digest('hex');
}

async function issueToken(client, userId, type) {
  const interval = TOKEN_SETTINGS[type];
  if (!interval) throw new Error('Tipo de token não suportado.');

  const token = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  const tokenHash = hashToken(userId, type, token);

  await client.query(
    'UPDATE auth_tokens SET used_at = COALESCE(used_at, NOW()) WHERE user_id = $1 AND type = $2 AND used_at IS NULL',
    [userId, type]
  );
  await client.query(
    'INSERT INTO auth_tokens (user_id, token_hash, type, expires_at) VALUES ($1, $2, $3, NOW() + $4::INTERVAL)',
    [userId, tokenHash, type, interval]
  );

  return token;
}

module.exports = { hashToken, issueToken };
