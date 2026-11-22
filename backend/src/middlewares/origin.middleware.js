const env = require("../config/env");

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function rejectOrigin(res) {
  return res.status(403).json({
    error: "ORIGIN_REJECTED",
    message: "Origem da solicitação não permitida.",
  });
}

module.exports = function enforceSameOrigin(req, res, next) {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const originHeader = req.get("origin");
  const refererHeader = req.get("referer");
  const source = originHeader || refererHeader;

  // Para métodos que alteram dados, não aceitar origem desconhecida.
  if (!source) {
    return rejectOrigin(res);
  }

  let sourceOrigin;

  try {
    sourceOrigin = new URL(source).origin;
  } catch {
    return rejectOrigin(res);
  }

  if (sourceOrigin !== env.appOrigin) {
    return rejectOrigin(res);
  }

  return next();
};