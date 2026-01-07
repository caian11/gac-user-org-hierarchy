import { otelSDK } from './tracing';
otelSDK.start();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ecsFormat } from '@elastic/ecs-winston-format';
import { AppModule } from './app.module';
import { trace, context } from '@opentelemetry/api';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      format: winston.format.combine(
        winston.format((info) => {
          const span = trace.getSpan(context.active());
          if (span) {
            const { traceId, spanId } = span.spanContext();
            info['trace.id'] = traceId;
            info['span.id'] = spanId;
          }
          return info;
        })(),
        ecsFormat(),
      ),
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
