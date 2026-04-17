import * as FileSystem from 'expo-file-system';

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
  error?: { message?: string };
}

export async function transcribeWithGemini(audioUri: string, geminiApiKey: string): Promise<string> {
  // Lire le fichier audio en base64 (fonctionne avec les URI locaux expo-av)
  const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inlineData: { mimeType: 'audio/mp4', data: base64Audio } },
            { text: 'Transcris exactement ce qui est dit dans cet audio en français. Retourne uniquement la transcription, sans aucun commentaire ni formatage.' },
          ],
        }],
        generationConfig: { temperature: 0 },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json() as GeminiResponse;
    throw new Error(err.error?.message ?? `Gemini error ${response.status}`);
  }

  const data = await response.json() as GeminiResponse;
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
}
