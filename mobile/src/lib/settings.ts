import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SchoolLevel } from '@/types';

export interface AppSettings {
  configured: boolean;
  serverUrl: string;     // URL Vercel, ex: https://edubudy.vercel.app
  apiSecret: string;     // Correspond à API_SECRET côté serveur
  parentPin: string;     // Pour accéder à l'espace parent dans l'app
  // Profil enfant (stocké localement pour personnalisation UI)
  childName: string;
  childAge: number;
  schoolLevel: SchoolLevel;
  mascot: 'owl' | 'robot' | 'star' | 'cat';
  theme: 'blue' | 'green' | 'purple' | 'orange';
  voiceSpeed: number;
  enableVoiceResponse: boolean;
  subjectsOfFocus: string[];
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

const KEY = 'edubudy_settings_v2';

export const DEFAULT_SETTINGS: AppSettings = {
  configured: false,
  serverUrl: '',
  apiSecret: '',
  parentPin: '',
  childName: '',
  childAge: 9,
  schoolLevel: 'CM2',
  mascot: 'owl',
  theme: 'blue',
  voiceSpeed: 0.9,
  enableVoiceResponse: true,
  subjectsOfFocus: [],
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } as AppSettings : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
}

export async function saveSettings(s: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(s));
}

// Helper — headers communs pour tous les appels au serveur
export function apiHeaders(apiSecret: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-api-secret': apiSecret,
  };
}
