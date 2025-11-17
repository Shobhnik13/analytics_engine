import { Inject, Injectable, Optional } from "@nestjs/common";
import { ClickhouseService } from "src/clickhouse/clickhouse.service";
import { PostgresService } from "src/postgres/postgres.service";

@Injectable()
export class AnalyticsService {
  // database instance that contains all the service functions based on selected DB
  // boolean value to execute 
  private db: any
  private isClickhouse: boolean

  constructor(
    @Inject('ACTIVE_DB_SERVICE') private readonly dbService: any
  ) {
    this.db = dbService
  }

  // helper method to run queries on the selected database
  private runQuery(sqlPg: string, sqlCh: string) {
    return this.db.query(this.isClickhouse ? sqlCh : sqlPg)
  }

  // analytics methods

  // most used features
  async mostUsedFeatures() {
    return this.runQuery(
      // Postgres SQL
      `SELECT properties->>'feature' AS feature, COUNT(*) AS usage_count
             FROM events
             WHERE event='most_used_feature'
             GROUP BY feature
             ORDER BY usage_count DESC
             LIMIT 20`,

      // clickhouse SQL
      `SELECT
      JSON_VALUE(CAST(properties, 'String'), '$.feature') AS feature,
      COUNT(*) AS usage_count
      FROM events
      WHERE event = 'most_used_feature'
      GROUP BY feature
      ORDER BY usage_count DESC
      LIMIT 20
    `
    )
  }

  // daily acive users (dau)
  async dailyAciveUsers(days = 30) {
    return this.runQuery(
      `
            SELECT date_trunc('day', event_timestamp)::date AS day,
                   COUNT(DISTINCT distinct_id) AS dau
            FROM events
            WHERE event_timestamp >= now() - interval '${days} days'
            GROUP BY day
            ORDER BY day;
            `,
      `
            SELECT toStartOfDay(event_timestamp) AS day,
                   uniqExact(distinct_id) AS dau
            FROM events
            WHERE event_timestamp >= now() - INTERVAL ${days} DAY
            GROUP BY day
            ORDER BY day;
            `
    )
  }

  async getMonthlyActiveUsesrs(months = 6) {
    return this.runQuery(
      `
            SELECT date_trunc('month', event_timestamp)::date AS month,
                   COUNT(DISTINCT distinct_id) AS mau
            FROM events
            WHERE event_timestamp >= now() - interval '${months} months'
            GROUP BY month
            ORDER BY month;
            `,
      `
            SELECT toStartOfMonth(event_timestamp) AS month,
                   uniqExact(distinct_id) AS mau
            FROM events
            WHERE event_timestamp >= now() - INTERVAL ${months} MONTH
            GROUP BY month
            ORDER BY month;
            `
    );
  }

  async getTotalUsers() {
    return this.runQuery(
      `SELECT COUNT(DISTINCT distinct_id) AS total_users FROM events;`,
      `SELECT uniqEoxact(distinct_id) AS total_users FROM events;`
    );
  }

  async getTotalEvents() {
    return this.runQuery(
      `SELECT COUNT(*) AS total_events FROM events;`,
      `SELECT COUNT() AS total_events FROM events;`
    );
  }

  async getConversionFunnel() {
    return this.runQuery(
      `
          SELECT
            COUNT(DISTINCT CASE WHEN event='user_registered' THEN distinct_id END) AS signed_up,
            COUNT(DISTINCT CASE WHEN event='payment_success' THEN distinct_id END) AS paid_users,
            ROUND(
              100.0 * COUNT(DISTINCT CASE WHEN event='payment_success' THEN distinct_id END)
              / NULLIF(COUNT(DISTINCT CASE WHEN event='user_registered' THEN distinct_id END), 0), 2
            ) AS conversion_rate
          FROM events;
          `,
      `
          SELECT
            uniqExactIf(distinct_id, event='user_registered') AS signed_up,
            uniqExactIf(distinct_id, event='payment_success') AS paid_users,
            round(
              100.0 * uniqExactIf(distinct_id, event='payment_success')
              / nullIf(uniqExactIf(distinct_id, event='user_registered'), 0), 2
            ) AS conversion_rate
          FROM events;
          `
    );
  }

  async getMostActiveUsers(limit = 10) {
    return this.runQuery(
      `
          SELECT distinct_id, COUNT(*) AS total_events
          FROM events
          GROUP BY distinct_id
          ORDER BY total_events DESC
          LIMIT ${limit};
          `,
      `
          SELECT distinct_id, COUNT() AS total_events
          FROM events
          GROUP BY distinct_id
          ORDER BY total_events DESC
          LIMIT ${limit};
          `
    );
  }

}