import fs from 'fs';
import path from 'path';
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
  voiceSpeed: number; // 0.7 | 0.9 | 1.1
  enableVoiceResponse: boolean;
  subjectsOfFocus: string[];
}

export const DEFAULT_SETTINGS: AppSettings = {
  configured: false,
  childName: 'Mon enfant',
  childAge: 10,
  schoolLevel: 'CM2',
  parentEmail: '',
  parentPin: '1234',
  mascot: 'owl',
  theme: 'blue',
  voiceSpeed: 0.9,
  enableVoiceResponse: true,
  subjectsOfFocus: [],
};

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

const SETTINGS_PATH = path.join(process.cwd(), 'data', 'settings.json');

function ensureDataDir(): void {
  const dir = path.dirname(SETTINGS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function readSettings(): AppSettings {
  ensureDataDir();
  if (!fs.existsSync(SETTINGS_PATH)) {
    // Fallback to env vars for backwards compat
    const fromEnv = {
      ...DEFAULT_SETTINGS,
      childName: process.env.CHILD_NAME ?? DEFAULT_SETTINGS.childName,
      childAge: parseInt(process.env.CHILD_AGE ?? String(DEFAULT_SETTINGS.childAge)),
      schoolLevel: (process.env.CHILD_SCHOOL_LEVEL ?? DEFAULT_SETTINGS.schoolLevel) as SchoolLevel,
      parentEmail: process.env.PARENT_EMAIL ?? DEFAULT_SETTINGS.parentEmail,
      parentPin: process.env.PARENT_PIN ?? DEFAULT_SETTINGS.parentPin,
      configured: !!(process.env.ANTHROPIC_API_KEY && process.env.CHILD_NAME),
    };
    return fromEnv;
  }
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8')) as AppSettings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function writeSettings(settings: AppSettings): void {
  ensureDataDir();
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf-8');
}

export function isConfigured(): boolean {
  return readSettings().configured;
}
