# Subdominio HTTPS + PM2 (fix back)

Si el front abre en `https://corporaciondestellos.fersuastudio.com` pero el login falla o `/api` muestra la página de login, el Nginx del host **no está proxyando `/api` al Nest**.

Síntoma: `curl https://TU_DOMINIO/api` devuelve HTML del React, no JSON del API.

## Causa

Con PM2:

- Front: `serve` en `HTTP_PORT` (ej. `8085`) — **no** hace proxy de `/api`
- API: Nest en `API_PORT` (ej. `3085`)

Si Nginx solo manda todo el dominio al `8085`, las peticiones `/api/*` caen en el SPA.

## Arreglo (en la VPS)

### 1. Nginx: proxy `/` → web y `/api/` → api

```bash
cd ~/apps/Wandy
git pull

sudo cp deploy/nginx-host-destellos.conf /etc/nginx/sites-available/corporaciondestellos
sudo ln -sf /etc/nginx/sites-available/corporaciondestellos /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Si el sitio ya existía, edita el `server` del subdominio y agrega el bloque `location /api/` (ver `deploy/nginx-host-destellos.conf`). Los puertos deben coincidir con `.env.production`.

Certificado (si aún no):

```bash
sudo certbot --nginx -d corporaciondestellos.fersuastudio.com
```

### 2. `.env.production` para mismo origen

```env
CORS_ORIGIN=https://corporaciondestellos.fersuastudio.com
# Mismo origen vía Nginx (sin puerto). Vacío también sirve.
VITE_API_URL=https://corporaciondestellos.fersuastudio.com
HTTP_PORT=8085
API_PORT=3085
```

**No** uses `http://IP:3085` como `VITE_API_URL` detrás de HTTPS: el navegador bloquea mixed content.

### 3. Rebuild + reinicio

```bash
cd ~/apps/Wandy
./deploy/pm2.sh
pm2 status
```

### 4. Verificación

```bash
# Debe responder Nest (JSON / 404 API), NO el HTML del login
curl -sI https://corporaciondestellos.fersuastudio.com/api
curl -s http://127.0.0.1:3085/api

pm2 logs wandy-api --lines 40
```

Login en el navegador (caché limpia / pestaña privada).

## Checklist rápido

| Check | Esperado |
|-------|----------|
| `ss -tlnp \| grep -E '8085\|3085'` | Ambos escuchando |
| Nginx `location /api/` | → `127.0.0.1:3085` |
| Nginx `location /` | → `127.0.0.1:8085` |
| `VITE_API_URL` | `https://corporaciondestellos.fersuastudio.com` o vacío |
| `CORS_ORIGIN` | el mismo dominio HTTPS |
