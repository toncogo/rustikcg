const express = require("express");
const pool = require("../config/database");

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "rustikcg_backend",
  });
});

router.get("/database", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT NOW() AS database_time"
    );

    res.status(200).json({
      status: "ok",
      database: "connected",
      database_time: result.rows[0].database_time,
    });
  } catch (error) {
    console.error(
      "Erro ao conectar ao PostgreSQL:",
      error.code || "DATABASE_ERROR"
    );

    next(error);
  }
});

module.exports = router;