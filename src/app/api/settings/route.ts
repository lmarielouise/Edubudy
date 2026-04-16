import { NextRequest, NextResponse } from 'next/server';
import { readSettings, writeSettings } from '@/lib/settings';
import type { AppSettings } from '@/lib/settings';

export async function GET(): Promise<NextResponse> {
  const settings = readSettings();
  // Never expose PIN to the client
  const { parentPin: _, ...safe } = settings;
  return NextResponse.json(safe);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as Partial<AppSettings> & { currentPin?: string };
  const existing = readSettings();

  // If already configured, require the current PIN
  if (existing.configured) {
    const pin = req.headers.get('x-parent-pin') ?? body.currentPin;
    if (pin !== existing.parentPin) {
      return NextResponse.json({ error: 'Code PIN incorrect' }, { status: 401 });
    }
  }

  const updated: AppSettings = {
    ...existing,
    ...body,
    configured: true,
  };

  // Basic validation
  if (!updated.childName?.trim()) {
    return NextResponse.json({ error: 'Prénom requis' }, { status: 400 });
  }
  if (!updated.parentPin || updated.parentPin.length < 4) {
    return NextResponse.json({ error: 'PIN doit comporter au moins 4 chiffres' }, { status: 400 });
  }

  writeSettings(updated);
  const { parentPin: _, ...safe } = updated;
  return NextResponse.json(safe);
}
