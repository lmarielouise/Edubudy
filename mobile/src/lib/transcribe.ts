import * as FileSystem from 'expo-file-system';

export async function transcribeWithServer(
  audioUri: string,
  serverUrl: string,
  apiSecret: string,
): Promise<string> {
  // Lire en base64 pour envoyer via JSON (évite les problèmes FormData sur certains serveurs)
  const base64 = await FileSystem.readAsStringAsync(audioUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const response = await fetch(`${serverUrl}/api/transcribe/base64`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-secret': apiSecret },
    body: JSON.stringify({ audio: base64, mimeType: 'audio/mp4' }),
  });

  if (!response.ok) throw new Error(`Transcription error ${response.status}`);
  const data = await response.json() as { text?: string };
  return data.text?.trim() ?? '';
}
