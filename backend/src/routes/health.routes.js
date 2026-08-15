const express = require("express");
const pool = require("../config/database");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "rustikcg_backend",
  });
});

router.get("/database", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT NOW() AS database_time"
    );

    res.json({
      status: "ok",
      database: "connected",
      database_time: result.rows[0].database_time,
    });
  } catch (error) {
    console.error("Erro ao conectar ao PostgreSQL:", error);

    res.status(500).json({
      status: "error",
      database: "disconnected",
    });
  }
});

module.exports = router;