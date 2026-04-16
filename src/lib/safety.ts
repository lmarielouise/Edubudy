import type { SafetyCategory, SafetyCheckResult, SafetySeverity } from '@/types';

const SAFETY_ADVICE: Record<Exclude<SafetyCategory, 'NONE'>, {
  parentAdvice: string;
  resources: string[];
  severity: SafetySeverity;
}> = {
  HARCELEMENT: {
    severity: 'HIGH',
    parentAdvice: `Votre enfant a mentionné des éléments pouvant indiquer du harcèlement scolaire.

ÉTAPES IMMÉDIATES :
1. Créez un moment calme pour lui parler sans jugement. Commencez par : "J'ai envie qu'on parle de comment tu te sens à l'école en ce moment."
2. Écoutez sans interrompre. Ne minimisez pas ("c'est normal entre enfants") et ne dramatisez pas.
3. Notez par écrit les faits : dates, lieux, personnes impliquées, nature des actes.
4. Contactez l'enseignant(e) ou le CPE dès le lendemain pour un rendez-vous.
5. Si les faits se répètent, déposez un signalement auprès du chef d'établissement (courrier recommandé).

APPROCHE PSYCHOLOGIQUE RECOMMANDÉE :
Selon les travaux de Dan Olweus (pionnier de la recherche anti-harcèlement), restez du côté de l'enfant sans prendre de décision à sa place. Renforcez son sentiment de sécurité et de valeur propre.

À NE PAS FAIRE : confronter vous-même l'enfant harceleur ou ses parents sans médiation.`,
    resources: [
      '3020 - Numéro national harcèlement scolaire (gratuit)',
      'www.nonauharcelement.education.gouv.fr',
      'www.e-enfance.org - Accompagnement des familles',
    ],
  },
  AGRESSION_SEXUELLE: {
    severity: 'CRITICAL',
    parentAdvice: `⚠️ ALERTE CRITIQUE — Votre enfant a mentionné des éléments pouvant indiquer une agression sexuelle ou un attouchement.

ACTION IMMÉDIATE REQUISE :

1. RESTEZ CALME face à votre enfant. Votre réaction influence sa capacité à parler.
2. CROYEZ-LE sans hésiter. Ne posez pas de questions suggestives ; dites simplement : "Je te crois. Tu as bien fait de me dire ça. Ce n'est pas de ta faute."
3. NE L'INTERROGEZ PAS vous-même (risque de contamination de témoignage pour la justice).
4. CONSULTEZ un médecin ou pédiatre dans les 24h pour un examen et un certificat.
5. SIGNALEZ aux autorités : appelez le 119 (Enfance en danger) ou rendez-vous au commissariat/gendarmerie.

SOUTIEN PSYCHOLOGIQUE :
L'enfant doit être pris en charge par un professionnel spécialisé (pédopsychiatre ou psychologue clinicien). Ne laissez pas le temps passer sans aide professionnelle.

Références : Recommandations de la HAS (Haute Autorité de Santé) sur la prise en charge des enfants victimes de violences sexuelles.`,
    resources: [
      '119 - Enfance en danger (24h/24, gratuit)',
      '3020 - Harcèlement scolaire',
      'www.enfance-et-partage.org',
      'CRIAVS - Centre ressource pour les intervenants auprès des auteurs de violences sexuelles',
      'www.stop-violences-femmes.gouv.fr/Les-violences-faites-aux-enfants',
    ],
  },
  IDEATION_SUICIDAIRE: {
    severity: 'CRITICAL',
    parentAdvice: `⚠️ ALERTE CRITIQUE — Votre enfant a exprimé des pensées pouvant indiquer une idéation suicidaire.

ACTION IMMÉDIATE REQUISE :

1. REJOIGNEZ VOTRE ENFANT maintenant. Ne le laissez pas seul.
2. PARLEZ-LUI DIRECTEMENT et calmement : "Je veux qu'on parle de ce que tu ressens en ce moment. Est-ce que tu penses parfois que tu voudrais ne plus être là ?"
   ➜ Poser la question ne "donne pas l'idée" — c'est prouvé scientifiquement. Cela ouvre le dialogue.
3. ÉCOUTEZ sans juger, sans minimiser, sans réprimander.
4. CONTACTEZ une aide professionnelle aujourd'hui :
   - Médecin traitant ou pédiatre (en urgence)
   - Pédopsychiatre (consultations d'urgence possibles)
   - Service des urgences si risque immédiat

APPROCHE RECOMMANDÉE :
Selon les protocoles de prévention du suicide chez l'enfant (AFSP, OMS), l'écoute non-jugeante et la présence physique sont les premiers outils. Évitez les formules comme "tu as tout pour être heureux" ou "pense à nous".`,
    resources: [
      '3114 - Numéro national prévention suicide (24h/24, gratuit)',
      '15 - SAMU (urgence médicale)',
      'www.psycom.org - Trouver un pédopsychiatre',
      'www.filsantejeunes.com',
      '0 800 235 236 - Fil Santé Jeunes',
    ],
  },
  VIOLENCE: {
    severity: 'HIGH',
    parentAdvice: `Votre enfant a mentionné des éléments pouvant indiquer une situation de violence (physique, verbale ou psychologique).

ÉTAPES RECOMMANDÉES :
1. Parlez à votre enfant dans un cadre privé et sécurisant. Demandez-lui de vous raconter ce qu'il a vécu ou vu.
2. Évaluez la situation : violence subie par lui ? Témoin de violence ? Violence dans le foyer ?
3. Si votre enfant est en danger immédiat, appelez le 17 (police) ou le 15 (SAMU).
4. Si c'est une violence scolaire répétée, contactez l'établissement et le CPE.
5. Consultez un professionnel de santé pour évaluer l'impact psychologique.

APPROCHE PSYCHOLOGIQUE :
D'après les travaux de Judith Herman sur le trauma, restaurer le sentiment de sécurité de l'enfant est la première priorité. Évitez les questions "pourquoi tu n'as rien dit avant ?" — cela peut induire de la culpabilité.`,
    resources: [
      '119 - Enfance en danger',
      '17 - Police secours',
      '3020 - Harcèlement scolaire',
      'www.stop-violences-femmes.gouv.fr',
    ],
  },
  DETRESSE_EMOTIONNELLE_SEVERE: {
    severity: 'MEDIUM',
    parentAdvice: `Votre enfant exprime une détresse émotionnelle importante qui mérite votre attention.

APPROCHE RECOMMANDÉE :
1. Trouvez un moment calme pour être présent(e) à 100% (sans téléphone ni distractions).
2. Commencez par valider ses émotions : "Je vois que tu traverses quelque chose de difficile en ce moment."
3. Posez des questions ouvertes : "Qu'est-ce qui te préoccupe le plus ?" Évitez les questions fermées (oui/non).
4. Ne cherchez pas à résoudre immédiatement. L'écoute active est souvent plus utile que les solutions.
5. Si cela dure depuis plusieurs semaines ou impacte sa scolarité/sommeil/appétit, consultez un professionnel.

BASES PSYCHOLOGIQUES :
Selon la théorie de l'attachement de Bowlby et les travaux de Carl Rogers sur l'écoute empathique, votre présence bienveillante et inconditionnelle est le meilleur outil thérapeutique pour l'enfant.`,
    resources: [
      '0 800 235 236 - Fil Santé Jeunes (gratuit)',
      'www.psycom.org - Trouver un psychologue',
      'Médecin traitant (peut orienter vers pédopsychiatre)',
    ],
  },
};

export function buildSafetySystemPrompt(): string {
  return `Tu es un système de détection de sécurité pour une application d'assistance pour enfants.

Analyse le message d'un enfant et détermine s'il contient des signaux d'alerte concernant :
- HARCELEMENT : harcèlement scolaire, moqueries répétées, exclusion, intimidation, cyberharcèlement
- AGRESSION_SEXUELLE : attouchements, agressions sexuelles, comportements sexuels inappropriés d'adultes ou de pairs
- IDEATION_SUICIDAIRE : envie de mourir, de "disparaître", pensées suicidaires, automutilation
- VIOLENCE : violence physique, verbale, psychologique (subie ou témoin)
- DETRESSE_EMOTIONNELLE_SEVERE : tristesse profonde persistante, isolement marqué, peur intense
- NONE : aucun signal d'alerte

Réponds UNIQUEMENT en JSON valide avec ce format exact :
{
  "flagged": boolean,
  "category": "HARCELEMENT" | "AGRESSION_SEXUELLE" | "IDEATION_SUICIDAIRE" | "VIOLENCE" | "DETRESSE_EMOTIONNELLE_SEVERE" | "NONE",
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "reasoning": "explication courte en français"
}

Sois attentif aux formulations indirectes, métaphores et minimisations ("c'est pas grave mais...", "parfois je pense que...").
Pour NONE, severity = "LOW".`;
}

export function getParentAdviceForCategory(category: Exclude<SafetyCategory, 'NONE'>): {
  parentAdvice: string;
  resources: string[];
  severity: SafetySeverity;
} {
  return SAFETY_ADVICE[category];
}

export function buildChildSafetyResponse(category: SafetyCategory, childName: string): string {
  const responses: Record<Exclude<SafetyCategory, 'NONE'>, string> = {
    HARCELEMENT: `${childName}, je t'entends et ce que tu me dis est vraiment important. Tu n'es pas seul(e) avec ça. La meilleure chose à faire maintenant, c'est d'en parler à un adulte en qui tu as confiance — un de tes parents, un professeur que tu aimes bien, ou le CPE. Ils peuvent vraiment t'aider. Est-ce qu'il y a un adulte autour de toi à qui tu pourrais en parler aujourd'hui ?`,
    AGRESSION_SEXUELLE: `${childName}, merci de m'avoir fait confiance pour me dire ça. C'est très courageux. Ce qui s'est passé n'est pas de ta faute — jamais. Il faut absolument que tu en parles à un de tes parents ou à un adulte de confiance maintenant. Je veux que tu saches que tu mérites d'être protégé(e) et aidé(e). Peux-tu aller voir un de tes parents tout de suite ?`,
    IDEATION_SUICIDAIRE: `${childName}, ce que tu ressens en ce moment est réel et je veux que tu saches que ta vie compte énormément. Quand on a des pensées comme ça, il est très important d'en parler à quelqu'un qui peut vraiment t'aider — un de tes parents, ou un médecin. Tu n'es pas obligé(e) de porter ça tout seul(e). Peux-tu aller voir un adulte de confiance maintenant ? Il y a aussi le 3114, un numéro où des gens formés pour écouter répondent 24h/24.`,
    VIOLENCE: `${childName}, ce que tu vis (ou ce que tu as vu) n'est pas normal et ce n'est pas de ta faute. Tu mérites d'être en sécurité. Il faut en parler à un adulte de confiance — un parent, un professeur, ou tu peux appeler le 119 (c'est gratuit et anonyme). Est-ce qu'il y a quelqu'un autour de toi qui peut t'aider ?`,
    DETRESSE_EMOTIONNELLE_SEVERE: `${childName}, je t'entends. Ce que tu ressens est réel et important. Quand on se sent comme ça, parler à quelqu'un qu'on aime peut vraiment aider — un parent, un ami proche, ou un adulte de confiance. Tu n'as pas à traverser ça tout seul(e). Est-ce qu'il y a quelqu'un à qui tu pourrais parler aujourd'hui ?`,
  };
  return responses[category as Exclude<SafetyCategory, 'NONE'>];
}
