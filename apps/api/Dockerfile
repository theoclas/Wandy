# Build from repo root:
#   docker build -f apps/api/Dockerfile .

FROM node:22-alpine AS build
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat python3 make g++
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
RUN npm ci -w api
COPY apps/api ./apps/api
WORKDIR /app/apps/api
RUN npx prisma generate && npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl libc6-compat
# Reinstall in runner so workspace symlinks are valid (COPY of node_modules breaks them)
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
RUN npm ci -w api
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY apps/api/docker-entrypoint.sh ./apps/api/docker-entrypoint.sh
WORKDIR /app/apps/api
RUN npx prisma generate && chmod +x ./docker-entrypoint.sh
# Ensure Node can resolve hoisted deps from /app/node_modules
RUN ln -sfn /app/node_modules /app/apps/api/node_modules
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
