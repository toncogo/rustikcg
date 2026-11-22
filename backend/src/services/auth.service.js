const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const env = require('../config/env');
const HttpError = require('../utils/http-error');
const { hashToken, issueToken } = require('./token.service');
const { sendTokenEmail } = require('./email.service');

const MAX_TOKEN_ATTEMPTS = 5;
const INVALID_TOKEN_MESSAGE = 'Código inválido ou expirado.';
const ARGON2_OPTIONS = Object.freeze({
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1
});
let dummyPasswordHashPromise;

function getDummyPasswordHash() {
  if (!dummyPasswordHashPromise) {
    dummyPasswordHashPromise = argon2.hash('rustikcg-dummy-login-password', ARGON2_OPTIONS);
  }
  return dummyPasswordHashPromise;
}

async function withTransaction(work) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

async function deliverToken(message) {
  try {
    await sendTokenEmail(message);
  } catch (error) {
    console.error('Falha no envio de e-mail:', error.code || 'SMTP_ERROR');
    throw new HttpError(503, 'EMAIL_DELIVERY_FAILED', 'Não foi possível enviar o e-mail agora. Tente novamente em instantes.');
  }
}

async function register(input) {
  const passwordHash = await argon2.hash(input.password, ARGON2_OPTIONS);

  const delivery = await withTransaction(async (client) => {
    const inserted = await client.query(
      'INSERT INTO users (name, email, password_hash, phone, city, state, address, profession) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ' +
      'ON CONFLICT (email) DO NOTHING ' +
      'RETURNING id, name, email, email_verified',
      [input.name, input.email, passwordHash, input.phone, input.city, input.state, input.address, input.profession]
    );

    let user = inserted.rows[0];
    if (!user) {
      const existing = await client.query(
        'SELECT id, name, email, email_verified FROM users WHERE email = $1 FOR UPDATE',
        [input.email]
      );
      user = existing.rows[0];
    }
    if (!user || user.email_verified) return null;

    const token = await issueToken(client, user.id, 'EMAIL_VERIFICATION');
    return { to: user.email, name: user.name, token, type: 'EMAIL_VERIFICATION' };
  });

  if (delivery) await deliverToken(delivery);
}

async function login(input) {
  const result = await pool.query(
    'SELECT id, name, email, password_hash, role, email_verified FROM users WHERE email = $1',
    [input.email]
  );
  const user = result.rows[0];
  const passwordHash = user ? user.password_hash : await getDummyPasswordHash();
  const validPassword = await argon2.verify(passwordHash, input.password);
  if (!user || !validPassword) {
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'E-mail ou senha incorretos.');
  }
  if (!user.email_verified) {
    throw new HttpError(403, 'EMAIL_NOT_VERIFIED', 'Confirme seu e-mail antes de entrar. Você pode reenviar o código na tela de confirmação.');
  }

  const delivery = await withTransaction(async (client) => {
    const locked = await client.query(
      'SELECT id, name, email, email_verified FROM users WHERE id = $1 FOR UPDATE',
      [user.id]
    );
    const currentUser = locked.rows[0];
    if (!currentUser || !currentUser.email_verified) {
      throw new HttpError(403, 'EMAIL_NOT_VERIFIED', 'Confirme seu e-mail antes de entrar.');
    }
    const token = await issueToken(client, currentUser.id, 'LOGIN_OTP');
    return { to: currentUser.email, name: currentUser.name, token, type: 'LOGIN_OTP' };
  });

  await deliverToken(delivery);
}

async function consumeToken(email, type, suppliedToken) {
  return withTransaction(async (client) => {
    const userResult = await client.query(
      'SELECT id, name, email, role, email_verified FROM users WHERE email = $1 FOR UPDATE',
      [email]
    );
    const user = userResult.rows[0];
    if (!user || (type === 'LOGIN_OTP' && !user.email_verified)) return { invalid: true };

    const tokenHash = hashToken(user.id, type, suppliedToken);
    const tokenResult = await client.query(
      'SELECT id FROM auth_tokens ' +
      'WHERE user_id = $1 AND type = $2 AND token_hash = $3 ' +
      'AND used_at IS NULL AND expires_at > NOW() AND attempts < $4 ' +
      'FOR UPDATE',
      [user.id, type, tokenHash, MAX_TOKEN_ATTEMPTS]
    );

    if (!tokenResult.rows[0]) {
      await client.query(
        'UPDATE auth_tokens ' +
        'SET attempts = attempts + 1, ' +
        'used_at = CASE WHEN attempts + 1 >= $3 THEN NOW() ELSE used_at END ' +
        'WHERE user_id = $1 AND type = $2 AND used_at IS NULL ' +
        'AND expires_at > NOW() AND attempts < $3',
        [user.id, type, MAX_TOKEN_ATTEMPTS]
      );
      return { invalid: true };
    }

    await client.query(
      'UPDATE auth_tokens SET used_at = NOW() WHERE id = $1 AND used_at IS NULL',
      [tokenResult.rows[0].id]
    );
    if (type === 'EMAIL_VERIFICATION') {
      await client.query('UPDATE users SET email_verified = TRUE WHERE id = $1', [user.id]);
      user.email_verified = true;
    }
    return { invalid: false, user };
  });
}

async function verifyEmail(input) {
  const result = await consumeToken(input.email, 'EMAIL_VERIFICATION', input.token);
  if (result.invalid) {
    throw new HttpError(400, 'TOKEN_INVALID', INVALID_TOKEN_MESSAGE);
  }
}

function createSessionJwt(user) {
  return jwt.sign(
    { role: user.role },
    env.jwtSecret,
    {
      algorithm: 'HS256',
      subject: user.id,
      expiresIn: env.jwtExpiresIn,
      issuer: 'rustikcg-api',
      audience: 'rustikcg-web'
    }
  );
}

async function verifyLogin(input) {
  const result = await consumeToken(input.email, 'LOGIN_OTP', input.token);
  if (result.invalid) {
    throw new HttpError(400, 'TOKEN_INVALID', INVALID_TOKEN_MESSAGE);
  }
  return createSessionJwt(result.user);
}

async function resendToken(input) {
  const delivery = await withTransaction(async (client) => {
    const userResult = await client.query(
      'SELECT id, name, email, email_verified FROM users WHERE email = $1 FOR UPDATE',
      [input.email]
    );
    const user = userResult.rows[0];
    if (!user) return null;
    if (input.type === 'EMAIL_VERIFICATION' && user.email_verified) return null;
    if (input.type === 'LOGIN_OTP' && !user.email_verified) return null;

    const latest = await client.query(
      'SELECT id, created_at, used_at, expires_at FROM auth_tokens ' +
      'WHERE user_id = $1 AND type = $2 ORDER BY created_at DESC LIMIT 1 FOR UPDATE',
      [user.id, input.type]
    );
    const prior = latest.rows[0];

    if (input.type === 'LOGIN_OTP' &&
        (!prior || prior.used_at || new Date(prior.expires_at).getTime() <= Date.now())) {
      return null;
    }
    if (prior && new Date(prior.created_at).getTime() > Date.now() - 60 * 1000) {
      return null;
    }

    const token = await issueToken(client, user.id, input.type);
    return { to: user.email, name: user.name, token, type: input.type };
  });

  if (delivery) await deliverToken(delivery);
}

module.exports = { register, login, verifyEmail, verifyLogin, resendToken };
