import { otelSDK } from './tracing';
otelSDK.start();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ecsFormat } from '@elastic/ecs-winston-format';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      format: ecsFormat(),
      transports: [new winston.transports.Console()],
    }),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 API rodando em: http://localhost:${port}`);
}
bootstrap();
