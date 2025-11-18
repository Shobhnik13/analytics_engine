import * as dotenv from 'dotenv'
dotenv.config()

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { logger } from './common/logger';
import helmet from 'helmet';
import { startWorker } from './worker/worker';
import { ClickhouseService } from './clickhouse/clickhouse.service';
import { PostgresService } from './postgres/postgres.service';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet())
  app.enableCors()
  app.setGlobalPrefix('api/v1')

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

  const dbService = app.get("ACTIVE_DB_SERVICE")

  const PORT = parseInt(process.env.PORT || "", 10)
  await app.listen(PORT)
  try {
    await startWorker(dbService)  
  } catch (err: any) {
    logger.error(`[WARN] WORKER INITIALIZATION FAILED`)
  }
  logger.info(`[INFO] ANALYTICS ENGINE RUNNING ON http://localhost:${PORT}`)
}
bootstrap();
