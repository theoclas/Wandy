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
ENV NODE_PATH=/app/node_modules
RUN apk add --no-cache openssl libc6-compat
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY apps/api/docker-entrypoint.sh ./apps/api/docker-entrypoint.sh
RUN chmod +x ./apps/api/docker-entrypoint.sh
WORKDIR /app/apps/api
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
