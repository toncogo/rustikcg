const authService = require('../services/auth.service');
const env = require('../config/env');
const {
  validateRegistration,
  validateLogin,
  validateEmailToken,
  validateResend
} = require('../utils/validation');

async function register(req, res) {
  await authService.register(validateRegistration(req.body));
  res.status(202).json({
    status: 'VERIFICATION_REQUIRED',
    message: 'Cadastro recebido. Se a conta ainda precisar de confirmação, enviaremos um código para o e-mail informado.'
  });
}

async function verifyEmail(req, res) {
  await authService.verifyEmail(validateEmailToken(req.body));
  res.status(200).json({ status: 'EMAIL_VERIFIED', message: 'E-mail confirmado. Você já pode entrar.' });
}

async function login(req, res) {
  await authService.login(validateLogin(req.body));
  res.status(200).json({
    status: 'OTP_REQUIRED',
    message: 'Enviamos um código de acesso para o e-mail cadastrado.'
  });
}

async function verifyLogin(req, res) {
  const sessionJwt = await authService.verifyLogin(validateEmailToken(req.body));
  res.cookie(env.cookieName, sessionJwt, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    path: '/'
  });
  res.status(200).json({ status: 'AUTHENTICATED', message: 'Acesso confirmado.' });
}

async function resendToken(req, res) {
  await authService.resendToken(validateResend(req.body));
  res.status(202).json({
    status: 'TOKEN_REQUEST_ACCEPTED',
    message: 'Se a solicitação puder ser atendida, um novo código será enviado. Aguarde pelo menos 60 segundos antes de pedir outro.'
  });
}

function logout(req, res) {
  res.clearCookie(env.cookieName, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    path: '/'
  });
  res.status(200).json({ status: 'SIGNED_OUT', message: 'Sessão encerrada.' });
}

module.exports = { register, verifyEmail, login, verifyLogin, resendToken, logout };
