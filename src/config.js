// Enter your Discord application values below.
// Keep this file private and never commit real credentials to a public repository.
const config = {
  discordToken: "PASTE_DISCORD_BOT_TOKEN_HERE",
  discordClientId: "PASTE_DISCORD_CLIENT_ID_HERE",
  port: 5000,
};

export function getConfig() {
  if (
    !config.discordToken ||
    config.discordToken === "PASTE_DISCORD_BOT_TOKEN_HERE"
  ) {
    throw new Error("Add your Discord bot token to src/config.js.");
  }
  if (
    !config.discordClientId ||
    config.discordClientId === "PASTE_DISCORD_CLIENT_ID_HERE"
  ) {
    throw new Error("Add your Discord client ID to src/config.js.");
  }
  if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {
    throw new Error("The configured port must be a valid TCP port.");
  }
  return config;
}