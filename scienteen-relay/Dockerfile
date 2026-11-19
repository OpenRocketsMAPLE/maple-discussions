FROM node:22-alpine
WORKDIR /app
COPY runtime.part.* /tmp/runtime/
RUN cat /tmp/runtime/runtime.part.* | base64 -d | tar -xz -C /app \
 && npm ci --omit=dev --ignore-scripts \
 && npm cache clean --force \
 && rm -rf /tmp/runtime
ENV NODE_ENV=production
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
