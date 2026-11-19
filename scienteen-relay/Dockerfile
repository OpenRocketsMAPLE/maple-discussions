FROM node:22-alpine AS build
WORKDIR /app
RUN apk add --no-cache curl
RUN for n in 00 01 02 03 04 05 06; do \
      curl -fsSL "https://raw.githubusercontent.com/OpenRocketsMAPLE/maple-discussions/main/scientific-teenager/source.part${n}.b64" -o "/tmp/source.part${n}.b64"; \
    done \
 && cat /tmp/source.part*.b64 > /tmp/source.tar.gz.b64 \
 && base64 -d /tmp/source.tar.gz.b64 > /tmp/source.tar.gz \
 && tar -xzf /tmp/source.tar.gz -C /app \
 && sed -i 's/const guildCommand = <T extends SlashCommandBuilder>(command: T) => command/const guildCommand = (command: any) => command/' src/commands.ts \
 && sed -i 's/registerCommands(token, clientId, guildId);/registerCommands(token, clientId, guildId!);/' src/register.ts \
 && npm ci --no-audit --no-fund \
 && npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund \
 && npm cache clean --force
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
