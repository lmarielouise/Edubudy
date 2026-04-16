import { NextResponse } from 'next/server';
import type { AppConfig } from '@/types';

export async function GET(): Promise<NextResponse<AppConfig>> {
  return NextResponse.json({
    childName: process.env.CHILD_NAME ?? 'Mon enfant',
    childAge: parseInt(process.env.CHILD_AGE ?? '10'),
    schoolLevel: (process.env.CHILD_SCHOOL_LEVEL ?? 'CM2') as AppConfig['schoolLevel'],
    parentEmail: process.env.PARENT_EMAIL ?? '',
  });
}
