const pool = require('../config/database');
const { validateProfile } = require('../utils/validation');
const HttpError = require('../utils/http-error');

const PUBLIC_USER_COLUMNS =
  'id, name, email, phone, city, state, address, profession, avatar_url, role, email_verified, created_at, updated_at';
const PROFILE_COLUMN_MAP = Object.freeze({
  name: 'name',
  phone: 'phone',
  city: 'city',
  state: 'state',
  address: 'address',
  profession: 'profession',
  avatar_url: 'avatar_url'
});

async function getMe(req, res) {
  const result = await pool.query(
    'SELECT ' + PUBLIC_USER_COLUMNS + ' FROM users WHERE id = $1',
    [req.auth.userId]
  );
  if (!result.rows[0]) {
    throw new HttpError(401, 'UNAUTHENTICATED', 'Faça login para continuar.');
  }
  res.status(200).json({ user: result.rows[0] });
}

async function updateMe(req, res) {
  const profile = validateProfile(req.body);
  const entries = Object.entries(profile);
  const assignments = entries.map(([key], index) =>
    PROFILE_COLUMN_MAP[key] + ' = $' + (index + 1)
  );
  const values = entries.map(([, value]) => value);
  values.push(req.auth.userId);

  const result = await pool.query(
    'UPDATE users SET ' + assignments.join(', ') + ', updated_at = NOW() WHERE id = $' + values.length +
    ' RETURNING ' + PUBLIC_USER_COLUMNS,
    values
  );
  if (!result.rows[0]) {
    throw new HttpError(401, 'UNAUTHENTICATED', 'Faça login para continuar.');
  }
  res.status(200).json({ user: result.rows[0], message: 'Perfil atualizado.' });
}

module.exports = { getMe, updateMe };
