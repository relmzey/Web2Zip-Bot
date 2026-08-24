import { createDiscordClient } from "./bot/create-client.js";
import { getConfig } from "./config.js";
import { logger } from "./logger.js";
import { createServer } from "./server.js";

async function main() {
  const config = getConfig();
  const server = createServer().listen(config.port, () => {
    logger.info({ port: config.port }, "Health server listening");
  });

  try {
    await createDiscordClient(config);
  } catch (error) {
    server.close();
    logger.fatal({ err: error }, "Discord bot failed to start");
    process.exitCode = 1;
  }
}

main().catch((error) => {
  logger.fatal({ err: error }, "Application failed to start");
  process.exitCode = 1;
});