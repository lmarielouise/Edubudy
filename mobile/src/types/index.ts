export type SchoolLevel =
  | 'CP' | 'CE1' | 'CE2'
  | 'CM1' | 'CM2'
  | '6eme' | '5eme' | '4eme' | '3eme'
  | '2nde' | '1ere' | 'Terminale';

export type SafetyCategory =
  | 'HARCELEMENT'
  | 'AGRESSION_SEXUELLE'
  | 'IDEATION_SUICIDAIRE'
  | 'VIOLENCE'
  | 'DETRESSE_EMOTIONNELLE_SEVERE'
  | 'NONE';

export type SafetySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  safetyFlag?: SafetyCategory;
}

export interface Alert {
  id: string;
  timestamp: string;
  category: SafetyCategory;
  severity: SafetySeverity;
  triggerMessage: string;
  childName: string;
  parentAdvice: string;
  resources: string[];
  acknowledged: boolean;
}

export interface SafetyCheckResult {
  flagged: boolean;
  category: SafetyCategory;
  severity: SafetySeverity;
  reasoning: string;
}
