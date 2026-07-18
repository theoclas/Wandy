# Despliegue en VPS

## Opción A — PM2 (API + Front) + Docker solo Postgres

Ideal si en la VPS ya usas PM2 para otros proyectos.

### Requisitos

- Node.js 20+
- PM2 (`npm i -g pm2`)
- Docker (solo para Postgres)

### Pasos

```bash
cd ~/apps/Wandy
git pull
nano .env.production
```

Configura al menos:

```env
POSTGRES_PASSWORD=tu-clave
JWT_SECRET=tu-jwt
CORS_ORIGIN=http://TU_IP:8085
HTTP_PORT=8085
API_PORT=3085
POSTGRES_PORT=5434
VITE_API_URL=http://TU_IP:3085
RUN_SEED=true
```

```bash
chmod +x deploy/pm2.sh
./deploy/pm2.sh

# Autostart tras reinicio (una vez)
pm2 startup
pm2 save
```

Abre `http://TU_IP:8085`

| Proceso PM2 | Puerto |
|-------------|--------|
| wandy-web | 8085 |
| wandy-api | 3085 |
| postgres (Docker) | 127.0.0.1:5434 |

```bash
pm2 status
pm2 logs wandy-api
pm2 restart all
```

---

## Opción B — Docker completo (API + Web + Postgres)

Guía rápida para montar Wandy en un VPS con Docker.

## Requisitos en el servidor

- Ubuntu 22.04+ (o similar)
- Docker Engine + Docker Compose plugin
- Puertos 80 (y 443 si usas HTTPS) abiertos en el firewall

```bash
# Instalar Docker (Ubuntu)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Cierra sesión y vuelve a entrar
```

## 1. Clonar el repo

```bash
git clone https://github.com/theoclas/Wandy.git
cd Wandy
```

## 2. Configurar entorno

```bash
cp .env.production.example .env.production
nano .env.production
```

Cambia al menos:

- `POSTGRES_PASSWORD`
- `JWT_SECRET` (cadena larga aleatoria)
- `CORS_ORIGIN` (tu dominio o `http://IP_PUBLICA`)
- `RUN_SEED=true` solo la primera vez

## 3. Levantar

```bash
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```

O manualmente:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

La web queda en el puerto **8085** por defecto (configurable). Nginx sirve el frontend y reenvía `/api` a la API.

Puertos por defecto (para no chocar con otros proyectos en el 80/443):

| Servicio | Puerto host | Uso |
|----------|-------------|-----|
| Front + `/api` | **8085** | Entrar aquí en el navegador |
| API directa | **3085** | Opcional (`/api/...`) |

Cámbialos en `.env.production` con `HTTP_PORT` y `API_PORT` si esos también están ocupados.

## 4. Usuarios iniciales (si `RUN_SEED=true`)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | `admin@wandy.local` | `Admin123!` |
| Profesional | `profesional@wandy.local` | `Prof123!` |

Después del primer arranque, edita `.env.production` y pon `RUN_SEED=false`.

## 5. HTTPS (recomendado)

Con dominio apuntando a la VPS, usa Certbot + Nginx en el host, o un proxy como Caddy/Traefik delante del contenedor `web`.

Ejemplo mínimo con Certbot en el host (Nginx del sistema):

1. Apunta el DNS `A` de tu dominio a la IP del VPS.
2. Cambia `HTTP_PORT=8080` en `.env.production` y reinicia compose.
3. Configura Nginx del host como reverse proxy a `127.0.0.1:8080` y solicita certificado.

## Comandos útiles

```bash
# Ver estado
docker compose -f docker-compose.prod.yml ps

# Logs
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f web

# Actualizar tras un git pull
git pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Backup DB
docker exec wandy-postgres pg_dump -U wandy wandy > backup-$(date +%F).sql
```

## Arquitectura

```
Internet → :80 (web/Nginx) → estáticos React
                          └→ /api/* → api:3000 (NestJS) → postgres:5432
```

Postgres **no** se publica a internet; solo vive en la red interna de Docker.

## Qué cambia respecto a desarrollo local

| Local | VPS |
|-------|-----|
| `npm run dev:web` / `dev:api` | Contenedores Docker |
| Proxy Vite `/api` | Nginx `/api` |
| Postgres en `:5433` | Postgres interno Docker |
| CORS localhost | `CORS_ORIGIN` en `.env.production` |
