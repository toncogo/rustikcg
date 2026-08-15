// const express = require("express");
// const { Pool } = require("pg");

// const app = express();
// const PORT = 8000;

// app.use(express.json());

// const pool = new Pool({
//   host: process.env.DATABASE_HOST,
//   port: Number(process.env.DATABASE_PORT),
//   database: process.env.DATABASE_NAME,
//   user: process.env.DATABASE_USER,
//   password: process.env.DATABASE_PASSWORD,
// });

// // Teste simples do backend
// app.get("/api/health", (req, res) => {
//   res.json({
//     status: "ok",
//     service: "rustikcg_backend",
//   });
// });

// // Teste backend -> PostgreSQL
// app.get("/api/health/database", async (req, res) => {
//   try {
//     const result = await pool.query(
//       "SELECT NOW() AS database_time"
//     );

//     res.json({
//       status: "ok",
//       database: "connected",
//       database_time: result.rows[0].database_time,
//     });
//   } catch (error) {
//     console.error("Erro ao conectar ao PostgreSQL:", error);

//     res.status(500).json({
//       status: "error",
//       database: "disconnected",
//     });
//   }
// });

// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`RustikCG backend executando na porta ${PORT}`);
// });

const app = require("./app");

const PORT = 8000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`RustikCG backend executando na porta ${PORT}`);
});