const express = require("express");
const healthRoutes = require("./routes/health.routes");

const app = express();

app.use(express.json());

app.use("/api/health", healthRoutes);

module.exports = app;