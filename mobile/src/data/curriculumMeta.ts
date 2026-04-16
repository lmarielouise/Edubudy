import type { SchoolLevel } from '@/types';

interface CurriculumMeta { cycle: string; programDetails: string }

const META: Record<SchoolLevel, CurriculumMeta> = {
  CP:  { cycle: 'Cycle 2', programDetails: 'Lecture syllabique, écriture cursive, nombres 0-100, addition/soustraction simples, découverte du monde.' },
  CE1: { cycle: 'Cycle 2', programDetails: 'Lecture fluide, production de textes courts, grammaire (nom/verbe/phrase), présent indicatif, nombres jusqu\'à 1000, multiplication (initiation).' },
  CE2: { cycle: 'Cycle 2', programDetails: 'Textes littéraires et documentaires, rédaction, GN/GV, passé composé/futur, nombres jusqu\'à 10000, 4 opérations, fractions simples, géométrie (périmètre, symétrie).' },
  CM1: { cycle: 'Cycle 3', programDetails: 'Lecture d\'œuvres jeunesse, récits, analyse de phrase simple, conjugaison complète, grands nombres, fractions et décimaux, proportionnalité, géométrie plane, Histoire (Préhistoire→Antiquité), Géographie France, Anglais A1.' },
  CM2: { cycle: 'Cycle 3', programDetails: 'Textes patrimoniaux, expression écrite argumentée, phrase complexe, fractions/décimaux/pourcentages, géométrie dans l\'espace, statistiques, Révolution française, France en Europe, Anglais A1-A2, EMC.' },
  '6eme': { cycle: 'Cycle 3', programDetails: 'Antiquité et Moyen Âge (Français), nombres relatifs, calcul littéral (initiation), géométrie (cercle, transformations), Terre dans le système solaire, lumière/matière (PC), Grèce/Rome/Europe (Histoire), Technologie/Scratch.' },
  '5eme': { cycle: 'Cycle 4', programDetails: 'Renaissance, argumentation (Français), équations 1er degré, théorème de Pythagore, statistiques, électricité (PC), corps humain/biodiversité (SVT), XVe-XVIIIe s. (Histoire), mondialisation (Géo).' },
  '4eme': { cycle: 'Cycle 4', programDetails: 'Roman/poésie XIXe s., fonctions linéaires/affines, théorème de Thalès, probabilités, réactions chimiques/énergie (PC), génétique/évolution (SVT), Révolution/XIXe s. (Histoire), territoires mondiaux (Géo).' },
  '3eme': { cycle: 'Cycle 4', programDetails: 'Récit de formation/théâtre, argumentation, brevet, équations/inéquations, trigonométrie, probabilités, chimie organique (PC), corps humain/mutations (SVT), XXe s./guerres (Histoire), France/Europe/enjeux (Géo), EMC/démocratie.' },
  '2nde': { cycle: 'Lycée', programDetails: 'Littérature XVIe-XXIe s., commentaire/dissertation (Français), fonctions (variations, extremums), droites/vecteurs, probabilités/stats, constitution matière/atomes (PC), génétique (SVT), monde depuis 1945 (Histoire-Géo), SNT, SES.' },
  '1ere': { cycle: 'Lycée', programDetails: 'Œuvres au programme pour épreuve anticipée, spécialités (Maths : dérivées/probabilités ; PC : thermodynamique ; SVT : immunologie/génétique ; SES ; HGGSP), Grand Oral (préparation).' },
  Terminale: { cycle: 'Lycée', programDetails: 'Philosophie (conscience/liberté/justice/art/État), 2 spécialités retenues (Maths : intégrales/probabilités conditionnelles ; PC : mécanique/chimie organique ; SVT : immunologie/neurologie), Grand Oral.' },
};

export function getCurriculumForLevel(level: SchoolLevel): CurriculumMeta {
  return META[level];
}

export function getSchoolLevelLabel(level: SchoolLevel): string {
  const labels: Record<SchoolLevel, string> = {
    CP: 'CP', CE1: 'CE1', CE2: 'CE2', CM1: 'CM1', CM2: 'CM2',
    '6eme': '6ème', '5eme': '5ème', '4eme': '4ème', '3eme': '3ème',
    '2nde': '2nde', '1ere': '1ère', Terminale: 'Terminale',
  };
  return labels[level];
}

export const ALL_LEVELS: SchoolLevel[] = [
  'CP','CE1','CE2','CM1','CM2','6eme','5eme','4eme','3eme','2nde','1ere','Terminale',
];
