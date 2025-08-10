import { NestFactory } from '@nestjs/core';
import { AppModule } from './module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['log','error','warn'] });
  app.enableCors({
    origin: (process.env.CORS_ALLOWLIST||'').split(',').filter(Boolean),
    credentials: true,
  });

  const config = new DocumentBuilder().setTitle('Cha$hier API').setVersion('0.0.1').build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, doc);

  await app.listen(process.env.PORT || 4000);
}
bootstrap();
