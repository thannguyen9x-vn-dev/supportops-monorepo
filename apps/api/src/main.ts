import { Logger, UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 8081);

  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: configService.get<string>('app.corsOrigins', 'http://localhost:3000'),
    credentials: true,
  });
  app.useStaticAssets(join(process.cwd(), 'storage'), { prefix: '/storage' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const messages = errors.flatMap((error) => Object.values(error.constraints ?? {}));
        return new UnprocessableEntityException(messages);
      },
    }),
  );

  setupSwagger(app);

  await app.listen(port);
  Logger.log(`NestJS API running on http://localhost:${port}/api/v1`, 'Bootstrap');
  Logger.log(`Swagger UI: http://localhost:${port}/docs`, 'Bootstrap');
}

void bootstrap();
