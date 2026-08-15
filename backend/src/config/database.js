import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

export const pool = new Pool({
  host: env.database.host,
  port: env.database.port,
  database: env.database.name,
  user: env.database.user,
  password: env.database.password,

  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

module.exports = pool;