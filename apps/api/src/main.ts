// apps/api/src/main.ts
import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';
dotenvConfig({ path: resolve(__dirname, '../.env') }); // carrega apps/api/.env

import { NestFactory } from '@nestjs/core';
import { AppModule } from './module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['log','error','warn'] });

  app.enableCors({
    origin: (process.env.CORS_ALLOWLIST || '').split(',').filter(Boolean),
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Cha$hier API')
    .setVersion('0.0.1')
    .build();

  const doc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, doc);

  await app.listen(process.env.PORT || 4000);
}
bootstrap();
