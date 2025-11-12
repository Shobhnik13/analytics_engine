import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClickhouseService } from './clickhouse/clickhouse.service';
import { PostgresService } from './postgres/postgres.service';
 
@Module({  
  imports: [], 
  controllers: [AppController],
  providers: [AppService, ClickhouseService, PostgresService],
})
export class AppModule { }
