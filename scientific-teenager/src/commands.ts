import {
  ApplicationCommandType,
  ApplicationIntegrationType,
  ChannelType,
  ContextMenuCommandBuilder,
  InteractionContextType,
  PermissionFlagsBits,
  REST,
  Routes,
  SlashCommandBuilder
} from "discord.js";
import { requireSnowflake } from "./discord-config.js";

const guildCommand = <T extends SlashCommandBuilder>(command: T) => command
  .setContexts(InteractionContextType.Guild)
  .setIntegrationTypes(ApplicationIntegrationType.GuildInstall);

export const scienceCommand = guildCommand(new SlashCommandBuilder()
  .setName("science")
  .setDescription("Enable Scientific Teenager announcements in this channel")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild));

export const relayCommand = guildCommand(new SlashCommandBuilder()
  .setName("relay")
  .setDescription("OpenRockets HQ controls for The Scientific Teenager")
  .addSubcommand(sc =>
    sc.setName("setup")
      .setDescription("Configure a public destination channel")
      .addChannelOption(o =>
        o.setName("channel")
          .setDescription("Destination channel; defaults to the current channel")
          .setRequired(false)
          .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
      )
  )
  .addSubcommand(sc => sc.setName("status").setDescription("Show this server's configuration"))
  .addSubcommand(sc => sc.setName("doctor").setDescription("Run a permission/configuration self-check"))
  .addSubcommand(sc => sc.setName("disable").setDescription("Stop Scientific Teenager posts in this server"))
  .addSubcommand(sc =>
    sc.setName("propose")
      .setDescription("Create an OpenRockets HQ proposal")
      .addStringOption(o => o.setName("body").setDescription("Announcement text").setRequired(true).setMaxLength(4000))
      .addStringOption(o => o.setName("title").setDescription("Optional title").setMaxLength(200))
      .addStringOption(o => o.setName("link").setDescription("Optional primary link"))
      .addAttachmentOption(o => o.setName("image").setDescription("Optional image attachment"))
  )
  .addSubcommand(sc =>
    sc.setName("stats")
      .setDescription("Show HQ statistics for a proposal")
      .addIntegerOption(o => o.setName("proposal_id").setDescription("Proposal ID").setRequired(true).setMinValue(1))
  )
  .addSubcommand(sc =>
    sc.setName("cancel")
      .setDescription("Cancel a pending HQ proposal")
      .addIntegerOption(o => o.setName("proposal_id").setDescription("Proposal ID").setRequired(true).setMinValue(1))
  )
  .addSubcommand(sc => sc.setName("network").setDescription("Show HQ network totals")));

export const submitMessageCommandName = "Submit to Scientific Teenager";
export const submitMessageCommand = new ContextMenuCommandBuilder()
  .setName(submitMessageCommandName)
  .setType(ApplicationCommandType.Message)
  .setContexts(InteractionContextType.Guild)
  .setIntegrationTypes(ApplicationIntegrationType.GuildInstall);

export const partnerCommandPayload = [scienceCommand.toJSON()];
export const hqCommandPayload = [relayCommand.toJSON(), submitMessageCommand.toJSON()];

function guildPayload(payload: Record<string, any>[]) {
  return payload.map(command => {
    const { contexts: _contexts, integration_types: _integrationTypes, ...guildCommand } = command;
    return guildCommand;
  });
}

export async function registerCommands(token: string, clientId: string, hqGuildId: string) {
  requireSnowflake(clientId, "DISCORD_CLIENT_ID");
  requireSnowflake(hqGuildId, "HQ_GUILD_ID");
  if (!token.trim()) throw new Error("DISCORD_TOKEN is required");
  const rest = new REST({ version: "10" }).setToken(token);
  await rest.put(Routes.applicationCommands(clientId), { body: partnerCommandPayload });
  await rest.put(Routes.applicationGuildCommands(clientId, hqGuildId), { body: guildPayload(hqCommandPayload) });
  return { global: partnerCommandPayload.length, hq: hqCommandPayload.length };
}