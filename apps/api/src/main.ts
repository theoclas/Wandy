import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import type { NextFunction, Request, Response } from 'express';

function parseCorsOrigins(raw?: string): string | string[] | boolean {
  if (!raw || raw.trim() === '') return true;
  if (raw.trim() === '*') return true;
  const list = raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  return list.length === 1 ? list[0] : list;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use((req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    res.json = ((body: unknown) => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return originalJson(body);
    }) as typeof res.json;
    next();
  });
  app.enableCors({
    origin: parseCorsOrigins(process.env.CORS_ORIGIN),
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix('api');
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
}
bootstrap();
