import { NextRequest, NextResponse } from 'next/server';
import { readAlerts, acknowledgeAlert, getUnacknowledgedCount } from '@/lib/storage';
import { validateParentPin, validateApiSecret, unauthorized } from '@/lib/auth';
import { initDb } from '@/lib/db';
import type { Alert } from '@/types';

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Accessible via PIN (parent web) ou API_SECRET (mobile)
  if (!validateParentPin(req) && !validateApiSecret(req)) return unauthorized();
  await initDb();
  const alerts: Alert[] = await readAlerts();
  const unread = await getUnacknowledgedCount();
  return NextResponse.json({ alerts, unread });
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  if (!validateParentPin(req) && !validateApiSecret(req)) return unauthorized();
  await initDb();
  const { alertId } = (await req.json()) as { alertId: string };
  const success = await acknowledgeAlert(alertId);
  if (!success) return NextResponse.json({ error: 'Alerte introuvable' }, { status: 404 });
  return NextResponse.json({ success: true });
}
