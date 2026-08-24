import { AttachmentBuilder, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { cloneWebsite, removeArchive } from "../services/website-cloner.js";

export const commandDefinitions = [
  new SlashCommandBuilder()
    .setName("clone")
    .setDescription("Package a public website front-end into a ZIP archive")
    .addStringOption((option) => option.setName("url").setDescription("Public website URL").setRequired(true)),
  new SlashCommandBuilder().setName("help").setDescription("Show Web2Zip Bot usage and limits"),
  new SlashCommandBuilder().setName("about").setDescription("Show information about Web2Zip Bot"),
];

function createEmbed(interaction, description) {
  return new EmbedBuilder()
    .setColor(0xffffff)
    .setTitle("Web2Zip Bot")
    .setAuthor({
      name: interaction.user.username,
      iconURL: interaction.user.displayAvatarURL({ extension: "png", size: 64 }),
    })
    .setDescription(description);
}

const helpDescription = [
  "-# Use `/clone url:https://example.com` to package a public website front-end into a ZIP.",
  "",
  "**Included**",
  "> HTML, CSS, JavaScript, images, fonts, and rewritten local asset paths.",
  "",
  "**Limits**",
  "> - Public HTTP(S) websites only",
  "> - Up to **80 assets**",
  "> - Supports **Discord-sized ZIP files**",
  "",
  "**Not Included**",
  "> - Logins or private content",
  "> - Server-side code or databases",
  "> - Payment systems",
  "> - Paywall bypasses",
].join("\n");

export async function handleCommand(interaction) {
  if (interaction.commandName === "help") {
    return interaction.reply({ embeds: [createEmbed(interaction, helpDescription)] });
  }
  if (interaction.commandName === "about") {
    return interaction.reply({
      embeds: [
        createEmbed(
          interaction,
          "-# A focused public website front-end packager for Discord.",
        ),
      ],
    });
  }
  if (interaction.commandName !== "clone") return;

  await interaction.deferReply();
  const url = interaction.options.getString("url", true);
  let archivePath;
  try {
    const result = await cloneWebsite(url, (message) => {
      const isFetching = message.toLowerCase().startsWith("fetching");
      return interaction.editReply({
        embeds: [
          createEmbed(
            interaction,
            isFetching
              ? "> fetching the page and discovering public assets...\n-# this may take few minutes please wait!"
              : `> ${message.toLowerCase()}\n-# this may take few minutes please wait!`,
          ),
        ],
      });
    });
    archivePath = result.archivePath;
    await interaction.editReply({
      embeds: [
        createEmbed(
          interaction,
          "> fetched the page and discovered public assets... (the zip file is attached above!)",
        ),
      ],
      files: [new AttachmentBuilder(archivePath, { name: result.archiveName })],
    });
  } catch (error) {
    await interaction.editReply({
      embeds: [createEmbed(interaction, `> I couldn't clone that site: ${error.message || "unknown error"}`)],
    });
  } finally {
    if (archivePath) await removeArchive(archivePath);
  }
}