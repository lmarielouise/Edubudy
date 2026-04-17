import { NextRequest, NextResponse } from 'next/server';

export function validateApiSecret(req: NextRequest): boolean {
  const secret = req.headers.get('x-api-secret');
  return !!process.env.API_SECRET && secret === process.env.API_SECRET;
}

export function validateParentPin(req: NextRequest): boolean {
  const pin = req.headers.get('x-parent-pin') ?? req.nextUrl.searchParams.get('pin');
  return !!pin && pin === (process.env.PARENT_PIN ?? '1234');
}

export function unauthorized(): NextResponse {
  return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
}
