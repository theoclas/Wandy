# Pasar de Docker completo a PM2 (+ Postgres en Docker)

Si levantaste `docker-compose.prod.yml` y ahora quieres API/web con PM2 (como el resto de apps en la VPS), sigue estos pasos.

## 1. Apagar el stack Docker completo

```bash
cd ~/apps/Wandy
docker compose -f docker-compose.prod.yml --env-file .env.production down
```

## 2. Dejar solo Postgres en Docker

```bash
docker compose -f docker-compose.db.yml --env-file .env.production up -d
```

## 3. Asegurar PM2

```bash
pm2 restart wandy-api wandy-web
pm2 status
ss -tlnp | grep -E '8085|3085'
```

## 4. Abrir firewall

Esto suele explicar el `ERR_CONNECTION_TIMED_OUT` del navegador:

```bash
sudo ufw allow 8085/tcp
sudo ufw allow 3085/tcp
sudo ufw reload
sudo ufw status
```

También abre **8085** y **3085** en el panel del VPS (Hostinger/etc.) si tiene firewall propio.

## 5. Probar

Desde la VPS:

```bash
curl -I http://127.0.0.1:8085
```

Desde tu PC: `http://IP_PUBLICA:8085`
