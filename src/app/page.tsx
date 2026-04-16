'use client';

import { useEffect, useState } from 'react';
import VoiceChat from '@/components/VoiceChat';
import type { AppConfig } from '@/types';

export default function HomePage() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupNeeded, setSetupNeeded] = useState(false);

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((data: AppConfig) => {
        setConfig(data);
        if (!process.env.NEXT_PUBLIC_ANTHROPIC_CONFIGURED) {
          setSetupNeeded(false);
        }
        setLoading(false);
      })
      .catch(() => {
        setSetupNeeded(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🦉</div>
          <p className="text-gray-500">Chargement d&apos;Edubudy...</p>
        </div>
      </div>
    );
  }

  if (setupNeeded) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🦉</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Bienvenue sur Edubudy !</h1>
          <p className="text-gray-500 mb-6">
            Pour commencer, configure le fichier <code className="bg-gray-100 px-1 rounded">.env.local</code> avec
            ta clé API Anthropic et les informations de ton enfant.
          </p>
          <div className="text-left bg-gray-50 rounded-xl p-4 text-sm font-mono text-gray-600 space-y-1">
            <p>ANTHROPIC_API_KEY=sk-ant-...</p>
            <p>CHILD_NAME=Prénom</p>
            <p>CHILD_AGE=10</p>
            <p>CHILD_SCHOOL_LEVEL=CM2</p>
            <p>PARENT_EMAIL=vous@email.com</p>
            <p>PARENT_PIN=1234</p>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Copie <code>.env.example</code> en <code>.env.local</code> et remplis les valeurs.
          </p>
        </div>
      </div>
    );
  }

  const levelDisplay = config?.schoolLevel ?? '';
  const levelLabels: Record<string, string> = {
    CP: 'CP', CE1: 'CE1', CE2: 'CE2', CM1: 'CM1', CM2: 'CM2',
    '6eme': '6ème', '5eme': '5ème', '4eme': '4ème', '3eme': '3ème',
    '2nde': '2nde', '1ere': '1ère', 'Terminale': 'Terminale',
  };

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-edubudy-yellow flex items-center justify-center text-xl shadow-sm">
            🦉
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-lg leading-tight">Edubudy</h1>
            <p className="text-xs text-gray-400">
              {config?.childName} · {levelLabels[levelDisplay] ?? levelDisplay}
            </p>
          </div>
        </div>
        <a
          href="/parent"
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-3 py-1 rounded-full border border-gray-200 hover:border-gray-300"
        >
          Espace parents
        </a>
      </header>

      {/* Chat */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {config && <VoiceChat childName={config.childName} />}
      </main>
    </div>
  );
}
