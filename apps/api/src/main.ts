import { Logger, UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { Logger as PinoLogger } from 'nestjs-pino';
import { join } from 'path';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(PinoLogger));

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 8081);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow static file serving
    }),
  );

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
  const logger = new Logger('Bootstrap');
  logger.log(`NestJS API running on http://localhost:${port}/api/v1`);
  logger.log(`Swagger UI: http://localhost:${port}/docs`);
}

void bootstrap();
