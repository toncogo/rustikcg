const HttpError = require('./http-error');

const REGISTRATION_FIELDS = new Set([
  'name', 'email', 'password', 'phone', 'city', 'state', 'address', 'profession'
]);
const PROFILE_FIELDS = new Set([
  'name', 'phone', 'city', 'state', 'address', 'profession', 'avatar_url'
]);

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function rejectUnknown(body, allowed) {
  for (const key of Object.keys(body)) {
    if (!allowed.has(key)) {
      throw new HttpError(400, 'VALIDATION_ERROR', 'Há campos não permitidos na solicitação.');
    }
  }
}

function cleanText(value, field, min, max, errors, pattern) {
  if (typeof value !== 'string') {
    errors[field] = 'Este campo é obrigatório.';
    return '';
  }
  const clean = value.normalize('NFC').trim().replace(/\s+/gu, ' ');
  if (clean.length < min || clean.length > max || /\p{C}/u.test(clean)) {
    errors[field] = 'Informe um valor entre ' + min + ' e ' + max + ' caracteres.';
    return clean;
  }
  if (pattern && !pattern.test(clean)) {
    errors[field] = 'O formato informado não é válido.';
  }
  return clean;
}

function normalizeEmail(value, errors) {
  if (typeof value !== 'string') {
    errors.email = 'Informe um e-mail válido.';
    return '';
  }
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(email)) {
    errors.email = 'Informe um e-mail válido.';
  }
  return email;
}

function finish(errors, value) {
  if (Object.keys(errors).length) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Revise os campos destacados.', { fields: errors });
  }
  return value;
}

function requireBody(body) {
  if (!isRecord(body)) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'O corpo da solicitação precisa ser um objeto JSON.');
  }
}

function validateRegistration(body) {
  requireBody(body);
  rejectUnknown(body, REGISTRATION_FIELDS);
  const errors = {};
  const value = {
    name: cleanText(body.name, 'name', 2, 100, errors, /^[\p{L}\p{M}\s.'’-]+$/u),
    email: normalizeEmail(body.email, errors),
    phone: cleanText(body.phone, 'phone', 8, 30, errors, /^\+?[0-9\s().-]+$/u),
    city: cleanText(body.city, 'city', 2, 100, errors),
    state: typeof body.state === 'string' ? body.state.trim().toUpperCase() : '',
    address: cleanText(body.address, 'address', 5, 300, errors),
    profession: cleanText(body.profession, 'profession', 2, 100, errors),
    password: typeof body.password === 'string' ? body.password : ''
  };

  if (!/^[A-Z]{2}$/u.test(value.state)) {
    errors.state = 'Informe a sigla do estado com duas letras.';
  }
  if (typeof body.password !== 'string' || body.password.length < 12 || body.password.length > 128 ||
      !/[a-z]/u.test(body.password) || !/[A-Z]/u.test(body.password) ||
      !/[0-9]/u.test(body.password) || !/[^A-Za-z0-9]/u.test(body.password)) {
    errors.password = 'Use de 12 a 128 caracteres, incluindo maiúscula, minúscula, número e símbolo.';
  }
  return finish(errors, value);
}

function validateLogin(body) {
  requireBody(body);
  rejectUnknown(body, new Set(['email', 'password']));
  const errors = {};
  const value = {
    email: normalizeEmail(body.email, errors),
    password: typeof body.password === 'string' ? body.password : ''
  };
  if (!value.password || value.password.length > 128) {
    errors.password = 'Informe uma senha válida.';
  }
  return finish(errors, value);
}

function validateEmailToken(body) {
  requireBody(body);
  rejectUnknown(body, new Set(['email', 'token']));
  const errors = {};
  const value = {
    email: normalizeEmail(body.email, errors),
    token: typeof body.token === 'string' ? body.token.trim() : ''
  };
  if (!/^[0-9]{6}$/u.test(value.token)) {
    errors.token = 'Informe o código de seis dígitos recebido por e-mail.';
  }
  return finish(errors, value);
}

function validateResend(body) {
  requireBody(body);
  rejectUnknown(body, new Set(['email', 'type']));
  const errors = {};
  const value = {
    email: normalizeEmail(body.email, errors),
    type: typeof body.type === 'string' ? body.type : ''
  };
  if (!['EMAIL_VERIFICATION', 'LOGIN_OTP'].includes(value.type)) {
    errors.type = 'Tipo de token inválido.';
  }
  return finish(errors, value);
}

function validateProfile(body) {
  requireBody(body);
  rejectUnknown(body, PROFILE_FIELDS);
  const errors = {};
  const value = {};

  if (Object.keys(body).length === 0) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Informe ao menos um campo para atualizar.');
  }
  if ('name' in body) value.name = cleanText(body.name, 'name', 2, 100, errors, /^[\p{L}\p{M}\s.'’-]+$/u);
  if ('phone' in body) value.phone = cleanText(body.phone, 'phone', 8, 30, errors, /^\+?[0-9\s().-]+$/u);
  if ('city' in body) value.city = cleanText(body.city, 'city', 2, 100, errors);
  if ('state' in body) {
    value.state = typeof body.state === 'string' ? body.state.trim().toUpperCase() : '';
    if (!/^[A-Z]{2}$/u.test(value.state)) errors.state = 'Informe a sigla do estado com duas letras.';
  }
  if ('address' in body) value.address = cleanText(body.address, 'address', 5, 300, errors);
  if ('profession' in body) value.profession = cleanText(body.profession, 'profession', 2, 100, errors);
  if ('avatar_url' in body) {
    const raw = body.avatar_url;
    if (raw === null || raw === '') {
      value.avatar_url = null;
    } else if (typeof raw !== 'string' || raw.length > 2048) {
      errors.avatar_url = 'Informe uma URL de imagem válida.';
    } else {
      try {
        const url = new URL(raw.trim());
        if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
          throw new Error('URL não permitida.');
        }
        value.avatar_url = url.toString();
      } catch {
        errors.avatar_url = 'Informe uma URL HTTP ou HTTPS válida.';
      }
    }
  }
  return finish(errors, value);
}

module.exports = {
  validateRegistration,
  validateLogin,
  validateEmailToken,
  validateResend,
  validateProfile
};
