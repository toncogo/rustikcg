const env = require("./config/env");
const app = require("./app");
const pool = require("./config/database");

const server = app.listen(env.port, "0.0.0.0", () => {
  console.log(`RustikCG API escutando na porta ${env.port}.`);
});

async function cleanExpiredTokens() {
  try {
    const result = await pool.query(
      "DELETE FROM auth_tokens WHERE expires_at < NOW()"
    );

    if (result.rowCount > 0) {
      console.log(`${result.rowCount} token(s) expirado(s) removido(s).`);
    }
  } catch (error) {
    // Evita registrar dados potencialmente sensíveis do erro no log.
    console.error(
      "Falha na limpeza de tokens expirados:",
      error.code || "DATABASE_ERROR"
    );
  }
}

// Executa a limpeza na inicialização e, depois, a cada hora.
cleanExpiredTokens();

const tokenCleanupTimer = setInterval(
  cleanExpiredTokens,
  60 * 60 * 1000
);

// O timer não deve impedir o encerramento do processo.
tokenCleanupTimer.unref();

let isShuttingDown = false;

async function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`Encerrando API (${signal}).`);
  clearInterval(tokenCleanupTimer);

  // Se o encerramento gracioso não terminar em 10 segundos,
  // o processo será finalizado com erro.
  const forceShutdownTimer = setTimeout(() => {
    console.error("Tempo limite excedido durante o encerramento da API.");
    process.exit(1);
  }, 10_000);

  try {
    // Para de aceitar novas conexões e aguarda as requisições em andamento.
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    await pool.end();

    clearTimeout(forceShutdownTimer);
    process.exitCode = 0;
  } catch (error) {
    clearTimeout(forceShutdownTimer);
    console.error(
      "Falha ao encerrar a API:",
      error.code || error.message || "SHUTDOWN_ERROR"
    );
    process.exitCode = 1;
  }
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));