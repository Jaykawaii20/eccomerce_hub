import 'dotenv/config'; // must be first — loads .env before anything else
import app from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';
import { logger } from './utils/logger';

const server = app.listen(env.PORT, () => {
  logger.info(`API server running on port ${env.PORT}`, {
    env: env.NODE_ENV,
    version: env.API_VERSION,
    url: `http://localhost:${env.PORT}/api/${env.API_VERSION}`,
  });
});

// Graceful shutdown
async function shutdown(signal: string) {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Server closed.');
    process.exit(0);
  });
  setTimeout(() => {
    logger.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10_000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason });
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { message: err.message, stack: err.stack });
  process.exit(1);
});
