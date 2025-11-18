import Redis from "ioredis";
import { logger } from "src/common/logger";

type InsertEvent = {
    uuid: string;
    event: string;
    distinct_id: string;
    properties: any;
    event_timestamp: string;
    redisId: string;
};

export async function startWorker(db: any) {
    const redis = new Redis(process.env.REDIS_URL || '');

    const streamKey = process.env.REDIS_QUEUE || "insightplus_events";
    const groupName = "insightplus_group";
    const consumerName = `worker_consumer_${Math.floor(Math.random() * 10000)}`;
    const batchSize = 200;

    logger.info(`[INFO] Worker started ${consumerName} on stream ${streamKey}`);

    try { 
        await redis.xgroup('CREATE', streamKey, groupName, '$', 'MKSTREAM');
    } catch (err: any) {
        if (!err.message.includes('BUSYGROUP')) {
            logger.error(`[ERROR] Redis Group creation failed: ${err.message}`);
        } else {
            logger.info("[IGNORE] Consumer group already exists");
        }
    }

    async function consume() {
        while (true) {
            try {
                const messages = await redis.xreadgroup(
                    'GROUP',
                    groupName,
                    consumerName,
                    'COUNT',
                    batchSize,
                    'BLOCK',
                    3000,
                    'STREAMS',
                    streamKey,
                    '>'
                );

                if (!messages) continue;

                type RedisStreamResponse = [string, [string, string[]][]];
                const [stream, entries] = messages[0] as RedisStreamResponse;

                const toInsert = entries
                    .map(([id, fields]): InsertEvent | null => {

                        const fieldArray = fields as string[];

                        // Convert ["payload", "..."] → { payload: "..." }
                        const obj: Record<string, string> = {};
                        for (let i = 0; i < fieldArray.length; i += 2) {
                            obj[fieldArray[i]] = fieldArray[i + 1];
                        }

                        if (!obj.payload) {
                            logger.info(`[Worker ${consumerName}] Bad message: ${JSON.stringify(obj)}`);
                            return null;
                        }

                        const event = JSON.parse(obj.payload);

                        return {
                            uuid: event.uuid,
                            event: event.event,
                            distinct_id: event.distinct_id,
                            properties: event.properties,
                            event_timestamp: process.env.DATABASE_TYPE === "clickhouse"
                                ? event.event_timestamp.replace("T", " ").replace("Z", "")
                                : new Date(event.event_timestamp),
                            redisId: id,
                        };
                    })
                    .filter((e): e is InsertEvent => e !== null);

                if (toInsert.length > 0) {
                    logger.info(`[INFO][Worker ${consumerName}] Processing ${toInsert.length} events...`);

                    await db.insertMany(toInsert);

                    const ids = toInsert.map((e) => e.redisId);
                    await redis.xack(streamKey, groupName, ...ids);

                    logger.info(`[INFO][Worker ${consumerName}] ACK ${ids.length} messages`);
                }

            } catch (err: any) {
                logger.error(`[ERROR][Worker ${consumerName}] ${err.message}`);
                await new Promise((r) => setTimeout(r, 1000));
            }
        }
    }

    consume();
}
