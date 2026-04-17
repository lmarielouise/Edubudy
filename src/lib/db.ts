import { neon } from '@neondatabase/serverless';
import type { Alert } from '@/types';

function getSql() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL manquante');
  return neon(process.env.DATABASE_URL);
}

export async function initDb(): Promise<void> {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS alerts (
      id          TEXT        PRIMARY KEY,
      timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      category    TEXT        NOT NULL,
      severity    TEXT        NOT NULL,
      trigger_msg TEXT        NOT NULL,
      child_name  TEXT        NOT NULL,
      parent_advice TEXT      NOT NULL,
      resources   JSONB       NOT NULL DEFAULT '[]',
      acknowledged BOOLEAN    NOT NULL DEFAULT FALSE
    )
  `;
}

function rowToAlert(row: Record<string, unknown>): Alert {
  return {
    id: row.id as string,
    timestamp: (row.timestamp as Date).toISOString(),
    category: row.category as Alert['category'],
    severity: row.severity as Alert['severity'],
    triggerMessage: row.trigger_msg as string,
    childName: row.child_name as string,
    parentAdvice: row.parent_advice as string,
    resources: row.resources as string[],
    acknowledged: row.acknowledged as boolean,
  };
}

export async function dbGetAlerts(): Promise<Alert[]> {
  const sql = getSql();
  const rows = await sql`SELECT * FROM alerts ORDER BY timestamp DESC LIMIT 200`;
  return rows.map(rowToAlert);
}

export async function dbSaveAlert(alert: Alert): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO alerts (id, timestamp, category, severity, trigger_msg, child_name, parent_advice, resources, acknowledged)
    VALUES (
      ${alert.id}, ${alert.timestamp}, ${alert.category}, ${alert.severity},
      ${alert.triggerMessage}, ${alert.childName}, ${alert.parentAdvice},
      ${JSON.stringify(alert.resources)}, ${alert.acknowledged}
    )
    ON CONFLICT (id) DO NOTHING
  `;
}

export async function dbAcknowledgeAlert(alertId: string): Promise<boolean> {
  const sql = getSql();
  const result = await sql`
    UPDATE alerts SET acknowledged = TRUE WHERE id = ${alertId}
  `;
  return (result as unknown as { rowCount: number }).rowCount > 0;
}

export async function dbGetUnreadCount(): Promise<number> {
  const sql = getSql();
  const rows = await sql`SELECT COUNT(*) as n FROM alerts WHERE acknowledged = FALSE`;
  return parseInt(rows[0]?.n as string ?? '0');
}
