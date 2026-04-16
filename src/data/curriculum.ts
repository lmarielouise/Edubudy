import type { SchoolLevel } from '@/types';

export interface CurriculumEntry {
  id: string;
  levels: SchoolLevel[];
  subject: string;
  topic: string;
  keywords: string[];
  programContent: string;
  pedagogyTips: string;
}

// Basé sur les Bulletins Officiels de l'Éducation Nationale française
export const CURRICULUM_ENTRIES: CurriculumEntry[] = [
  // ─── MATHÉMATIQUES — NOMBRES ────────────────────────────────────────────
  {
    id: 'math-fractions-cycle3',
    levels: ['CM1', 'CM2', '6eme'],
    subject: 'Mathématiques',
    topic: 'Fractions',
    keywords: ['fraction', 'fractions', 'numérateur', 'dénominateur', 'demi', 'tiers', 'quart', 'cinquième', 'sixième', 'huitième', 'dixième', 'moitié', 'partager', 'partage'],
    programContent: `BO Cycle 3 — Nombres et calculs : Utiliser les fractions comme quotient et pour exprimer une mesure. Comparer, encadrer des fractions simples. Passer d'une écriture fractionnaire à une écriture décimale. Placer des fractions sur une droite graduée. Additionner et soustraire des fractions de même dénominateur.`,
    pedagogyTips: `Commence par demander ce que représente une fraction pour l'élève. Utilise des situations concrètes (partage de pizza, de chocolat). Guide vers la notion de numérateur (combien de parts) et dénominateur (en combien de parts égales). Pour comparer, demande d'abord de dessiner.`,
  },
  {
    id: 'math-decimaux-cycle3',
    levels: ['CM1', 'CM2', '6eme'],
    subject: 'Mathématiques',
    topic: 'Nombres décimaux',
    keywords: ['décimal', 'décimaux', 'virgule', 'dixième', 'centième', 'millième', 'partie entière', 'partie décimale', '0,5', 'comparer', 'ordonner'],
    programContent: `BO Cycle 3 — Nombres et calculs : Comprendre et utiliser la numération décimale de position. Lire, écrire, comparer, ranger des nombres décimaux. Repérer et placer des nombres décimaux sur une droite graduée. Effectuer des calculs sur des nombres décimaux.`,
    pedagogyTips: `Demande d'abord ce que signifie le chiffre après la virgule. Utilise l'analogie des euros et centimes. Guide vers la valeur positionnelle (unités, dixièmes, centièmes). Pour comparer, guide l'élève à aligner les virgules.`,
  },
  {
    id: 'math-operations-cycle2',
    levels: ['CP', 'CE1', 'CE2'],
    subject: 'Mathématiques',
    topic: 'Addition et soustraction',
    keywords: ['addition', 'additionner', 'soustraction', 'soustraire', 'retenue', 'emprunt', 'calcul posé', 'somme', 'différence', 'plus', 'moins', 'ajouter', 'enlever'],
    programContent: `BO Cycle 2 — Nombres et calculs : Calculer des sommes et des différences en ligne ou posées. Utiliser des stratégies de calcul mental. Comprendre les sens de la soustraction (enlever, compléter, comparer). Calculer avec la retenue/emprunt jusqu'à 1000.`,
    pedagogyTips: `Commence par faire représenter le calcul avec des jetons ou dessins. Pour la retenue, demande ce qui se passe quand on a plus de 9 dans une colonne. Guide l'élève à poser correctement les chiffres les uns sous les autres.`,
  },
  {
    id: 'math-multiplication-cycle3',
    levels: ['CE2', 'CM1', 'CM2'],
    subject: 'Mathématiques',
    topic: 'Multiplication',
    keywords: ['multiplication', 'multiplier', 'tables', 'produit', 'facteur', 'fois', 'multiple', 'divisible', 'calcul posé', 'technique opératoire'],
    programContent: `BO Cycle 3 — Nombres et calculs : Mémoriser les tables de multiplication jusqu'à 9×9. Calculer des produits par 10, 100, 1000. Effectuer des multiplications posées (jusqu'à 4 chiffres par 2 chiffres). Utiliser la multiplication dans des problèmes de proportionnalité.`,
    pedagogyTips: `Demande quelles tables l'élève connaît déjà. Pour la multiplication posée, guide vers le fait de multiplier chaque chiffre séparément. Demande de vérifier par une estimation (arrondi).`,
  },
  {
    id: 'math-division-cycle3',
    levels: ['CM1', 'CM2', '6eme'],
    subject: 'Mathématiques',
    topic: 'Division',
    keywords: ['division', 'diviser', 'quotient', 'reste', 'diviseur', 'dividende', 'euclidienne', 'partager', 'répartir'],
    programContent: `BO Cycle 3 — Nombres et calculs : Calculer des quotients et des restes dans la division euclidienne. Effectuer une division posée. Comprendre la relation : dividende = diviseur × quotient + reste. Utiliser la division dans des problèmes de proportionnalité et de mesure.`,
    pedagogyTips: `Commence par un problème concret (partager des billes en groupes égaux). Guide vers la question "combien de fois diviseur entre dans dividende ?". Pour le reste, fais visualiser ce qu'il reste après le partage.`,
  },
  {
    id: 'math-proportionnalite-cycle3',
    levels: ['CM1', 'CM2', '6eme'],
    subject: 'Mathématiques',
    topic: 'Proportionnalité',
    keywords: ['proportionnalité', 'proportionnel', 'tableau', 'règle de trois', 'coefficient', 'rapport', 'échelle', 'pourcentage', 'recette', 'vitesse'],
    programContent: `BO Cycle 3 — Grandeurs et mesures : Reconnaître et résoudre des problèmes de proportionnalité. Utiliser un tableau de proportionnalité. Calculer un quatrième proportionnel. Appliquer aux échelles, aux recettes, aux vitesses, aux pourcentages.`,
    pedagogyTips: `Commence par demander ce que signifie "proportionnel" dans la vie quotidienne (doubler une recette). Guide vers le coefficient multiplicateur. Utilise un tableau à compléter.`,
  },
  {
    id: 'math-geometrie-cycle3',
    levels: ['CM1', 'CM2', '6eme'],
    subject: 'Mathématiques',
    topic: 'Géométrie plane — figures et propriétés',
    keywords: ['triangle', 'carré', 'rectangle', 'parallélogramme', 'losange', 'cercle', 'polygone', 'angle', 'droite', 'parallèle', 'perpendiculaire', 'axe de symétrie', 'symétrie'],
    programContent: `BO Cycle 3 — Espace et géométrie : Reconnaître, nommer et décrire les figures planes. Utiliser les propriétés des triangles (isocèle, équilatéral, rectangle). Repérer les axes de symétrie. Construire avec équerre et compas. Notion d'angle droit, aigu, obtus.`,
    pedagogyTips: `Demande de décrire la figure avant de nommer ses propriétés. Guide vers les questions : "combien de côtés égaux ? d'angles droits ?". Pour la construction, guide étape par étape avec les outils.`,
  },
  {
    id: 'math-perimetre-aire-cycle3',
    levels: ['CM1', 'CM2', '6eme'],
    subject: 'Mathématiques',
    topic: 'Périmètre et aire',
    keywords: ['périmètre', 'aire', 'surface', 'unité d\'aire', 'cm²', 'm²', 'mm²', 'mesurer', 'calculer', 'contour', 'rectangle', 'carré', 'triangle'],
    programContent: `BO Cycle 3 — Grandeurs et mesures : Différencier périmètre et aire. Calculer le périmètre de polygones. Calculer l'aire d'un rectangle, d'un carré, d'un triangle rectangle. Utiliser les unités d'aire. Comprendre que deux figures de même périmètre peuvent avoir des aires différentes.`,
    pedagogyTips: `Demande la différence entre le tour d'une figure et sa surface. Utilise l'analogie : périmètre = clôture d'un jardin, aire = surface du jardin. Guide vers les formules en demandant ce qu'on multiplie.`,
  },
  {
    id: 'math-equations-cycle4',
    levels: ['5eme', '4eme', '3eme'],
    subject: 'Mathématiques',
    topic: 'Équations du premier degré',
    keywords: ['équation', 'résoudre', 'inconnue', 'variable', 'solution', 'membre', 'transposer', 'isoler', 'vérifier', 'premier degré'],
    programContent: `BO Cycle 4 — Algèbre : Modéliser et résoudre des problèmes par des équations du premier degré à une inconnue. Utiliser les propriétés d'égalité (ajouter, soustraire, multiplier, diviser le même nombre). Tester et justifier qu'un nombre est solution. Produire une égalité de la forme ax+b=cx+d.`,
    pedagogyTips: `Demande d'abord ce que "résoudre" signifie (trouver la valeur de l'inconnue). Guide vers l'idée de balance équilibrée. Demande ce qu'on peut faire des deux côtés sans rompre l'équilibre.`,
  },
  {
    id: 'math-pythagore-cycle4',
    levels: ['4eme', '3eme'],
    subject: 'Mathématiques',
    topic: 'Théorème de Pythagore',
    keywords: ['pythagore', 'hypoténuse', 'triangle rectangle', 'côtés', 'carré', 'racine carrée', 'réciproque', 'distance'],
    programContent: `BO Cycle 4 — Géométrie : Dans un triangle rectangle, le carré de l'hypoténuse est égal à la somme des carrés des deux autres côtés. Utiliser le théorème pour calculer la longueur d'un côté. Utiliser la réciproque pour démontrer qu'un triangle est rectangle.`,
    pedagogyTips: `Commence par demander ce qu'est l'hypoténuse (le côté le plus long, en face de l'angle droit). Guide vers la formule en demandant quelles mesures on connaît et ce qu'on cherche. Fais toujours un schéma.`,
  },
  {
    id: 'math-fonctions-2nde',
    levels: ['2nde', '1ere'],
    subject: 'Mathématiques',
    topic: 'Fonctions — généralités',
    keywords: ['fonction', 'image', 'antécédent', 'courbe', 'représentation graphique', 'tableau de valeurs', 'variation', 'croissante', 'décroissante', 'linéaire', 'affine', 'domaine'],
    programContent: `BO 2nde — Fonctions : Notion de fonction, notation f(x). Image et antécédent. Tableau de valeurs. Représentation graphique. Fonctions de référence : linéaire (x↦ax), affine (x↦ax+b). Sens de variation. Extremum sur un intervalle.`,
    pedagogyTips: `Demande ce que signifie "image de 3 par f". Guide vers le fait qu'une fonction associe à chaque entrée une seule sortie. Utilise l'analogie d'une machine qui transforme des valeurs.`,
  },

  // ─── FRANÇAIS — GRAMMAIRE ────────────────────────────────────────────────
  {
    id: 'fr-nature-mots-cycle3',
    levels: ['CM1', 'CM2', '6eme'],
    subject: 'Français',
    topic: 'Nature des mots (classes grammaticales)',
    keywords: ['nom', 'verbe', 'adjectif', 'article', 'pronom', 'adverbe', 'préposition', 'conjonction', 'déterminant', 'interjection', 'classe grammaticale', 'nature', 'mot'],
    programContent: `BO Cycle 3 — Étude de la langue : Identifier les classes grammaticales : nom (commun/propre), déterminant (article, possessif, démonstratif…), adjectif qualificatif, pronom (personnel, relatif…), verbe, adverbe, préposition, conjonction de coordination. Utiliser la terminologie.`,
    pedagogyTips: `Demande à l'élève ce qu'il sait déjà sur les classes de mots. Guide par questions : "Ce mot désigne-t-il une action, une chose, une qualité ?". Fais trouver la classe par substitution ou transformation.`,
  },
  {
    id: 'fr-fonctions-cycle4',
    levels: ['5eme', '4eme', '3eme'],
    subject: 'Français',
    topic: 'Fonctions syntaxiques',
    keywords: ['sujet', 'verbe', 'complément', 'cod', 'coi', 'attribut', 'épithète', 'circonstanciel', 'fonction', 'analyse', 'groupe nominal', 'groupe verbal'],
    programContent: `BO Cycle 4 — Étude de la langue : Identifier les fonctions : sujet, prédicat, compléments du verbe (COD, COI, COS), complément circonstanciel, attribut du sujet, épithète, apposition. Analyser la phrase en groupes fonctionnels.`,
    pedagogyTips: `Commence par demander comment trouver le sujet (poser la question "qui est-ce qui… ?"). Guide vers chaque fonction par la question correspondante. Ne donne pas les définitions directement.`,
  },
  {
    id: 'fr-conjugaison-present',
    levels: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'],
    subject: 'Français',
    topic: 'Conjugaison — présent de l\'indicatif',
    keywords: ['présent', 'conjugaison', 'conjuguer', 'terminaisons', 'personne', 'verbe', 'groupe', '1er groupe', '2e groupe', '3e groupe', 'être', 'avoir', 'aller', 'faire'],
    programContent: `BO Cycles 2 et 3 — Étude de la langue : Conjuguer au présent de l'indicatif les verbes des 1er et 2e groupes, et les verbes irréguliers fréquents (être, avoir, aller, faire, pouvoir, vouloir, venir, dire, prendre). Identifier le radical et les terminaisons.`,
    pedagogyTips: `Demande de donner l'infinitif du verbe pour identifier son groupe. Guide vers les terminaisons en demandant ce qui change selon la personne. Fais trouver le radical en enlevant la terminaison.`,
  },
  {
    id: 'fr-conjugaison-passe',
    levels: ['CE2', 'CM1', 'CM2', '6eme', '5eme'],
    subject: 'Français',
    topic: 'Conjugaison — passé composé et imparfait',
    keywords: ['passé composé', 'imparfait', 'auxiliaire', 'participe passé', 'accord', 'avoir', 'être', 'terminaisons', 'ait', 'aient', 'passé'],
    programContent: `BO Cycle 3 — Étude de la langue : Passé composé (auxiliaire être ou avoir + participe passé ; accord du PP avec sujet pour être). Imparfait (terminaisons -ais, -ais, -ait, -ions, -iez, -aient). Différencier leur emploi : passé composé pour action accomplie, imparfait pour état ou action en cours.`,
    pedagogyTips: `Demande dans quel cas on utilise chaque temps. Guide vers la distinction : "action précise et terminée" vs "état ou habitude dans le passé". Pour le choix de l'auxiliaire, guide avec la question "le verbe exprime-t-il un déplacement ou un changement d'état ?".`,
  },
  {
    id: 'fr-accord-gn',
    levels: ['CE1', 'CE2', 'CM1', 'CM2', '6eme'],
    subject: 'Français',
    topic: 'Accords dans le groupe nominal',
    keywords: ['accord', 'genre', 'nombre', 'masculin', 'féminin', 'singulier', 'pluriel', 'adjectif', 'nom', 'déterminant', 'groupe nominal'],
    programContent: `BO Cycle 2 et 3 — Étude de la langue : Dans le groupe nominal, le déterminant et l'adjectif s'accordent en genre et en nombre avec le nom noyau. Règles de formation du féminin et du pluriel des noms et adjectifs.`,
    pedagogyTips: `Demande de trouver le nom noyau du groupe. Guide vers l'idée que tout "s'adapte" au nom. Fais donner le genre et le nombre du nom avant de trouver les accords.`,
  },
  {
    id: 'fr-types-phrases',
    levels: ['CP', 'CE1', 'CE2', 'CM1'],
    subject: 'Français',
    topic: 'Types et formes de phrases',
    keywords: ['phrase', 'déclarative', 'interrogative', 'exclamative', 'impérative', 'négative', 'affirmative', 'ponctuation', 'point', 'point d\'interrogation', 'point d\'exclamation'],
    programContent: `BO Cycle 2 — Étude de la langue : Les types de phrases : déclarative, interrogative, exclamative, injonctive/impérative. Les formes : affirmative et négative. Utiliser la ponctuation adaptée. Transformer une phrase d'un type à l'autre.`,
    pedagogyTips: `Commence par demander à quoi sert chaque type de phrase dans la vie réelle. Guide vers les indices formels (ponctuation, ordre des mots). Fais transformer une même idée dans les 4 types.`,
  },
  {
    id: 'fr-comprehension-lecture',
    levels: ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6eme', '5eme', '4eme', '3eme'],
    subject: 'Français',
    topic: 'Compréhension de texte',
    keywords: ['comprendre', 'texte', 'lecture', 'personnage', 'résumé', 'idée principale', 'passage', 'implicite', 'explicite', 'inférence', 'titre', 'auteur', 'narrateur'],
    programContent: `BO Cycles 2, 3, 4 — Lecture et compréhension : Lire et comprendre des textes variés (narratifs, documentaires, poétiques). Identifier l'idée principale. Repérer les informations explicites et implicites. Faire des inférences. Résumer. Identifier le narrateur, le point de vue.`,
    pedagogyTips: `Ne réponds jamais à une question sur un texte à la place de l'élève. Demande d'abord : "Qu'as-tu déjà compris ?". Guide vers les indices dans le texte. Pose des questions sur les passages clés.`,
  },

  // ─── SCIENCES DE LA VIE ET DE LA TERRE ──────────────────────────────────
  {
    id: 'svt-vivant-cycle3',
    levels: ['CM1', 'CM2', '6eme'],
    subject: 'Sciences',
    topic: 'Diversité du vivant et classification',
    keywords: ['vivant', 'classification', 'animal', 'végétal', 'champignon', 'micro-organisme', 'cellule', 'vertébré', 'invertébré', 'mammifère', 'insecte', 'espèce', 'biodiversité'],
    programContent: `BO Cycle 3 — Sciences : Identifier des critères de classification des êtres vivants. Distinguer vertébrés et invertébrés. Classer mammifères, oiseaux, poissons, reptiles, amphibiens. Comprendre la notion d'espèce. Relier la biodiversité aux milieux de vie.`,
    pedagogyTips: `Demande quels êtres vivants l'élève peut citer. Guide vers la question : "Qu'est-ce qui les distingue ?". Pour la classification, guide vers les critères partagés (os ou pas, poils, naissance…).`,
  },
  {
    id: 'svt-corps-humain-cycle4',
    levels: ['5eme', '4eme', '3eme'],
    subject: 'Sciences',
    topic: 'Le corps humain — systèmes et fonctions',
    keywords: ['digestion', 'respiration', 'circulation', 'système nerveux', 'organe', 'muscle', 'squelette', 'sang', 'poumon', 'cœur', 'estomac', 'intestin', 'neurone'],
    programContent: `BO Cycle 4 — SVT : Fonctionnement du corps humain : systèmes digestif (de la bouche au côlon), respiratoire (poumons, échanges gazeux), circulatoire (cœur, artères, veines). Relations entre les systèmes. Rôle des nutriments et du dioxygène dans la production d'énergie.`,
    pedagogyTips: `Commence par demander à l'élève ce qu'il pense qu'il se passe quand on mange/respire. Guide vers l'idée de transformation et transport des nutriments/gaz. Fais établir les liens entre les systèmes.`,
  },
  {
    id: 'svt-genetique-cycle4',
    levels: ['3eme', '2nde', '1ere'],
    subject: 'Sciences',
    topic: 'Génétique et hérédité',
    keywords: ['gène', 'ADN', 'chromosome', 'hérédité', 'mutation', 'allèle', 'dominant', 'récessif', 'phénotype', 'génotype', 'reproduction', 'cellule'],
    programContent: `BO Cycle 4 / Lycée : L'ADN porte l'information génétique. Les gènes sont des segments d'ADN. Chaque individu possède 2 allèles par gène (diploïdie). Transmission héréditaire. Notion de mutation. Au lycée : lois de Mendel, expression des gènes.`,
    pedagogyTips: `Demande d'abord ce que l'élève comprend par "hérédité". Guide vers la question : "Pourquoi ressemble-t-on à nos parents ?". Construis depuis la cellule vers le chromosome, vers l'ADN, vers le gène.`,
  },

  // ─── PHYSIQUE-CHIMIE ─────────────────────────────────────────────────────
  {
    id: 'pc-etats-matiere',
    levels: ['6eme', '5eme'],
    subject: 'Physique-Chimie',
    topic: 'États de la matière et changements d\'état',
    keywords: ['solide', 'liquide', 'gaz', 'fusion', 'solidification', 'vaporisation', 'condensation', 'sublimation', 'température', 'changement d\'état', 'eau'],
    programContent: `BO Cycle 4 — PC : Distinguer les trois états de la matière par leurs propriétés (forme, volume). Identifier les changements d'état et leurs conditions (température). Cas de l'eau : 0°C (fusion/solidification), 100°C (ébullition/condensation). Conservation de la masse lors d'un changement d'état.`,
    pedagogyTips: `Demande à l'élève de citer des exemples de chaque état. Guide vers les différences de forme et volume. Pour les changements, demande ce qui varie (température) et ce qui se conserve (masse).`,
  },
  {
    id: 'pc-electricite-cycle4',
    levels: ['5eme', '4eme'],
    subject: 'Physique-Chimie',
    topic: 'Électricité — circuit électrique',
    keywords: ['circuit', 'électrique', 'courant', 'tension', 'intensité', 'résistance', 'générateur', 'récepteur', 'série', 'dérivation', 'volt', 'ampère', 'ohm', 'interrupteur', 'lampe'],
    programContent: `BO Cycle 4 — PC : Modéliser un circuit électrique simple. Distinguer circuit en série et en dérivation. Mesurer tension (voltmètre) et intensité (ampèremètre). Loi des mailles, loi des nœuds. Loi d'Ohm U=RI.`,
    pedagogyTips: `Commence par demander comment l'élève représente un circuit. Guide vers la distinction série/dérivation en demandant ce qui se passe si on enlève un élément. Pour les lois, fais des mesures imaginaires.`,
  },

  // ─── HISTOIRE ───────────────────────────────────────────────────────────
  {
    id: 'hist-revolution-cm2',
    levels: ['CM2', '4eme'],
    subject: 'Histoire',
    topic: 'La Révolution française',
    keywords: ['révolution', 'révolution française', '1789', 'roi', 'monarchie', 'république', 'déclaration', 'droits de l\'homme', 'liberté', 'égalité', 'états généraux', 'bastille', 'louis xvi'],
    programContent: `BO Cycle 3 (CM2) / Cycle 4 (4ème) : La Révolution française (1789) : crise de l'Ancien Régime, convocation des États généraux, prise de la Bastille, Déclaration des droits de l'Homme et du citoyen, abolition des privilèges, Première République. Causes économiques, sociales, politiques.`,
    pedagogyTips: `Demande ce que l'élève sait déjà sur 1789. Guide vers les causes (inégalités, famine, pouvoir absolu). Pour les événements, fais établir une chronologie en demandant "qu'est-ce qui a provoqué quoi ?".`,
  },
  {
    id: 'hist-ww2-3eme',
    levels: ['3eme'],
    subject: 'Histoire',
    topic: 'Seconde Guerre mondiale',
    keywords: ['seconde guerre mondiale', 'ww2', 'nazisme', 'hitler', 'holocauste', 'shoah', 'résistance', 'collaboration', 'vichy', 'liberation', 'débarquement', '1939', '1945', 'génocide'],
    programContent: `BO Cycle 4 (3ème) : Les origines de la guerre (montée des totalitarismes, crise de 1929). Le régime nazi et l'antisémitisme. La Shoah. La France sous l'Occupation : régime de Vichy, collaboration, Résistance. Le débarquement (1944) et la Libération. Bilan humain et géopolitique.`,
    pedagogyTips: `Commence par demander ce que l'élève sait sur cette période. Guide vers la distinction entre les différentes positions des Français (résistance, collaboration, indifférence). Pour la Shoah, guide vers les étapes d'exclusion progressive.`,
  },

  // ─── GÉOGRAPHIE ──────────────────────────────────────────────────────────
  {
    id: 'geo-france-cm2',
    levels: ['CM2', '6eme'],
    subject: 'Géographie',
    topic: 'La France — territoire et organisation',
    keywords: ['france', 'territoire', 'capitale', 'paris', 'région', 'département', 'frontière', 'relief', 'fleuve', 'montagne', 'alpes', 'pyrénées', 'métropole', 'dom-tom', 'outre-mer'],
    programContent: `BO Cycle 3 : La France métropolitaine et les territoires d'Outre-Mer. Les grandes régions. Reliefs principaux (Alpes, Massif central, Pyrénées, Jura, Vosges). Grands fleuves (Loire, Rhône, Seine, Garonne, Rhin). Densités de population. Paris, capitale et métropole mondiale.`,
    pedagogyTips: `Commence par faire situer la France sur une carte. Guide vers les reliefs puis les fleuves en posant des questions sur la direction d'écoulement. Pour les régions, guide par les caractéristiques géographiques et humaines.`,
  },
  {
    id: 'geo-mondialisation-3eme',
    levels: ['4eme', '3eme', '2nde'],
    subject: 'Géographie',
    topic: 'Mondialisation et inégalités',
    keywords: ['mondialisation', 'échanges', 'commerce', 'inégalités', 'nord', 'sud', 'développement', 'pib', 'idh', 'multinationale', 'flux', 'metropole', 'mégapole'],
    programContent: `BO Cycle 4 : La mondialisation, processus d'intensification des flux (marchandises, personnes, capitaux, informations). Les inégalités mondiales (pays développés, émergents, PMA). Rôle des firmes transnationales. Les métropoles mondiales, nœuds de la mondialisation.`,
    pedagogyTips: `Commence par demander ce que l'élève comprend par "mondialisation". Guide vers des exemples concrets (l'origine des vêtements qu'il porte). Fais établir la différence entre flux et acteurs.`,
  },
];

export function retrieveRelevantEntries(
  userMessage: string,
  level: SchoolLevel,
  topK = 3,
): CurriculumEntry[] {
  const messageTokens = userMessage
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .split(/\s+/);

  const levelEntries = CURRICULUM_ENTRIES.filter((e) => e.levels.includes(level));

  const scored = levelEntries.map((entry) => {
    const entryKeywords = entry.keywords.map((k) =>
      k.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
    );
    const subjectNorm = entry.subject.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
    const topicNorm = entry.topic.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

    let score = 0;
    for (const token of messageTokens) {
      if (token.length < 3) continue;
      if (entryKeywords.some((k) => k.includes(token) || token.includes(k))) score += 2;
      if (subjectNorm.includes(token)) score += 1;
      if (topicNorm.includes(token)) score += 1;
    }
    return { entry, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.entry);
}
