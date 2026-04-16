'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MASCOTS, THEMES, type AppSettings } from '@/lib/settings';
import { ALL_LEVELS, getSchoolLevelLabel } from '@/lib/curriculum';
import type { SchoolLevel } from '@/types';

const TOTAL_STEPS = 5;

type FormData = Omit<AppSettings, 'configured'> & { confirmPin: string };

const VOICE_SPEED_OPTIONS = [
  { value: 0.75, label: 'Lente', desc: 'Pour les petits (CP-CE2)' },
  { value: 0.9,  label: 'Normale', desc: 'Pour la plupart des enfants' },
  { value: 1.1,  label: 'Rapide', desc: 'Pour les grands (collège+)' },
];

const SUBJECTS = [
  'Mathématiques', 'Français', 'Histoire-Géographie', 'Sciences', 'Physique-Chimie', 'Anglais',
];

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pinVerified, setPinVerified] = useState(false);
  const [pinInput, setPinInput] = useState('');

  const [form, setForm] = useState<FormData>({
    childName: '',
    childAge: 9,
    schoolLevel: 'CM2',
    parentEmail: '',
    parentPin: '',
    confirmPin: '',
    mascot: 'owl',
    theme: 'blue',
    voiceSpeed: 0.9,
    enableVoiceResponse: true,
    subjectsOfFocus: [],
  });

  const update = (patch: Partial<FormData>) => setForm((f) => ({ ...f, ...patch }));
  const theme = THEMES[form.theme];

  // ── Check if already configured (needs PIN to re-enter setup) ──
  const [checkingConfig, setCheckingConfig] = useState(true);
  const [alreadyConfigured, setAlreadyConfigured] = useState(false);

  useState(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((d: { configured?: boolean }) => {
        setAlreadyConfigured(d.configured ?? false);
        setCheckingConfig(false);
      })
      .catch(() => setCheckingConfig(false));
  });

  const handlePinVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/alerts', { headers: { 'x-parent-pin': pinInput } });
    if (res.ok) {
      // Load existing settings
      const cfg = await fetch('/api/config').then((r) => r.json()) as Partial<FormData>;
      setForm((f) => ({ ...f, ...cfg, parentPin: pinInput, confirmPin: pinInput }));
      setPinVerified(true);
    } else {
      setError('Code PIN incorrect');
    }
  };

  const handleSave = async () => {
    setError('');
    if (form.parentPin !== form.confirmPin) {
      setError('Les codes PIN ne correspondent pas');
      return;
    }
    if (form.parentPin.length < 4) {
      setError('Le PIN doit comporter au moins 4 chiffres');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-parent-pin': alreadyConfigured ? pinInput : '',
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const { error: e } = await res.json() as { error: string };
        setError(e);
        return;
      }
      router.push('/');
    } catch {
      setError('Erreur de sauvegarde. Vérifiez votre connexion.');
    } finally {
      setSaving(false);
    }
  };

  if (checkingConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-5xl animate-bounce">🦉</div>
      </div>
    );
  }

  // If already configured and PIN not yet verified
  if (alreadyConfigured && !pinVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-white">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🔒</div>
            <h1 className="text-xl font-bold text-gray-800">Paramètres parents</h1>
            <p className="text-gray-500 text-sm mt-1">Entrez votre code PIN pour modifier les paramètres</p>
          </div>
          <form onSubmit={handlePinVerify} className="space-y-4">
            <input
              type="password"
              inputMode="numeric"
              value={pinInput}
              onChange={(e) => { setPinInput(e.target.value); setError(''); }}
              placeholder="••••"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-center text-2xl tracking-widest outline-none focus:border-blue-400"
              maxLength={8}
              autoFocus
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors">
              Accéder aux paramètres
            </button>
          </form>
          <a href="/" className="block text-center text-sm text-gray-400 hover:text-gray-600 mt-4">← Retour à Edubudy</a>
        </div>
      </div>
    );
  }

  const canProceed = [
    true,
    form.parentPin.length >= 4 && form.confirmPin === form.parentPin,
    form.childName.trim().length > 0,
    true,
    true,
  ][step - 1];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: `linear-gradient(135deg, ${theme.bg} 0%, white 100%)` }}>
      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100">
        <div
          className="h-full transition-all duration-500 rounded-full"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%`, background: theme.primary }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
          {/* Step counter */}
          <div className="px-6 pt-5 flex items-center justify-between">
            {step > 1 ? (
              <button onClick={() => setStep(s => s - 1)} className="text-gray-400 hover:text-gray-600 text-sm flex items-center gap-1">
                ← Retour
              </button>
            ) : <span />}
            <span className="text-xs text-gray-400 font-medium">Étape {step}/{TOTAL_STEPS}</span>
          </div>

          <div className="px-6 pb-6 pt-4">
            {/* ── STEP 1 : Welcome ── */}
            {step === 1 && (
              <div className="text-center space-y-4">
                <div className="text-6xl">🦉</div>
                <h1 className="text-2xl font-bold text-gray-800">Bienvenue sur Edubudy !</h1>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Configurons ensemble l&apos;assistant de votre enfant. Cela prend moins de 2 minutes.
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm pt-2">
                  {[
                    { icon: '📚', text: 'Programme scolaire français officiel' },
                    { icon: '🎤', text: 'Réponses vocales en français' },
                    { icon: '🔒', text: 'Espace parent sécurisé' },
                    { icon: '🚨', text: 'Alertes immédiates si problème' },
                  ].map((f) => (
                    <div key={f.text} className="flex items-start gap-2 p-3 rounded-xl" style={{ background: theme.bg }}>
                      <span className="text-lg">{f.icon}</span>
                      <span className="text-gray-600 leading-tight">{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 2 : PIN parent ── */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="text-4xl mb-2">🔐</div>
                  <h2 className="text-xl font-bold text-gray-800">Votre code secret parent</h2>
                  <p className="text-gray-500 text-sm mt-1">Ce PIN protège l&apos;espace parents et les paramètres.</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">Choisir un PIN (4 chiffres min.)</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      value={form.parentPin}
                      onChange={(e) => update({ parentPin: e.target.value })}
                      placeholder="••••"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-center text-2xl tracking-widest outline-none focus:border-blue-400"
                      maxLength={8}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">Confirmer le PIN</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      value={form.confirmPin}
                      onChange={(e) => update({ confirmPin: e.target.value })}
                      placeholder="••••"
                      className={`w-full px-4 py-3 rounded-xl border-2 text-center text-2xl tracking-widest outline-none transition-colors ${
                        form.confirmPin && form.confirmPin !== form.parentPin
                          ? 'border-red-300 bg-red-50'
                          : form.confirmPin && form.confirmPin === form.parentPin
                          ? 'border-green-400'
                          : 'border-gray-200 focus:border-blue-400'
                      }`}
                      maxLength={8}
                    />
                    {form.confirmPin && form.confirmPin !== form.parentPin && (
                      <p className="text-red-500 text-xs mt-1">Les PIN ne correspondent pas</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">Email parent (pour les alertes)</label>
                    <input
                      type="email"
                      value={form.parentEmail}
                      onChange={(e) => update({ parentEmail: e.target.value })}
                      placeholder="vous@email.com"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 outline-none focus:border-blue-400 text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">Optionnel — utilisé uniquement pour les alertes importantes</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3 : Profil enfant ── */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="text-4xl mb-2">👧</div>
                  <h2 className="text-xl font-bold text-gray-800">Votre enfant</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">Prénom</label>
                    <input
                      type="text"
                      value={form.childName}
                      onChange={(e) => update({ childName: e.target.value })}
                      placeholder="Prénom de votre enfant"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 outline-none focus:border-blue-400"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">Âge</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => update({ childAge: Math.max(5, form.childAge - 1) })}
                        className="w-10 h-10 rounded-full border-2 border-gray-200 text-lg font-bold text-gray-600 hover:bg-gray-50"
                      >−</button>
                      <span className="text-2xl font-bold text-gray-800 w-16 text-center">{form.childAge} ans</span>
                      <button
                        onClick={() => update({ childAge: Math.min(18, form.childAge + 1) })}
                        className="w-10 h-10 rounded-full border-2 border-gray-200 text-lg font-bold text-gray-600 hover:bg-gray-50"
                      >+</button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-2">Niveau scolaire</label>
                    <div className="grid grid-cols-4 gap-2">
                      {ALL_LEVELS.map((level) => (
                        <button
                          key={level}
                          onClick={() => update({ schoolLevel: level as SchoolLevel })}
                          className={`py-2 px-1 rounded-xl text-sm font-medium border-2 transition-all ${
                            form.schoolLevel === level
                              ? 'text-white border-transparent'
                              : 'text-gray-600 border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                          style={form.schoolLevel === level ? { background: theme.primary, borderColor: theme.primary } : {}}
                        >
                          {getSchoolLevelLabel(level as SchoolLevel)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-2">Matières à renforcer <span className="text-gray-400 font-normal">(optionnel)</span></label>
                    <div className="flex flex-wrap gap-2">
                      {SUBJECTS.map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            const cur = form.subjectsOfFocus;
                            update({ subjectsOfFocus: cur.includes(s) ? cur.filter(x => x !== s) : [...cur, s] });
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${
                            form.subjectsOfFocus.includes(s)
                              ? 'text-white border-transparent'
                              : 'text-gray-500 border-gray-200 bg-white hover:border-gray-300'
                          }`}
                          style={form.subjectsOfFocus.includes(s) ? { background: theme.primary, borderColor: theme.primary } : {}}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 4 : Mascotte + Thème ── */}
            {step === 4 && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="text-4xl mb-2">🎨</div>
                  <h2 className="text-xl font-bold text-gray-800">Personnalisation</h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {form.childName ? `Laissez ${form.childName} choisir !` : 'Laissez votre enfant choisir !'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-2">Mascotte</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(Object.entries(MASCOTS) as [keyof typeof MASCOTS, typeof MASCOTS[keyof typeof MASCOTS]][]).map(([key, m]) => (
                      <button
                        key={key}
                        onClick={() => update({ mascot: key })}
                        className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${
                          form.mascot === key ? 'border-transparent text-white' : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        style={form.mascot === key ? { background: theme.primary } : {}}
                      >
                        <span className="text-3xl">{m.emoji}</span>
                        <div>
                          <div className={`font-bold text-sm ${form.mascot === key ? 'text-white' : 'text-gray-800'}`}>{m.name}</div>
                          <div className={`text-xs ${form.mascot === key ? 'text-white/80' : 'text-gray-400'}`}>{m.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-2">Couleur</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(Object.entries(THEMES) as [keyof typeof THEMES, typeof THEMES[keyof typeof THEMES]][]).map(([key, t]) => (
                      <button
                        key={key}
                        onClick={() => update({ theme: key })}
                        className={`py-3 rounded-2xl flex flex-col items-center gap-1 border-2 transition-all ${
                          form.theme === key ? 'border-transparent' : 'border-transparent opacity-60 hover:opacity-80'
                        }`}
                        style={{ background: form.theme === key ? t.primary : t.light }}
                      >
                        <div className="w-6 h-6 rounded-full" style={{ background: t.primary }} />
                        <span className="text-xs font-medium" style={{ color: form.theme === key ? 'white' : t.primary }}>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-2">Vitesse de la voix</label>
                  <div className="grid grid-cols-3 gap-2">
                    {VOICE_SPEED_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        onClick={() => update({ voiceSpeed: o.value })}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          form.voiceSpeed === o.value ? 'border-transparent text-white' : 'border-gray-200 bg-white text-gray-700'
                        }`}
                        style={form.voiceSpeed === o.value ? { background: theme.primary } : {}}
                      >
                        <div className="text-sm font-bold">{o.label}</div>
                        <div className={`text-xs mt-0.5 ${form.voiceSpeed === o.value ? 'text-white/80' : 'text-gray-400'}`}>{o.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 5 : Récap + Lancer ── */}
            {step === 5 && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="text-5xl mb-2">{MASCOTS[form.mascot].emoji}</div>
                  <h2 className="text-xl font-bold text-gray-800">Tout est prêt !</h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {MASCOTS[form.mascot].name} est prêt(e) à aider {form.childName || 'votre enfant'} !
                  </p>
                </div>

                <div className="rounded-2xl p-4 space-y-3 text-sm" style={{ background: theme.bg }}>
                  {[
                    { label: 'Prénom', value: form.childName },
                    { label: 'Niveau', value: getSchoolLevelLabel(form.schoolLevel as SchoolLevel) },
                    { label: 'Mascotte', value: `${MASCOTS[form.mascot].emoji} ${MASCOTS[form.mascot].name}` },
                    { label: 'Thème', value: THEMES[form.theme].label },
                    { label: 'Email parent', value: form.parentEmail || 'Non renseigné' },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between">
                      <span className="text-gray-500">{r.label}</span>
                      <span className="font-medium text-gray-800">{r.value}</span>
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <p className="text-xs text-gray-400 text-center">
                  Vous pourrez modifier ces paramètres à tout moment depuis l&apos;espace parent.
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-6">
              {step < TOTAL_STEPS ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canProceed}
                  className="w-full py-4 rounded-2xl text-white font-bold text-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                  style={{ background: canProceed ? theme.primary : '#9ca3af' }}
                >
                  Suivant →
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-4 rounded-2xl text-white font-bold text-lg transition-all active:scale-95"
                  style={{ background: theme.primary }}
                >
                  {saving ? 'Enregistrement...' : `🚀 Lancer Edubudy !`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
