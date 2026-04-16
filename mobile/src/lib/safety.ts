import type { SafetyCategory, SafetySeverity } from '@/types';

export const SAFETY_CONFIG: Record<Exclude<SafetyCategory, 'NONE'>, {
  label: string;
  icon: string;
  severity: SafetySeverity;
  color: string;
  childResponse: (name: string) => string;
  parentAdvice: string;
  resources: string[];
}> = {
  HARCELEMENT: {
    label: 'Harcèlement scolaire',
    icon: '🟠',
    severity: 'HIGH',
    color: '#ea580c',
    childResponse: (name) => `${name}, je t'entends et c'est important. Tu n'es pas seul(e). La meilleure chose c'est d'en parler à un adulte en qui tu as confiance — un parent, un prof que tu aimes bien. Est-ce qu'il y a quelqu'un à qui tu pourrais en parler aujourd'hui ?`,
    parentAdvice: `Votre enfant a mentionné des éléments pouvant indiquer du harcèlement scolaire.

ÉTAPES IMMÉDIATES :
1. Créez un moment calme pour lui parler sans jugement : "Je veux qu'on parle de comment tu te sens à l'école."
2. Écoutez sans interrompre. Ne minimisez pas ("c'est normal entre enfants").
3. Notez les faits : dates, lieux, personnes, nature des actes.
4. Contactez l'enseignant(e) ou le CPE dès le lendemain.
5. Si répétition : signalement auprès du chef d'établissement (écrit recommandé).

À NE PAS FAIRE : confronter vous-même l'enfant harceleur ou ses parents sans médiation.`,
    resources: ['📞 3020 — Harcèlement scolaire (gratuit)', '🌐 nonauharcelement.education.gouv.fr'],
  },
  AGRESSION_SEXUELLE: {
    label: 'Agression sexuelle',
    icon: '🔴',
    severity: 'CRITICAL',
    color: '#dc2626',
    childResponse: (name) => `${name}, merci de me faire confiance. Ce que tu m'as dit est très important et ce n'est pas de ta faute — jamais. Il faut absolument en parler à un de tes parents maintenant. Tu mérites d'être protégé(e). Peux-tu aller les voir tout de suite ?`,
    parentAdvice: `⚠️ ALERTE CRITIQUE — Éléments pouvant indiquer une agression sexuelle.

ACTION IMMÉDIATE :
1. RESTEZ CALME face à votre enfant.
2. CROYEZ-LE sans hésiter : "Je te crois. Ce n'est pas de ta faute."
3. NE L'INTERROGEZ PAS vous-même (risque juridique).
4. CONSULTEZ un médecin dans les 24h (certificat médical).
5. SIGNALEZ : appelez le 119 ou rendez-vous à la gendarmerie/commissariat.
6. Consultez un pédopsychiatre rapidement.`,
    resources: ['📞 119 — Enfance en danger (24h/24)', '📞 3020 — Harcèlement', '🌐 enfance-et-partage.org'],
  },
  IDEATION_SUICIDAIRE: {
    label: 'Pensées suicidaires',
    icon: '🔴',
    severity: 'CRITICAL',
    color: '#dc2626',
    childResponse: (name) => `${name}, ce que tu ressens est réel et important. Ta vie compte énormément. Quand on a des pensées comme ça, il faut en parler à quelqu'un qui peut vraiment aider — un de tes parents ou un médecin. Tu n'es pas obligé(e) de porter ça seul(e). Il y a aussi le 3114, des gens formés écoutent 24h/24.`,
    parentAdvice: `⚠️ ALERTE CRITIQUE — Votre enfant a exprimé des pensées pouvant indiquer une idéation suicidaire.

ACTION IMMÉDIATE :
1. REJOIGNEZ VOTRE ENFANT maintenant. Ne le laissez pas seul.
2. PARLEZ-LUI directement et calmement : "Est-ce que tu penses parfois que tu voudrais ne plus être là ?"
   → Poser la question n'aggrave pas la situation — c'est prouvé.
3. ÉCOUTEZ sans juger, sans minimiser ("tu as tout pour être heureux").
4. CONTACTEZ aujourd'hui : médecin traitant ou urgences pédopsychiatriques.`,
    resources: ['📞 3114 — Prévention suicide (24h/24, gratuit)', '📞 15 — SAMU', '🌐 psycom.org'],
  },
  VIOLENCE: {
    label: 'Violence',
    icon: '🟠',
    severity: 'HIGH',
    color: '#ea580c',
    childResponse: (name) => `${name}, ce que tu vis n'est pas normal et ce n'est pas de ta faute. Tu mérites d'être en sécurité. Parle-en à un adulte de confiance — un parent, un professeur. Tu peux aussi appeler le 119, c'est gratuit et anonyme.`,
    parentAdvice: `Votre enfant a mentionné des éléments pouvant indiquer une situation de violence.

ÉTAPES RECOMMANDÉES :
1. Parlez à votre enfant dans un cadre privé et sécurisant.
2. Évaluez : violence subie ? Témoin ? Dans quel contexte ?
3. Si danger immédiat : appelez le 17 (police) ou le 15 (SAMU).
4. Si violence scolaire : contactez l'établissement et le CPE.
5. Consultez un professionnel de santé pour évaluer l'impact psychologique.`,
    resources: ['📞 119 — Enfance en danger', '📞 17 — Police secours', '📞 3020 — Harcèlement scolaire'],
  },
  DETRESSE_EMOTIONNELLE_SEVERE: {
    label: 'Détresse émotionnelle',
    icon: '🟡',
    severity: 'MEDIUM',
    color: '#d97706',
    childResponse: (name) => `${name}, je t'entends. Ce que tu ressens est réel. Parler à quelqu'un qu'on aime peut vraiment aider — un parent, un ami proche. Tu n'as pas à traverser ça seul(e). Est-ce qu'il y a quelqu'un à qui tu pourrais parler aujourd'hui ?`,
    parentAdvice: `Votre enfant exprime une détresse émotionnelle importante.

APPROCHE RECOMMANDÉE :
1. Trouvez un moment calme, sans téléphone ni distractions.
2. Validez ses émotions : "Je vois que tu traverses quelque chose de difficile."
3. Posez des questions ouvertes : "Qu'est-ce qui te préoccupe le plus ?"
4. Ne cherchez pas à résoudre immédiatement — l'écoute active suffit souvent.
5. Si cela dure ou impacte son quotidien (sommeil, appétit, école) : consultez un professionnel.`,
    resources: ['📞 0 800 235 236 — Fil Santé Jeunes (gratuit)', '🌐 psycom.org — Trouver un psychologue'],
  },
};
