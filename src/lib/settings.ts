// Tous les paramètres viennent des variables d'environnement Vercel
import type { SchoolLevel } from '@/types';

export interface AppSettings {
  configured: boolean;
  childName: string;
  childAge: number;
  schoolLevel: SchoolLevel;
  parentEmail: string;
  parentPin: string;
  mascot: 'owl' | 'robot' | 'star' | 'cat';
  theme: 'blue' | 'green' | 'purple' | 'orange';
  voiceSpeed: number;
  enableVoiceResponse: boolean;
  subjectsOfFocus: string[];
}

export function readSettings(): AppSettings {
  return {
    configured: !!(process.env.ANTHROPIC_API_KEY && process.env.CHILD_NAME),
    childName: process.env.CHILD_NAME ?? 'Mon enfant',
    childAge: parseInt(process.env.CHILD_AGE ?? '10'),
    schoolLevel: (process.env.CHILD_SCHOOL_LEVEL ?? 'CM2') as SchoolLevel,
    parentEmail: process.env.PARENT_EMAIL ?? '',
    parentPin: process.env.PARENT_PIN ?? '1234',
    mascot: (process.env.MASCOT ?? 'owl') as AppSettings['mascot'],
    theme: (process.env.THEME ?? 'blue') as AppSettings['theme'],
    voiceSpeed: parseFloat(process.env.VOICE_SPEED ?? '0.9'),
    enableVoiceResponse: process.env.ENABLE_VOICE_RESPONSE !== 'false',
    subjectsOfFocus: process.env.SUBJECTS_OF_FOCUS?.split(',').filter(Boolean) ?? [],
  };
}

export const MASCOTS = {
  owl:   { emoji: '🦉', name: "Oliv'",  desc: 'Sage et curieux' },
  robot: { emoji: '🤖', name: 'Roby',   desc: 'Logique et cool' },
  star:  { emoji: '⭐', name: 'Stella', desc: 'Joyeuse et brillante' },
  cat:   { emoji: '🐱', name: 'Mimi',   desc: 'Douce et drôle' },
} as const;

export const THEMES = {
  blue:   { label: 'Océan',  primary: '#3b82f6', bg: '#eff6ff', light: '#dbeafe' },
  green:  { label: 'Forêt',  primary: '#10b981', bg: '#ecfdf5', light: '#d1fae5' },
  purple: { label: 'Cosmos', primary: '#8b5cf6', bg: '#f5f3ff', light: '#ede9fe' },
  orange: { label: 'Soleil', primary: '#f97316', bg: '#fff7ed', light: '#fed7aa' },
} as const;
