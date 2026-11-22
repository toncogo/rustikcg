const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/users.routes");

const enforceSameOrigin = require("./middlewares/origin.middleware");
const {
    notFound,
    errorHandler,
} = require("./middlewares/error.middleware");

const app = express();

app.disable("x-powered-by");

// Configure trust proxy apenas se o acesso externo à API passar pelo Nginx.
app.set("trust proxy", 1);

app.use(helmet({ contentSecurityPolicy: false}));
app.use(express.json({ limit: "16kb", strict: true }));
app.use(cookieParser());

// Mantém GET /api/health e GET /api/health/database existentes.
app.use("/api/health", healthRoutes);

// Protege as rotas da API contra requisições de outra origem.
app.use("/api/auth", enforceSameOrigin, authRoutes);
app.use("/api/users", enforceSameOrigin, userRoutes);

// Tratamento de rotas inexistentes e erros deve vir por último.
app.use(notFound);
app.use(errorHandler);

module.exports = app;