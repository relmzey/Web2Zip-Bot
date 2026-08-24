import { Client, Collection, GatewayIntentBits, REST, Routes } from "discord.js";
import { commandDefinitions, handleCommand } from "./commands.js";
import { logger } from "../logger.js";

export async function createDiscordClient(config) {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  client.commands = new Collection();
  client.once("clientReady", (readyClient) => logger.info({ user: readyClient.user.tag }, "Discord bot is ready"));
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    try {
      await handleCommand(interaction);
    } catch (error) {
      logger.error({ err: error, command: interaction.commandName }, "Command failed");
      const response = { content: "Something went wrong while handling that command." };
      if (interaction.deferred || interaction.replied) await interaction.editReply(response);
      else await interaction.reply(response);
    }
  });

  const rest = new REST({ version: "10" }).setToken(config.discordToken);
  await rest.put(Routes.applicationCommands(config.discordClientId), {
    body: commandDefinitions.map((command) => command.toJSON()),
  });
  await client.login(config.discordToken);
  return client;
}