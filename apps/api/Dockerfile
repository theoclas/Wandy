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
RUN npx prisma generate \
  && rm -f tsconfig.build.tsbuildinfo tsconfig.tsbuildinfo \
  && npm run build \
  && test -f dist/main.js \
  && echo "Build OK: dist/main.js present"

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NODE_PATH=/app/node_modules
RUN apk add --no-cache openssl libc6-compat
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
RUN npm ci -w api
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY apps/api/docker-entrypoint.sh ./apps/api/docker-entrypoint.sh
WORKDIR /app/apps/api
RUN npx prisma generate && chmod +x ./docker-entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
