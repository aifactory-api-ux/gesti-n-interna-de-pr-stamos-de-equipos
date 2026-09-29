FROM node:20-alpine AS base

FROM base AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

FROM base AS prod-deps

WORKDIR /app

COPY package*.json ./

RUN npm ci

FROM base AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx tsc -p tsconfig.json

FROM base AS production

WORKDIR /app

RUN apk add --no-cache dumb-init netcat-openbsd

COPY --from=prod-deps /app/node_modules ./node_modules

COPY --from=build /app/dist ./dist
COPY package*.json ./
COPY docker-entrypoint.sh .

ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000

USER node

ENTRYPOINT ["/bin/sh", "docker-entrypoint.sh"]

CMD ["node", "dist/main"]
