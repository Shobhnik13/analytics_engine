import * as dotenv from 'dotenv'
dotenv.config()

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { logger } from './common/logger';
import helmet from 'helmet';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet())
  app.enableCors()
  app.setGlobalPrefix('api')
  // app.useGlobalPipes()

  const PORT = parseInt(process.env.PORT || "7002", 10)
  await app.listen(PORT)
  logger.info(`[INFO] ANALYTICS ENGINE RUNNING ON http://localhost:${PORT}`)
}
bootstrap();
