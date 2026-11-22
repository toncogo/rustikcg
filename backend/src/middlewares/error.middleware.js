const HttpError = require('../utils/http-error');

function notFound(req, res) {
  res.status(404).json({ error: 'NOT_FOUND', message: 'Rota não encontrada.' });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ error: 'INVALID_JSON', message: 'O corpo da solicitação não contém JSON válido.' });
  }

  const status = error instanceof HttpError ? error.status : 500;

  const code = error instanceof HttpError ? error.code : 'INTERNAL_ERROR';

  const message = status >= 500 ? 'Ocorreu um erro interno. Tente novamente.' : error.message;
  
  if (status >= 500) {
    console.error('Erro na API:', error.code || error.name || 'INTERNAL_ERROR');
  }
  return res.status(status).json({
    error: code,
    message,
    ...(error instanceof HttpError && error.details ? { details: error.details } : {})
  });
}

module.exports = { notFound, errorHandler };