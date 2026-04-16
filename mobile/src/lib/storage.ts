import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Alert } from '@/types';

const ALERTS_KEY = 'edubudy_alerts';

export async function loadAlerts(): Promise<Alert[]> {
  try {
    const raw = await AsyncStorage.getItem(ALERTS_KEY);
    return raw ? (JSON.parse(raw) as Alert[]) : [];
  } catch {
    return [];
  }
}

export async function saveAlert(alert: Alert): Promise<void> {
  const alerts = await loadAlerts();
  alerts.unshift(alert);
  await AsyncStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
}

export async function acknowledgeAlert(alertId: string): Promise<void> {
  const alerts = await loadAlerts();
  const updated = alerts.map((a) => a.id === alertId ? { ...a, acknowledged: true } : a);
  await AsyncStorage.setItem(ALERTS_KEY, JSON.stringify(updated));
}

export async function getUnreadCount(): Promise<number> {
  const alerts = await loadAlerts();
  return alerts.filter((a) => !a.acknowledged).length;
}
