'use client';

import { useState } from 'react';
import type { Alert, SafetyCategory } from '@/types';

interface AlertCardProps {
  alert: Alert;
  pin: string;
  onAcknowledge: (id: string) => void;
}

const CATEGORY_CONFIG: Record<Exclude<SafetyCategory, 'NONE'>, {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  HARCELEMENT: {
    label: 'Harcèlement scolaire',
    icon: '🟠',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-400',
  },
  AGRESSION_SEXUELLE: {
    label: 'Agression sexuelle / Attouchement',
    icon: '🔴',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-500',
  },
  IDEATION_SUICIDAIRE: {
    label: 'Idéation suicidaire',
    icon: '🔴',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-500',
  },
  VIOLENCE: {
    label: 'Violence',
    icon: '🟠',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-400',
  },
  DETRESSE_EMOTIONNELLE_SEVERE: {
    label: 'Détresse émotionnelle sévère',
    icon: '🟡',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-400',
  },
};

const SEVERITY_LABELS = {
  LOW: 'Faible',
  MEDIUM: 'Moyen',
  HIGH: 'Élevé',
  CRITICAL: 'CRITIQUE',
};

export default function AlertCard({ alert, pin, onAcknowledge }: AlertCardProps) {
  const [expanded, setExpanded] = useState(!alert.acknowledged);
  const [acknowledging, setAcknowledging] = useState(false);

  const config = CATEGORY_CONFIG[alert.category as Exclude<SafetyCategory, 'NONE'>];
  if (!config) return null;

  const handleAcknowledge = async () => {
    setAcknowledging(true);
    try {
      await fetch('/api/alerts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-parent-pin': pin,
        },
        body: JSON.stringify({ alertId: alert.id }),
      });
      onAcknowledge(alert.id);
    } finally {
      setAcknowledging(false);
    }
  };

  return (
    <div
      className={`rounded-xl border-l-4 ${config.borderColor} ${config.bgColor} overflow-hidden transition-all duration-200 ${
        alert.acknowledged ? 'opacity-60' : 'shadow-md'
      }`}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-black/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <div className={`font-semibold ${config.color}`}>{config.label}</div>
            <div className="text-xs text-gray-500 mt-0.5">
              {new Date(alert.timestamp).toLocaleString('fr-FR')} —{' '}
              <span className="font-medium">{SEVERITY_LABELS[alert.severity]}</span>
              {alert.acknowledged && <span className="ml-2 text-green-600">✓ Vu</span>}
            </div>
          </div>
        </div>
        <span className="text-gray-400 text-lg">{expanded ? '▲' : '▼'}</span>
      </button>

      {/* Body */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Trigger message */}
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
              Message de {alert.childName}
            </div>
            <div className="bg-white rounded-lg p-3 text-sm text-gray-700 italic border border-gray-200">
              "{alert.triggerMessage}"
            </div>
          </div>

          {/* Parent advice */}
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
              Conseils pour vous
            </div>
            <div className="bg-white rounded-lg p-3 text-sm text-gray-700 whitespace-pre-line leading-relaxed border border-gray-200">
              {alert.parentAdvice}
            </div>
          </div>

          {/* Resources */}
          {alert.resources.length > 0 && (
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                Ressources utiles
              </div>
              <ul className="bg-white rounded-lg p-3 text-sm text-gray-700 space-y-1 border border-gray-200">
                {alert.resources.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Acknowledge */}
          {!alert.acknowledged && (
            <button
              onClick={handleAcknowledge}
              disabled={acknowledging}
              className="w-full py-2 px-4 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-gray-300 transition-colors"
            >
              {acknowledging ? 'Enregistrement...' : '✓ Marquer comme lu'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
