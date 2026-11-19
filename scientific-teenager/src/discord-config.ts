import { ApplicationIntegrationType, PermissionFlagsBits, PermissionsBitField } from "discord.js";

export const botPermissions = new PermissionsBitField([
  PermissionFlagsBits.ViewChannel,
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.EmbedLinks,
  PermissionFlagsBits.AttachFiles,
  PermissionFlagsBits.ReadMessageHistory,
  PermissionFlagsBits.MentionEveryone
]).bitfield;

export function requireSnowflake(value: string, label: string) {
  if (!/^\d{17,20}$/.test(value)) throw new Error(`${label} must be a Discord ID (17–20 digits)`);
  return value;
}

export function installUrl(clientId: string) {
  requireSnowflake(clientId, "DISCORD_CLIENT_ID");
  const url = new URL("https://discord.com/oauth2/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("permissions", botPermissions.toString());
  url.searchParams.set("scope", "bot applications.commands");
  url.searchParams.set("integration_type", String(ApplicationIntegrationType.GuildInstall));
  return url.toString();
}

export function registrationGuildId(env: NodeJS.ProcessEnv = process.env): string | undefined {
  const scope = env.COMMAND_SCOPE?.trim() || "guild";
  if (scope === "global") return undefined;
  if (scope !== "guild") throw new Error("COMMAND_SCOPE must be guild or global");
  const guildId = (env.COMMAND_GUILD_ID || env.HQ_GUILD_ID || "").trim();
  if (!guildId) throw new Error("COMMAND_GUILD_ID or HQ_GUILD_ID is required for guild command registration");
  return requireSnowflake(guildId, "command guild ID");
}