import fs from 'fs';
import path from 'path';
import type { Alert } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const ALERTS_FILE = path.join(DATA_DIR, 'alerts.json');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readAlerts(): Alert[] {
  ensureDataDir();
  if (!fs.existsSync(ALERTS_FILE)) return [];
  try {
    const raw = fs.readFileSync(ALERTS_FILE, 'utf-8');
    return JSON.parse(raw) as Alert[];
  } catch {
    return [];
  }
}

export function writeAlerts(alerts: Alert[]): void {
  ensureDataDir();
  fs.writeFileSync(ALERTS_FILE, JSON.stringify(alerts, null, 2), 'utf-8');
}

export function saveAlert(alert: Alert): void {
  const alerts = readAlerts();
  alerts.unshift(alert);
  writeAlerts(alerts);
}

export function acknowledgeAlert(alertId: string): boolean {
  const alerts = readAlerts();
  const idx = alerts.findIndex((a) => a.id === alertId);
  if (idx === -1) return false;
  alerts[idx].acknowledged = true;
  writeAlerts(alerts);
  return true;
}

export function getUnacknowledgedCount(): number {
  return readAlerts().filter((a) => !a.acknowledged).length;
}
