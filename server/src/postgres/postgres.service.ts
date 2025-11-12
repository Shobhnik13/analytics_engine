import { Injectable, OnModuleInit } from "@nestjs/common";
import { Client } from "pg"
import { logger } from "src/common/logger";

@Injectable()
export class PostgresService implements OnModuleInit {
    private client: Client

    constructor() {
        // setting up singleton client instance
        this.client = new Client({
            host: process.env.POSTGRES_HOST || 'localhost',
            port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
            user: process.env.POSTGRES_USER || 'insightuser',
            password: process.env.POSTGRES_PASSWORD || 'insightpass',
            database: process.env.POSTGRES_DB || 'insightplus'
        })
    }

    async onModuleInit() {
        await this.client.connect();
        await this.client.query(`
            CREATE TABLE IF NOT EXISTS events (
                uuid TEXT PRIMARY KEY,
                event TEXT NOT NULL,
                distinct_id TEXT NOT NULL,
                properties JSONB,
                event_timestamp TIMESTAMPTZ DEFAULT NOW()
                )`)
        logger.info("[INFO] POSTGRES CLIENT SETUP COMPLETED AND TABLES ARE READY");
    }

    async insertMany(rows: any[]) {
        if (!rows || rows.length === 0) return;
        
    }
}