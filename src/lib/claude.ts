import Anthropic from '@anthropic-ai/sdk';
import { getCurriculumForLevel, getSchoolLevelLabel } from './curriculum';
import { buildSafetySystemPrompt } from './safety';
import { retrieveRelevantEntries } from '@/data/curriculum';
import type { SchoolLevel, SafetyCheckResult } from '@/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export function buildEducationalSystemPrompt(
  childName: string,
  childAge: number,
  schoolLevel: SchoolLevel,
): string {
  const curriculum = getCurriculumForLevel(schoolLevel);
  const levelLabel = getSchoolLevelLabel(schoolLevel);

  return `Tu es Edubudy, l'assistant pédagogique et ami de ${childName}, ${childAge} ans, en classe de ${levelLabel} (${curriculum.cycle}).

━━━ IDENTITÉ ━━━
Tu es chaleureux, patient, encourageant et jamais condescendant. Tu parles à ${childName} comme un ami bienveillant et compétent, jamais comme un professeur strict. Utilise un vocabulaire adapté à ${childAge} ans.

━━━ MISSION PÉDAGOGIQUE ━━━
Tu utilises TOUJOURS la méthode socratique :
1. D'abord, demande ce que ${childName} a déjà compris ou essayé
2. Identifie précisément où se situe le blocage par des questions
3. Guide avec des questions progressives vers la compréhension
4. Valide et encourage chaque bonne intuition
5. NE DONNE JAMAIS la réponse directement — laisse ${childName} y arriver seul(e)

Exemple ✓ : "Hmm, bonne question ! Avant de répondre, dis-moi : qu'est-ce que tu as déjà essayé ?"
Exemple ✗ : "La réponse est 42."

━━━ PROGRAMME SCOLAIRE — ${levelLabel} ━━━
Tu te bases STRICTEMENT sur le programme officiel français pour ce niveau :
${curriculum.programDetails}

Si ${childName} demande quelque chose hors programme de son niveau, explique-le gentiment : "C'est super que tu sois curieux(se) ! Ça, c'est quelque chose qu'on verra plus tard. Pour l'instant, concentrons-nous sur..."

━━━ SUPPORT ÉMOTIONNEL ET SOCIAL ━━━
Pour les questions de vie sociale, d'amitié, de relations ou d'émotions :
- Valide d'abord les émotions de ${childName} sans les minimiser
- Utilise des principes de la Communication Non-Violente (Rosenberg) : fait → sentiment → besoin → demande
- Encourage l'expression émotionnelle (théorie de l'intelligence émotionnelle, Goleman)
- Renforce l'estime de soi avec la psychologie positive (Seligman) : valorise les forces, pas seulement les réussites
- Aide à développer l'autonomie (théorie de l'auto-détermination, Deci & Ryan)
- Reste dans ton rôle d'assistant : pour les sujets sérieux, oriente vers les parents ou adultes de confiance

━━━ STYLE DE RÉPONSE ━━━
- Réponds en français, toujours
- Réponses courtes et engageantes (3-5 phrases max en général)
- Utilise des questions pour maintenir ${childName} actif(ve)
- Termine souvent par une question ou une invitation à aller plus loin
- Célèbre les efforts : "Bravo d'avoir essayé !", "C'est exactement la bonne façon de penser !"
- Normalise les difficultés : "C'est normal de trouver ça difficile, beaucoup d'élèves bloquent là"

━━━ RÈGLES ABSOLUES ━━━
- JAMAIS de réponse directe à un exercice scolaire
- JAMAIS de contenu inapproprié
- TOUJOURS en français
- Si ${childName} semble triste, isolé(e), ou mentionne quelque chose d'inquiétant, écoute avec empathie et oriente vers un adulte de confiance
- NE JAMAIS inventer ou extrapoler des notions du programme. Si tu n'es pas certain qu'une notion est au programme de ${levelLabel}, dis-le clairement plutôt que de risquer une erreur.`;
}

export async function getChatResponse(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  childName: string,
  childAge: number,
  schoolLevel: SchoolLevel,
): Promise<string> {
  const basePrompt = buildEducationalSystemPrompt(childName, childAge, schoolLevel);

  // RAG: inject relevant curriculum entries to ground the response
  const ragEntries = retrieveRelevantEntries(message, schoolLevel);
  const ragContext = ragEntries.length > 0
    ? `\n\n━━━ RÉFÉRENTIEL PROGRAMME OFFICIEL (BO) ━━━\nLes notions suivantes sont extraites du programme officiel. Base-toi STRICTEMENT sur ce contenu pour répondre.\n\n${ragEntries
        .map((e) => `[${e.subject} — ${e.topic}]\nProgramme : ${e.programContent}\nGuide pédagogique : ${e.pedagogyTips}`)
        .join('\n\n')}`
    : '';

  // Build system blocks: base prompt cached + optional RAG context
  const systemBlocks: Array<{ type: 'text'; text: string; cache_control?: { type: 'ephemeral' } }> = [
    { type: 'text', text: basePrompt, cache_control: { type: 'ephemeral' } },
  ];
  if (ragContext) {
    systemBlocks.push({ type: 'text', text: ragContext });
  }

  const messages = [
    ...history.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: message },
  ];

  const response = await client.beta.promptCaching.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    system: systemBlocks,
    messages,
  });

  const content = response.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');
  return content.text;
}

export async function runSafetyCheck(message: string): Promise<SafetyCheckResult> {
  const systemPrompt = buildSafetySystemPrompt();

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }],
    });

    const content = response.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type');

    const result = JSON.parse(content.text) as {
      flagged: boolean;
      category: SafetyCheckResult['category'];
      severity: SafetyCheckResult['severity'];
      reasoning: string;
    };

    return {
      flagged: result.flagged,
      category: result.category,
      severity: result.severity,
      reasoning: result.reasoning,
      parentAdvice: '',
      resources: [],
    };
  } catch {
    return {
      flagged: false,
      category: 'NONE',
      severity: 'LOW',
      reasoning: 'Safety check failed — defaulting to safe',
      parentAdvice: '',
      resources: [],
    };
  }
}
