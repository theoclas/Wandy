const fs = require('fs');
const path = require('path');

const root = __dirname;

function loadEnv(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const fileEnv = loadEnv(path.join(root, '.env.production'));

function buildDatabaseUrl() {
  if (fileEnv.DATABASE_URL) return fileEnv.DATABASE_URL;
  const user = fileEnv.POSTGRES_USER || 'wandy';
  const pass = encodeURIComponent(fileEnv.POSTGRES_PASSWORD || '');
  const db = fileEnv.POSTGRES_DB || 'wandy';
  const host = fileEnv.POSTGRES_HOST || '127.0.0.1';
  const port = fileEnv.POSTGRES_PORT || '5434';
  return `postgresql://${user}:${pass}@${host}:${port}/${db}?schema=public`;
}

const apiPort = fileEnv.API_PORT || '3085';
const httpPort = fileEnv.HTTP_PORT || '8085';

module.exports = {
  apps: [
    {
      name: 'wandy-api',
      cwd: path.join(root, 'apps/api'),
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: apiPort,
        DATABASE_URL: buildDatabaseUrl(),
        JWT_SECRET: fileEnv.JWT_SECRET || 'change-me',
        JWT_EXPIRES_IN: fileEnv.JWT_EXPIRES_IN || '8h',
        CORS_ORIGIN: fileEnv.CORS_ORIGIN || '*',
      },
    },
    {
      name: 'wandy-web',
      cwd: root,
      script: path.join(root, 'node_modules/serve/build/main.js'),
      args: `-s apps/web/dist -l tcp://0.0.0.0:${httpPort}`,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
