import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();
  app.setGlobalPrefix('api');

  app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
  app.use(compression());

  // CORS — vazio libera qualquer origem (dev); em produção, defina ALLOWED_ORIGINS
  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '').split(',').filter(Boolean);
  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Respeita @Exclude() das entities (senha, tokens etc.) em toda resposta.
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const configService = app.get(ConfigService);
  const swaggerEnabled = (configService.get<string>('SWAGGER_ENABLED') ?? '').toLowerCase() === 'true';

  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(configService.get<string>('SWAGGER_TITLE') ?? 'checkpoint API')
      .setDescription(configService.get<string>('SWAGGER_DESCRIPTION') ?? 'API do checkpoint')
      .setVersion(configService.get<string>('SWAGGER_VERSION') ?? '1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, { swaggerOptions: { persistAuthorization: true } });
  }

  const port = Number(configService.get<string>('PORT') ?? 3333);
  await app.listen(port);

  new Logger('Bootstrap').log(`checkpoint API rodando na porta ${port}`);
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error(error instanceof Error ? error.stack : String(error));
  process.exit(1);
});
