interface ApiMessage { role: 'user' | 'assistant'; content: string }

export async function getChatResponse(
  message: string,
  history: ApiMessage[],
  serverUrl: string,
  apiSecret: string,
): Promise<{ reply: string; safetyFlag?: string }> {
  const res = await fetch(`${serverUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-secret': apiSecret },
    body: JSON.stringify({ message, history }),
  });

  if (!res.ok) {
    const err = await res.json() as { error?: string };
    throw new Error(err.error ?? `Erreur serveur ${res.status}`);
  }

  return res.json() as Promise<{ reply: string; safetyFlag?: string }>;
}
