import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SchoolLevel } from '@/types';

export interface AppSettings {
  configured: boolean;
  // APIs
  anthropicApiKey: string;
  openaiApiKey: string;
  // Enfant
  childName: string;
  childAge: number;
  schoolLevel: SchoolLevel;
  // Parent
  parentPin: string;
  parentEmail: string;
  // Personnalisation
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

const STORAGE_KEY = 'edubudy_settings';

export const DEFAULT_SETTINGS: AppSettings = {
  configured: false,
  anthropicApiKey: '',
  openaiApiKey: '',
  childName: '',
  childAge: 9,
  schoolLevel: 'CM2',
  parentPin: '',
  parentEmail: '',
  mascot: 'owl',
  theme: 'blue',
  voiceSpeed: 0.9,
  enableVoiceResponse: true,
  subjectsOfFocus: [],
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } as AppSettings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
