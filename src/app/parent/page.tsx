'use client';

import { useState, useEffect, useCallback } from 'react';
import AlertCard from '@/components/AlertCard';
import type { Alert } from '@/types';

export default function ParentPage() {
  const [pin, setPin] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('unread');

  const loadAlerts = useCallback(async (currentPin: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/alerts', {
        headers: { 'x-parent-pin': currentPin },
      });
      if (res.status === 401) {
        setAuthenticated(false);
        setAuthError(true);
        return;
      }
      const data = (await res.json()) as { alerts: Alert[]; unread: number };
      setAlerts(data.alerts);
      setUnread(data.unread);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(false);
    const res = await fetch('/api/alerts', {
      headers: { 'x-parent-pin': pinInput },
    });
    if (res.ok) {
      setPin(pinInput);
      setAuthenticated(true);
      const data = (await res.json()) as { alerts: Alert[]; unread: number };
      setAlerts(data.alerts);
      setUnread(data.unread);
    } else {
      setAuthError(true);
    }
  };

  useEffect(() => {
    if (authenticated && pin) {
      const interval = setInterval(() => loadAlerts(pin), 30_000);
      return () => clearInterval(interval);
    }
  }, [authenticated, pin, loadAlerts]);

  const handleAcknowledge = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
    setUnread((prev) => Math.max(0, prev - 1));
  };

  const filteredAlerts = filter === 'unread'
    ? alerts.filter((a) => !a.acknowledged)
    : alerts;

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🔒</div>
            <h1 className="text-2xl font-bold text-gray-800">Espace Parents</h1>
            <p className="text-gray-500 text-sm mt-1">Tableau de bord Edubudy</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code PIN parent
              </label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••"
                className={`w-full px-4 py-3 rounded-xl border-2 text-center text-2xl tracking-widest outline-none transition-colors ${
                  authError ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-edubudy-blue'
                }`}
                maxLength={8}
                autoFocus
              />
              {authError && (
                <p className="text-red-500 text-xs mt-1 text-center">Code PIN incorrect</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-edubudy-blue text-white rounded-xl font-medium hover:bg-blue-500 transition-colors"
            >
              Accéder au tableau de bord
            </button>
          </form>

          <a
            href="/"
            className="block text-center text-sm text-gray-400 hover:text-gray-600 mt-4 transition-colors"
          >
            ← Retour à Edubudy
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🦉</div>
            <div>
              <h1 className="font-bold text-gray-800">Tableau de bord Parent</h1>
              <p className="text-xs text-gray-400">Edubudy</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {unread > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unread} non lu{unread > 1 ? 's' : ''}
              </span>
            )}
            <button
              onClick={() => loadAlerts(pin)}
              disabled={loading}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {loading ? '↻' : '↺'} Actualiser
            </button>
            <a
              href="/"
              className="text-sm text-edubudy-blue hover:underline"
            >
              Accueil enfant
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: alerts.length, color: 'bg-blue-100 text-blue-800' },
            { label: 'Non lus', value: unread, color: unread > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-500' },
            {
              label: 'Critiques',
              value: alerts.filter((a) => a.severity === 'CRITICAL').length,
              color: alerts.filter((a) => a.severity === 'CRITICAL').length > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-500',
            },
            {
              label: 'Haute priorité',
              value: alerts.filter((a) => a.severity === 'HIGH').length,
              color: alerts.filter((a) => a.severity === 'HIGH').length > 0 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-500',
            },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-xl p-4 text-center ${stat.color}`}>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-edubudy-blue text-white'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
            }`}
          >
            Non lus {unread > 0 && `(${unread})`}
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-edubudy-blue text-white'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
            }`}
          >
            Toutes ({alerts.length})
          </button>
        </div>

        {/* Alerts */}
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="text-5xl mb-4">
              {filter === 'unread' ? '✅' : '📭'}
            </div>
            <p className="text-gray-500 font-medium">
              {filter === 'unread'
                ? 'Aucune alerte non lue. Tout va bien !'
                : 'Aucune alerte enregistrée.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                pin={pin}
                onAcknowledge={handleAcknowledge}
              />
            ))}
          </div>
        )}

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
          <strong>ℹ️ Important :</strong> Ces alertes sont générées automatiquement quand votre enfant
          mentionne un sujet préoccupant. Elles ne remplacent pas une évaluation professionnelle.
          En cas de doute, consultez un médecin, psychologue ou pédopsychiatre.
        </div>
      </main>
    </div>
  );
}
