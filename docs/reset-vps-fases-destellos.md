# Reset VPS tras rediseño de fases Destellos

Cuando se despliegue este cambio en la VPS, hay que **resetear** la base (no hay migración de HC Erikson).

## Importante

1. El código del rediseño debe estar ya en `main` (`git pull` debe traer schema/seed Destellos).
2. Prisma necesita `DATABASE_URL`. En la VPS **no** uses `npx prisma …` a pelo: o exportas la URL, o usa `./deploy/pm2.sh` (ya la arma desde `.env.production`).

## Camino recomendado (PM2)

En `.env.production` pon temporalmente:

```env
RUN_SEED=true
```

Luego:

```bash
cd ~/apps/Wandy
git pull
chmod +x deploy/pm2.sh
./deploy/pm2.sh
```

Ese script: levanta Postgres, instala deps, genera Prisma, hace `migrate deploy`, build, seed (si `RUN_SEED=true`) y reinicia PM2.

Después vuelve a poner `RUN_SEED=false`.

## Si quieres migrar/seed a mano

```bash
cd ~/apps/Wandy
git pull
docker compose -f docker-compose.db.yml --env-file .env.production up -d

cd apps/api

# Construir DATABASE_URL desde .env.production (misma lógica que pm2.sh)
export DATABASE_URL="$(
  node -e "
    const fs=require('fs');
    const env={};
    for (const line of fs.readFileSync('../../.env.production','utf8').split(/\\r?\\n/)) {
      const t=line.trim(); if(!t||t.startsWith('#')) continue;
      const i=t.indexOf('='); if(i<0) continue;
      let v=t.slice(i+1).trim();
      if ((v.startsWith('\"')&&v.endsWith('\"'))||(v.startsWith(\"'\")&&v.endsWith(\"'\"))) v=v.slice(1,-1);
      env[t.slice(0,i).trim()]=v;
    }
    const u=env.POSTGRES_USER||'wandy';
    const p=encodeURIComponent(env.POSTGRES_PASSWORD||'');
    const h=env.POSTGRES_HOST||'127.0.0.1';
    const port=env.POSTGRES_PORT||'5434';
    const d=env.POSTGRES_DB||'wandy';
    process.stdout.write('postgresql://'+u+':'+p+'@'+h+':'+port+'/'+d+'?schema=public');
  "
)"

echo "DATABASE_URL ok (password oculta)"
npx prisma generate
npx prisma migrate deploy
npx prisma db seed

cd ~/apps/Wandy
./deploy/pm2.sh
# o solo: pm2 restart wandy-api wandy-web  (si ya buildaste)
```

Si `migrate deploy` falla por schema viejo incompatible:

```bash
# CUIDADO: borra toda la data de la DB wandy
npx prisma db push --force-reset
npx prisma db seed
```

Esto **borra** historias clínicas y calificaciones del modelo viejo. Usuarios seed (`admin@wandy.local`, `profesional@wandy.local`) se recrean/conservan según el seed.

No ejecutar en producción con datos reales que deban conservarse sin backup previo.
