import { app } from './app';
import { env } from './config/env';
import { disconnectPrisma, prisma } from './config/prisma';

async function startServer(): Promise<void> {
  await prisma.$connect();

  const server = app.listen(env.PORT, () => {
    console.info(
      `[LUNAR API] Listening on http://localhost:${env.PORT} (${env.NODE_ENV}) | DB connected`
    );
  });

  const shutdown = async (signal: string) => {
    console.info(`[LUNAR API] Received ${signal}, shutting down...`);
    server.close(async () => {
      await disconnectPrisma();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

startServer().catch(async (err) => {
  console.error('[LUNAR API] Failed to start server:', err);
  await disconnectPrisma();
  process.exit(1);
});
