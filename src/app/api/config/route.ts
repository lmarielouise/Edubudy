import { NextResponse } from 'next/server';
import { readSettings } from '@/lib/settings';

// Endpoint public — retourne la config enfant (sans données sensibles)
export async function GET(): Promise<NextResponse> {
  const s = readSettings();
  return NextResponse.json({
    configured: s.configured,
    childName: s.childName,
    childAge: s.childAge,
    schoolLevel: s.schoolLevel,
    mascot: s.mascot,
    theme: s.theme,
    voiceSpeed: s.voiceSpeed,
    enableVoiceResponse: s.enableVoiceResponse,
    subjectsOfFocus: s.subjectsOfFocus,
  });
}
