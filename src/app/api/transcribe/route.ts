import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY non configurée' }, { status: 503 });
  }

  const formData = await req.formData();
  const audioFile = formData.get('audio') as File | null;

  if (!audioFile) {
    return NextResponse.json({ error: 'Aucun fichier audio reçu' }, { status: 400 });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Whisper accepts: mp3, mp4, m4a, wav, webm — iOS envoie audio/mp4
  const ext = audioFile.type.includes('mp4') ? 'm4a' : 'webm';
  const file = new File([await audioFile.arrayBuffer()], `recording.${ext}`, { type: audioFile.type });

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    language: 'fr',
  });

  return NextResponse.json({ text: transcription.text });
}
