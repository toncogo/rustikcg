export const env = {
  port: process.env.PORT || 8000,

  database: {
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT || 5432),
    name: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD
  },

  nodeEnv: process.env.NODE_ENV || 'development'
};