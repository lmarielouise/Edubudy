import type { SchoolLevel } from '@/types';
import { retrieveRelevantEntries } from '@/data/curriculum';
import { getCurriculumForLevel, getSchoolLevelLabel } from '@/data/curriculumMeta';

interface ApiMessage { role: 'user' | 'assistant'; content: string }

function buildSystemPrompt(childName: string, childAge: number, schoolLevel: SchoolLevel, userMessage: string): string {
  const curriculum = getCurriculumForLevel(schoolLevel);
  const levelLabel = getSchoolLevelLabel(schoolLevel);
  const ragEntries = retrieveRelevantEntries(userMessage, schoolLevel);

  const ragSection = ragEntries.length > 0
    ? `\n\n━━━ RÉFÉRENTIEL PROGRAMME OFFICIEL ━━━\nBase-toi STRICTEMENT sur ce contenu pour répondre.\n\n${ragEntries
        .map(e => `[${e.subject} — ${e.topic}]\nProgramme : ${e.programContent}\nGuide pédagogique : ${e.pedagogyTips}`)
        .join('\n\n')}`
    : '';

  return `Tu es Edubudy, l'assistant pédagogique de ${childName}, ${childAge} ans, en classe de ${levelLabel} (${curriculum.cycle}).

━━━ MÉTHODE SOCRATIQUE (OBLIGATOIRE) ━━━
NE DONNE JAMAIS la réponse directement. Toujours :
1. Demande ce que ${childName} a déjà compris
2. Identifie le blocage par des questions
3. Guide avec des questions progressives
4. Valide les bonnes intuitions

━━━ PROGRAMME — ${levelLabel} ━━━
${curriculum.programDetails}

━━━ SUPPORT ÉMOTIONNEL ━━━
Pour les questions sociales/émotionnelles : valide les émotions, utilise la CNV (Rosenberg), renforce l'estime de soi (Seligman). Pour les sujets sérieux, oriente toujours vers un adulte de confiance.

━━━ RÈGLES ━━━
- Toujours en français
- Réponses courtes (3-5 phrases)
- Jamais de réponse directe à un exercice
- Ne jamais inventer des notions hors programme${ragSection}`;
}

export async function getChatResponse(
  message: string,
  history: ApiMessage[],
  childName: string,
  childAge: number,
  schoolLevel: SchoolLevel,
  apiKey: string,
): Promise<string> {
  const systemPrompt = buildSystemPrompt(childName, childAge, schoolLevel, message);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: systemPrompt,
      messages: [...history, { role: 'user', content: message }],
    }),
  });

  if (!response.ok) {
    const err = await response.json() as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `API error ${response.status}`);
  }

  const data = await response.json() as { content: Array<{ type: string; text: string }> };
  return data.content[0]?.text ?? '';
}

export async function runSafetyCheck(message: string, apiKey: string): Promise<{
  flagged: boolean;
  category: string;
  severity: string;
}> {
  const systemPrompt = `Tu es un système de détection de sécurité pour une app enfant.
Analyse le message et détecte : HARCELEMENT, AGRESSION_SEXUELLE, IDEATION_SUICIDAIRE, VIOLENCE, DETRESSE_EMOTIONNELLE_SEVERE, NONE.
Réponds UNIQUEMENT en JSON valide : {"flagged":bool,"category":"...","severity":"LOW|MEDIUM|HIGH|CRITICAL"}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 150,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
      }),
    });
    const data = await response.json() as { content: Array<{ text: string }> };
    return JSON.parse(data.content[0]?.text ?? '{}') as { flagged: boolean; category: string; severity: string };
  } catch {
    return { flagged: false, category: 'NONE', severity: 'LOW' };
  }
}

export async function transcribeAudio(audioUri: string, openaiKey: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', { uri: audioUri, type: 'audio/m4a', name: 'recording.m4a' } as unknown as Blob);
  formData.append('model', 'whisper-1');
  formData.append('language', 'fr');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${openaiKey}` },
    body: formData,
  });

  if (!response.ok) throw new Error(`Whisper error ${response.status}`);
  const data = await response.json() as { text: string };
  return data.text ?? '';
}
