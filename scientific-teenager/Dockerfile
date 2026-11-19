FROM node:22-alpine AS build
WORKDIR /app

COPY source.part*.b64 /tmp/source-parts/
COPY src/commands.ts /tmp/overrides/commands.ts
COPY src/register.ts /tmp/overrides/register.ts
RUN cat /tmp/source-parts/source.part*.b64 > /tmp/source.tar.gz.b64 \
 && base64 -d /tmp/source.tar.gz.b64 > /tmp/source.tar.gz \
 && tar -xzf /tmp/source.tar.gz -C /app \
 && cp /tmp/overrides/commands.ts /app/src/commands.ts \
 && cp /tmp/overrides/register.ts /app/src/register.ts \
 && npm ci --no-audit --no-fund \
 && npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund \
 && npm cache clean --force

COPY --from=build /app/dist ./dist

USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
