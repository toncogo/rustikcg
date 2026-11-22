const nodemailer = require('nodemailer');
const env = require('../config/env');

const transportOptions = {
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.secure,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  disableFileAccess: true,
  disableUrlAccess: true
};
if (env.smtp.user && env.smtp.pass) {
  transportOptions.auth = { user: env.smtp.user, pass: env.smtp.pass };
}
const transporter = nodemailer.createTransport(transportOptions);

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/gu, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

async function sendTokenEmail({ to, name, token, type }) {
  const verification = type === 'EMAIL_VERIFICATION';
  const subject = verification ? 'Confirme seu e-mail — RustikCG' : 'Seu código de acesso — RustikCG';
  const purpose = verification ? 'confirmar seu cadastro' : 'concluir seu acesso';
  const minutes = verification ? 15 : 10;
  const safeName = escapeHtml(name || 'Olá');
  const text = (name || 'Olá') + ', use o código ' + token + ' para ' + purpose +
    '. Ele expira em ' + minutes + ' minutos. Se você não solicitou, ignore esta mensagem.';
  const html = '<!doctype html><html lang="pt-BR"><body style="font-family:Arial,sans-serif;color:#32271f">' +
    '<h1>RustikCG</h1><p>Olá, ' + safeName + '.</p><p>Use este código para ' + purpose + ':</p>' +
    '<p style="font-size:30px;font-weight:bold;letter-spacing:8px">' + token + '</p>' +
    '<p>O código expira em ' + minutes + ' minutos. Se você não solicitou, ignore esta mensagem.</p>' +
    '</body></html>';

  await transporter.sendMail({
    from: env.smtp.from,
    to,
    subject,
    text,
    html
  });
}

module.exports = { sendTokenEmail };
