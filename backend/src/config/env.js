require("dotenv").config();

function required(name, value) {
  if (!value || !String(value).trim()) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }

  return String(value).trim();
}

const jwtSecret = required("JWT_SECRET", process.env.JWT_SECRET);
const tokenPepper = required("TOKEN_PEPPER", process.env.TOKEN_PEPPER);

if (jwtSecret.length < 32 || tokenPepper.length < 32) {
  throw new Error(
    "JWT_SECRET e TOKEN_PEPPER devem ter pelo menos 32 caracteres."
  );
}

const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "1h";

if (!/^[1-9][0-9]*(s|m|h|d)$/u.test(jwtExpiresIn)) {
  throw new Error(
    "JWT_EXPIRES_IN deve ser um inteiro seguido por s, m, h ou d (ex.: 1h)."
  );
}

const appOrigin = required("APP_ORIGIN", process.env.APP_ORIGIN);
let parsedOrigin;

try {
  parsedOrigin = new URL(appOrigin);
} catch {
  throw new Error("APP_ORIGIN precisa ser uma URL válida.");
}

if (parsedOrigin.origin !== appOrigin.replace(/\/$/, "")) {
  throw new Error("APP_ORIGIN deve conter somente a origem, sem caminho.");
}

const smtpPort = Number(process.env.SMTP_PORT || 1025);

if (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
  throw new Error("SMTP_PORT precisa ser uma porta válida.");
}

const smtpUser = process.env.SMTP_USER || "";
const smtpPass = process.env.SMTP_PASS || "";

if (Boolean(smtpUser) !== Boolean(smtpPass)) {
  throw new Error("SMTP_USER e SMTP_PASS devem ser configurados juntos.");
}

const database = Object.freeze({
  host: process.env.DATABASE_HOST || process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DATABASE_PORT || process.env.DB_PORT || 5432),
  name: process.env.DATABASE_NAME || process.env.DB_NAME || "rustikcg",
  user: process.env.DATABASE_USER || process.env.DB_USER || "rustikcg",
  password: required(
    "DATABASE_PASSWORD ou DB_PASSWORD",
    process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD
  ),
  ssl: (process.env.DB_SSL || process.env.DATABASE_SSL) === "true",
});

const smtp = Object.freeze({
  host: process.env.SMTP_HOST || "127.0.0.1",
  port: smtpPort,
  secure: process.env.SMTP_SECURE === "true",
  user: smtpUser,
  pass: smtpPass,
  from: required("SMTP_FROM", process.env.SMTP_FROM),
});

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 8000),
  appOrigin,
  jwtSecret,
  jwtExpiresIn,
  tokenPepper,
  cookieName: process.env.AUTH_COOKIE_NAME || "rustikcg_session",

  // `database` mantém compatibilidade com a configuração atual do projeto.
  database,

  // `db` atende aos módulos que usam o formato do arquivo enviado.
  db: database,

  smtp,
};

module.exports = Object.freeze(env);