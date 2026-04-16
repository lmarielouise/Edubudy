import type { SchoolLevel } from '@/types';

interface CurriculumInfo {
  cycle: string;
  ageRange: string;
  subjects: string[];
  programDetails: string;
}

const CURRICULUM: Record<SchoolLevel, CurriculumInfo> = {
  CP: {
    cycle: 'Cycle 2',
    ageRange: '6-7 ans',
    subjects: ['Français', 'Mathématiques', 'Découverte du monde', 'Arts plastiques', 'EPS'],
    programDetails: `
FRANÇAIS: Apprentissage de la lecture par décodage (correspondances graphème-phonème), écriture cursive, copie de mots et phrases simples, compréhension de textes courts, premiers sons et syllabes.
MATHÉMATIQUES: Nombres de 0 à 100, addition et soustraction simples, suites numériques, premiers solides et figures géométriques, notions de mesure (longueur, masse).
DÉCOUVERTE DU MONDE: Le temps (hier/aujourd'hui/demain), l'espace (se repérer), les êtres vivants, les matières.`,
  },
  CE1: {
    cycle: 'Cycle 2',
    ageRange: '7-8 ans',
    subjects: ['Français', 'Mathématiques', 'Découverte du monde', 'Arts', 'EPS'],
    programDetails: `
FRANÇAIS: Lecture fluide de textes variés, production de textes courts, grammaire (nom, verbe, phrase), conjugaison (présent de l'indicatif), orthographe de mots courants.
MATHÉMATIQUES: Nombres jusqu'à 1000, addition et soustraction posées, introduction à la multiplication, mesures (longueur, masse, contenance), géométrie (figures planes).
DÉCOUVERTE DU MONDE: Temps (jours, mois, saisons), espaces proches, êtres vivants et leur milieu.`,
  },
  CE2: {
    cycle: 'Cycle 2',
    ageRange: '8-9 ans',
    subjects: ['Français', 'Mathématiques', 'Découverte du monde', 'Arts', 'EPS'],
    programDetails: `
FRANÇAIS: Lecture et compréhension de textes littéraires et documentaires, rédaction de textes courts, grammaire (GN, GV, types de phrases), conjugaison (présent, passé composé, futur), orthographe.
MATHÉMATIQUES: Nombres jusqu'à 10 000, quatre opérations (multiplication apprise), fractions simples (demi, quart), mesures et conversions, géométrie (périmètre, symétrie).
DÉCOUVERTE DU MONDE: Histoire des hommes, géographie locale, sciences du vivant.`,
  },
  CM1: {
    cycle: 'Cycle 3',
    ageRange: '9-10 ans',
    subjects: ['Français', 'Mathématiques', 'Sciences', 'Histoire-Géographie', 'Anglais', 'Arts'],
    programDetails: `
FRANÇAIS: Lecture d'œuvres de littérature jeunesse, rédaction de récits, grammaire (analyse de la phrase simple), conjugaison (imparfait, plus-que-parfait), orthographe grammaticale et lexicale.
MATHÉMATIQUES: Grands nombres (millions, milliards), fractions et nombres décimaux, les 4 opérations maîtrisées, proportionnalité, géométrie (angles, triangles, quadrilatères, périmètre, aire).
SCIENCES ET TECHNOLOGIE: Unité et diversité du vivant, matière et énergie (états de l'eau, mélanges), signaux et information.
HISTOIRE: De la Préhistoire à l'Antiquité, les grandes civilisations.
GÉOGRAPHIE: La France et ses régions, paysages français.
ANGLAIS LV1: Compréhension orale et écrite simple, vocabulaire de base.`,
  },
  CM2: {
    cycle: 'Cycle 3',
    ageRange: '10-11 ans',
    subjects: ['Français', 'Mathématiques', 'Sciences', 'Histoire-Géographie', 'Anglais', 'Arts', 'EMC'],
    programDetails: `
FRANÇAIS: Lecture de textes patrimoniaux et contemporains, expression écrite argumentée, grammaire (phrase complexe, propositions), conjugaison (tous temps courants), orthographe avancée.
MATHÉMATIQUES: Calcul sur fractions et décimaux, proportionnalité et pourcentages, introduction aux données statistiques, géométrie dans l'espace (volumes : cube, pavé, cylindre), angles.
SCIENCES: Mouvements et forces, électricité, le vivant et son évolution.
HISTOIRE: Du Moyen Âge à la Révolution française.
GÉOGRAPHIE: La France en Europe, mondialisation.
ANGLAIS: Interactions simples, textes courts, vocabulaire thématique.
EMC: Respect, laïcité, droits de l'enfant.`,
  },
  '6eme': {
    cycle: 'Cycle 3',
    ageRange: '11-12 ans',
    subjects: ['Français', 'Mathématiques', 'Sciences', 'Histoire-Géographie-EMC', 'Anglais', 'LV2', 'Arts', 'EPS', 'Technologie'],
    programDetails: `
FRANÇAIS: Littérature de l'Antiquité et du Moyen Âge, récit d'aventure, grammaire de la phrase complexe, conjugaison complète, orthographe et vocabulaire.
MATHÉMATIQUES: Nombres relatifs, fractions et opérations, calcul littéral (introduction), géométrie (triangles, cercle, transformations), données et probabilités (initiation).
SCIENCES DE LA VIE ET DE LA TERRE: La Terre dans le système solaire, la géologie, le vivant et sa diversité.
PHYSIQUE-CHIMIE: Lumière et couleurs, les états de la matière, mélanges et solutions.
HISTOIRE-GÉOGRAPHIE: L'Orient ancien, la Grèce, Rome, l'Europe et le monde habité.
TECHNOLOGIE: Découverte des systèmes techniques, numérique et programmation (Scratch).
ANGLAIS: Niveau A1-A2.`,
  },
  '5eme': {
    cycle: 'Cycle 4',
    ageRange: '12-13 ans',
    subjects: ['Français', 'Mathématiques', 'Physique-Chimie', 'SVT', 'Histoire-Géographie-EMC', 'Anglais', 'LV2', 'Arts', 'EPS', 'Technologie'],
    programDetails: `
FRANÇAIS: Récit au Moyen Âge et à la Renaissance, argumentation, grammaire avancée (voix passive, discours indirect), stylistique.
MATHÉMATIQUES: Calcul littéral et équations du 1er degré, proportionnalité, théorème de Pythagore, transformations (translation, rotation), statistiques.
PHYSIQUE-CHIMIE: Électricité (circuits, tensions, intensité), propriétés des matériaux.
SVT: Fonctionnement du corps humain (digestion, respiration), biodiversité, géologie dynamique.
HISTOIRE: Du XVe au XVIIIe siècle (grandes découvertes, Lumières).
GÉOGRAPHIE: Dynamiques de la mondialisation.`,
  },
  '4eme': {
    cycle: 'Cycle 4',
    ageRange: '13-14 ans',
    subjects: ['Français', 'Mathématiques', 'Physique-Chimie', 'SVT', 'Histoire-Géographie-EMC', 'Anglais', 'LV2', 'Arts', 'EPS', 'Technologie'],
    programDetails: `
FRANÇAIS: Roman et nouvelles (XIXe s.), poésie, analyse de texte littéraire, dissertation simple.
MATHÉMATIQUES: Puissances et racines carrées, systèmes d'équations, fonctions linéaires/affines, théorème de Thalès, géométrie dans l'espace, statistiques et probabilités.
PHYSIQUE-CHIMIE: Mouvements, vitesse, réactions chimiques, énergie.
SVT: Reproduction sexuée, génétique, évolution, immunologie.
HISTOIRE: Révolution française, XIXe siècle, colonisation.
GÉOGRAPHIE: Les territoires dans la mondialisation.`,
  },
  '3eme': {
    cycle: 'Cycle 4',
    ageRange: '14-15 ans',
    subjects: ['Français', 'Mathématiques', 'Physique-Chimie', 'SVT', 'Histoire-Géographie-EMC', 'Anglais', 'LV2', 'Arts', 'EPS', 'Technologie'],
    programDetails: `
FRANÇAIS: Récit de formation, théâtre, argumentation (essai, discours), préparation au brevet (commentaire, rédaction).
MATHÉMATIQUES: Développements et factorisations, équations et inéquations, fonctions, Pythagore et Thalès appliqués, trigonométrie (initiation), statistiques, probabilités.
PHYSIQUE-CHIMIE: Forces, pression, lumière, chimie organique (introduction).
SVT: Corps humain, nerfs, hormones, génétique et mutations.
HISTOIRE: XXe siècle (guerres mondiales, décolonisation, Guerre froide).
GÉOGRAPHIE: France et Europe, enjeux mondiaux.
EMC: Démocratie, citoyenneté, engagement.`,
  },
  '2nde': {
    cycle: 'Lycée',
    ageRange: '15-16 ans',
    subjects: ['Français', 'Mathématiques', 'Physique-Chimie', 'SVT', 'Histoire-Géographie-EMC', 'Anglais', 'LV2', 'EPS', 'SES', 'SNT'],
    programDetails: `
FRANÇAIS: Littérature du XVIe au XXIe siècle, genres et formes (roman, poésie, théâtre), commentaire composé, dissertation.
MATHÉMATIQUES: Fonctions (dérivées, variations), équations et inéquations, géométrie analytique, statistiques et probabilités, suites (initiation).
PHYSIQUE-CHIMIE: Constitution et transformations de la matière, mouvement et forces, ondes.
SVT: Génétique, évolution, géologie.
HISTOIRE-GÉOGRAPHIE: Le monde depuis 1945, enjeux géopolitiques.
SES: Marchés, institutions, sociologie.
SNT: Données numériques, web, réseaux, algorithmes.`,
  },
  '1ere': {
    cycle: 'Lycée',
    ageRange: '16-17 ans',
    subjects: ['Français', 'Philosophie (initiation)', 'Histoire-Géographie-EMC', 'Anglais', 'LV2', 'EPS', 'Spécialités (3)'],
    programDetails: `
FRANÇAIS (épreuve anticipée): 4 œuvres au programme (roman, poésie, théâtre, littérature d'idées), commentaire et dissertation.
SPÉCIALITÉS COURANTES: Mathématiques (fonctions, probabilités, algèbre), Physique-Chimie (thermodynamique, électromagnétisme), SVT (génétique, immunologie), SES, HGGSP, Humanités.
HISTOIRE-GÉOGRAPHIE: Histoire et mémoire, espaces et sociétés.
GRAND ORAL: Préparation (première approche).`,
  },
  Terminale: {
    cycle: 'Lycée',
    ageRange: '17-18 ans',
    subjects: ['Philosophie', 'Histoire-Géographie-EMC', 'Anglais', 'LV2', 'EPS', 'Spécialités (2)', 'Grand Oral'],
    programDetails: `
PHILOSOPHIE: Les grandes notions (conscience, liberté, justice, art, État, vérité…), dissertation.
SPÉCIALITÉS (2 retenues):
  - MATHS: Suites, intégrales, probabilités conditionnelles, géométrie vectorielle.
  - PHYSIQUE-CHIMIE: Mécanique, thermodynamique, chimie organique, optique.
  - SVT: Immunologie, neurologie, évolution, génétique.
  - SES: Macroéconomie, sociologie, science politique.
GRAND ORAL: Présentation de 2 projets liés aux spécialités, argumentation.
HISTOIRE-GÉO: Mondes en recomposition, gouvernance mondiale.`,
  },
};

export function getCurriculumForLevel(level: SchoolLevel): CurriculumInfo {
  return CURRICULUM[level];
}

export function getSchoolLevelLabel(level: SchoolLevel): string {
  const labels: Record<SchoolLevel, string> = {
    CP: 'CP',
    CE1: 'CE1',
    CE2: 'CE2',
    CM1: 'CM1',
    CM2: 'CM2',
    '6eme': '6ème',
    '5eme': '5ème',
    '4eme': '4ème',
    '3eme': '3ème',
    '2nde': '2nde',
    '1ere': '1ère',
    Terminale: 'Terminale',
  };
  return labels[level];
}

export const ALL_LEVELS: SchoolLevel[] = [
  'CP', 'CE1', 'CE2', 'CM1', 'CM2',
  '6eme', '5eme', '4eme', '3eme',
  '2nde', '1ere', 'Terminale',
];
