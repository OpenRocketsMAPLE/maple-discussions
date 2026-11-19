import "dotenv/config";
import { registerCommands } from "./commands.js";

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const hqGuildId = process.env.HQ_GUILD_ID;
if (!token || !clientId || !hqGuildId) {
  throw new Error("DISCORD_TOKEN, DISCORD_CLIENT_ID and HQ_GUILD_ID are required");
}

const count = await registerCommands(token, clientId, hqGuildId);
console.log(`Registered ${count.global} global partner command(s) and ${count.hq} HQ command(s).`);
