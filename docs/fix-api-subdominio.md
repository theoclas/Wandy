# Subdominio HTTPS + PM2 (fix back)

Si el front abre en `https://corporaciondestellos.fersuastudio.com` pero el login falla o `/api` muestra la página de login, el Nginx del host **no está proxyando `/api` al Nest**.

Síntoma: `curl https://TU_DOMINIO/api` devuelve HTML del React, no JSON del API.

## Causa

Con PM2:

- Front: `serve` en `HTTP_PORT` (ej. `8085`) — **no** hace proxy de `/api`
- API: Nest en `API_PORT` (ej. `3085`)

Si Nginx solo manda todo el dominio al `8085`, las peticiones `/api/*` caen en el SPA.

**Trampa frecuente:** tienes dos sitios (`corporaciondestellos` y `corporaciondestellos.fersuastudio.com`). Certbot pone el SSL en uno; si agregas `/api/` solo en el de puerto 80, el login por HTTPS sigue roto.

## Arreglo (en la VPS)

### 0. Ver qué servidor HTTPS atiende el dominio

```bash
sudo nginx -T 2>/dev/null | grep -E 'server_name|listen |location |proxy_pass' | head -n 80
sudo ls -la /etc/nginx/sites-enabled/
# Ver contenido SSL:
sudo grep -n "location\|proxy_pass\|listen\|server_name" /etc/nginx/sites-enabled/corporaciondestellos.fersuastudio.com
sudo grep -n "location\|proxy_pass\|listen\|server_name" /etc/nginx/sites-enabled/corporaciondestellos
```

### 1. Editar el `server` con `listen 443 ssl`

```bash
sudo nano /etc/nginx/sites-enabled/corporaciondestellos.fersuastudio.com
# (o el archivo que tenga listen 443)
```

**Antes** de `location /`, agrega:

```nginx
location = /api {
    proxy_pass http://127.0.0.1:3085/api;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Authorization $http_authorization;
}

location /api/ {
    proxy_pass http://127.0.0.1:3085/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Authorization $http_authorization;
}
```

El `location /` debe seguir apuntando a `http://127.0.0.1:8085`.

Si hay dos sitios duplicados, deja **uno** activo y deshabilita el otro:

```bash
sudo rm /etc/nginx/sites-enabled/corporaciondestellos
# conserva el de Certbot (.fersuastudio.com) ya corregido
sudo nginx -t && sudo systemctl reload nginx
```

Referencia completa: `deploy/nginx-host-destellos.conf`.

### 2. `.env.production` para mismo origen

```env
CORS_ORIGIN=https://corporaciondestellos.fersuastudio.com
VITE_API_URL=https://corporaciondestellos.fersuastudio.com
HTTP_PORT=8085
API_PORT=3085
```

**No** uses `http://IP:3085` como `VITE_API_URL` detrás de HTTPS: el navegador bloquea mixed content.

### 3. Rebuild + reinicio (solo si cambiaste VITE_API_URL)

```bash
cd ~/apps/Wandy
./deploy/pm2.sh
pm2 status
```

### 4. Verificación

```bash
# Local Nest OK (JSON 404 es normal en GET /api)
curl -s http://127.0.0.1:3085/api

# Por HTTPS debe ser JSON Nest, NO index.html
curl -sI https://corporaciondestellos.fersuastudio.com/api
curl -s -X POST https://corporaciondestellos.fersuastudio.com/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@wandy.local","password":"Admin123!"}'
```

Login en el navegador (caché limpia / pestaña privada).

## Checklist rápido

| Check | Esperado |
|-------|----------|
| `ss -tlnp \| grep -E '8085\|3085'` | Ambos escuchando |
| Nginx `location /api/` en el **server 443** | → `127.0.0.1:3085` |
| Nginx `location /` | → `127.0.0.1:8085` |
| `VITE_API_URL` | dominio HTTPS o vacío |
| Un solo site enabled para ese `server_name` | evita conflictos |
