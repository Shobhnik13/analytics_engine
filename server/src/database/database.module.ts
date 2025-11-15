import { DynamicModule } from "@nestjs/common"
import { ClickhouseService } from "src/clickhouse/clickhouse.service"
import { PostgresService } from "src/postgres/postgres.service"

export class DatabaseModule {
    static register(): DynamicModule {
        const dbType = process.env.DATABASE_TYPE || "clickhouse" 
        const provider = dbType === "clickhouse" ? ClickhouseService : PostgresService
        return {
            module: DatabaseModule, 
            providers: [provider],
            exports: [provider],
        }
    }
}