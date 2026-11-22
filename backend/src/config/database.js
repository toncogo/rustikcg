const { Pool } = require("pg");
const env = require("./env");

const pool = new Pool({
  host: env.database.host,
  port: env.database.port,
  database: env.database.name,
  user: env.database.user,
  password: env.database.password,
  ssl: env.database.ssl
    ? { rejectUnauthorized: true }
    : false,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on("error", (error) => {
  console.error(
    "Erro inesperado em conexão ociosa do PostgreSQL:",
    error.code || "DATABASE_ERROR"
  );
});

module.exports = pool;