import { NextRequest, NextResponse } from 'next/server';

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
  error?: { message?: string };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY non configurée' }, { status: 503 });
  }

  const formData = await req.formData();
  const audioFile = formData.get('audio') as File | null;
  if (!audioFile) return NextResponse.json({ error: 'Aucun fichier audio reçu' }, { status: 400 });

  const buffer = await audioFile.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const mimeType = audioFile.type || 'audio/mp4';

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inlineData: { mimeType, data: base64 } },
            { text: 'Transcris exactement ce qui est dit dans cet audio en français. Retourne uniquement la transcription, sans aucun commentaire ni formatage.' },
          ],
        }],
        generationConfig: { temperature: 0 },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json() as GeminiResponse;
    return NextResponse.json({ error: err.error?.message ?? 'Gemini error' }, { status: 500 });
  }

  const data = await response.json() as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
  return NextResponse.json({ text });
}
