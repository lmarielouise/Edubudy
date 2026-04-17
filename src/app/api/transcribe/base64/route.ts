import { NextRequest, NextResponse } from 'next/server';
import { validateApiSecret, unauthorized } from '@/lib/auth';

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { message?: string };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!validateApiSecret(req)) return unauthorized();

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) return NextResponse.json({ error: 'GEMINI_API_KEY manquante' }, { status: 503 });

  const { audio, mimeType } = (await req.json()) as { audio: string; mimeType?: string };
  if (!audio) return NextResponse.json({ error: 'Audio manquant' }, { status: 400 });

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [
          { inlineData: { mimeType: mimeType ?? 'audio/mp4', data: audio } },
          { text: 'Transcris exactement ce qui est dit dans cet audio en français. Retourne uniquement la transcription, sans commentaire.' },
        ]}],
        generationConfig: { temperature: 0 },
      }),
    }
  );

  const data = await res.json() as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
  return NextResponse.json({ text });
}
