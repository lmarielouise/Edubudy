import { NextRequest, NextResponse } from 'next/server';
import { readAlerts, acknowledgeAlert, getUnacknowledgedCount } from '@/lib/storage';
import type { Alert } from '@/types';

function checkPin(req: NextRequest): boolean {
  const pin = req.headers.get('x-parent-pin') ?? req.nextUrl.searchParams.get('pin');
  const configuredPin = process.env.PARENT_PIN ?? '1234';
  return pin === configuredPin;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!checkPin(req)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 401 });
  }

  const alerts: Alert[] = readAlerts();
  const unread = getUnacknowledgedCount();

  return NextResponse.json({ alerts, unread });
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  if (!checkPin(req)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 401 });
  }

  const { alertId } = (await req.json()) as { alertId: string };
  const success = acknowledgeAlert(alertId);

  if (!success) {
    return NextResponse.json({ error: 'Alerte introuvable' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
