import type { Alert } from '@/types';

export async function loadAlerts(
  serverUrl: string,
  apiSecret: string,
): Promise<{ alerts: Alert[]; unread: number }> {
  try {
    const res = await fetch(`${serverUrl}/api/alerts`, {
      headers: { 'Content-Type': 'application/json', 'x-api-secret': apiSecret },
    });
    if (!res.ok) return { alerts: [], unread: 0 };
    return res.json() as Promise<{ alerts: Alert[]; unread: number }>;
  } catch {
    return { alerts: [], unread: 0 };
  }
}

export async function acknowledgeAlert(
  alertId: string,
  serverUrl: string,
  apiSecret: string,
): Promise<void> {
  await fetch(`${serverUrl}/api/alerts`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-api-secret': apiSecret },
    body: JSON.stringify({ alertId }),
  });
}
