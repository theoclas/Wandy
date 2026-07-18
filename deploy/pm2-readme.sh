#!/usr/bin/env bash
# Guía rápida PM2 — ver también DEPLOY.md

cat <<'EOF'
=== Wandy con PM2 ===

1) En la VPS:
   cd ~/apps/Wandy
   git pull
   nano .env.production

   Asegúrate de tener:
     VITE_API_URL=http://TU_IP:3085
     CORS_ORIGIN=http://TU_IP:8085
     HTTP_PORT=8085
     API_PORT=3085
     POSTGRES_PORT=5434

2) Arrancar:
   chmod +x deploy/pm2.sh
   ./deploy/pm2.sh

3) Autostart al reiniciar el servidor:
   pm2 startup
   # copia y ejecuta el comando sudo que te muestre
   pm2 save

4) Abrir:
   http://TU_IP:8085

Login: admin@wandy.local / Admin123!

Comandos:
   pm2 status
   pm2 logs
   pm2 restart wandy-api
   pm2 restart wandy-web
EOF
