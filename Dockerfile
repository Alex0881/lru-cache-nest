FROM node:18-alpine AS builder

WORKDIR "/app"
COPY --chown=node:node . .
RUN npm ci --force
RUN npm run build
ENV NODE_ENV production
RUN npm prune --production --force && npm cache clean --force


FROM node:18-alpine AS production
WORKDIR "/app"

HEALTHCHECK --interval=15s --timeout=20s --start-period=20s --retries=3 CMD curl -f http://localhost:${PORT}/ || exit 1
RUN apk --no-cache add curl

#COPY --chown=node:node --from=builder /app/package.json ./
#COPY --chown=node:node --from=builder /app/dist ./dist
#COPY --chown=node:node --from=builder /app/node_modules ./node_modules
#COPY --chown=node:node --from=builder /app/logs ./logs
#COPY --chown=node:node --from=builder /app/src ./src
#COPY --chown=node:node --from=builder /app/test ./test

COPY --chown=node:node --from=builder /app .

COPY --chown=node:node --from=builder /app/.env.test.for_docker ./.env.test
COPY --chown=node:node --from=builder /app/.env.for_docker ./.env

ENV NODE_ENV production

USER node

CMD [ "sh", "-c", "npm run start:prod"]



