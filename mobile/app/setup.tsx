import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { loadSettings, saveSettings, MASCOTS, THEMES, DEFAULT_SETTINGS, type AppSettings } from '@/lib/settings';
import { ALL_LEVELS, getSchoolLevelLabel } from '@/data/curriculumMeta';
import { requestNotificationPermission } from '@/lib/notifications';
import type { SchoolLevel } from '@/types';

const TOTAL_STEPS = 5;
const SUBJECTS = ['Mathématiques', 'Français', 'Histoire-Géo', 'Sciences', 'Anglais'];
const VOICE_SPEEDS = [
  { value: 0.75, label: 'Lente', desc: 'CP–CE2' },
  { value: 0.9,  label: 'Normale', desc: 'CM–Collège' },
  { value: 1.1,  label: 'Rapide', desc: 'Lycée' },
];

export default function SetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pinLocked, setPinLocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [form, setForm] = useState<AppSettings & { confirmPin: string }>({
    ...DEFAULT_SETTINGS,
    confirmPin: '',
  } as AppSettings & { confirmPin: string });

  useEffect(() => {
    loadSettings().then((s) => {
      if (s.configured) {
        setPinLocked(true);
        setForm({ ...s, confirmPin: s.parentPin });
      }
    });
    requestNotificationPermission();
  }, []);

  const upd = (patch: Partial<typeof form>) => setForm(f => ({ ...f, ...patch }));
  const theme = THEMES[form.theme ?? 'blue'];

  const handlePinUnlock = () => {
    if (pinInput === form.parentPin) {
      setPinLocked(false);
    } else {
      setError('Code PIN incorrect');
    }
  };

  const handleSave = async () => {
    setError('');
    if (!form.serverUrl.trim()) { setError("L'URL du serveur est requise"); return; }
    if (!form.apiSecret.trim()) { setError('Le secret API est requis'); return; }
    if (!form.childName.trim()) { setError('Le prénom est requis'); return; }
    if (!form.parentPin || form.parentPin.length < 4) { setError('PIN trop court (4 chiffres min.)'); return; }
    if (form.parentPin !== (form as typeof form & { confirmPin: string }).confirmPin) { setError('Les PIN ne correspondent pas'); return; }
    setSaving(true);
    try {
      await saveSettings({ ...form, configured: true });
      router.replace('/');
    } catch {
      setError('Erreur de sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (pinLocked) {
    return (
      <View style={[styles.pinScreen, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.pinEmoji}>🔒</Text>
        <Text style={styles.pinTitle}>Paramètres parents</Text>
        <Text style={styles.pinSub}>Entrez votre code PIN pour modifier</Text>
        <TextInput
          style={[styles.pinInput, error ? styles.pinInputError : null]}
          value={pinInput}
          onChangeText={t => { setPinInput(t); setError(''); }}
          placeholder="••••"
          placeholderTextColor="#9ca3af"
          keyboardType="numeric"
          secureTextEntry
          maxLength={8}
          autoFocus
          textAlign="center"
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={handlePinUnlock}>
          <Text style={styles.primaryBtnText}>Accéder aux paramètres</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>← Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const canNext = [
    true,
    form.serverUrl.trim().length > 5 && form.apiSecret.trim().length > 5,
    form.childName.trim().length > 0,
    form.parentPin.length >= 4 && form.parentPin === (form as typeof form & { confirmPin: string }).confirmPin,
    true,
  ][step - 1] ?? true;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Progress */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step / TOTAL_STEPS) * 100}%`, backgroundColor: theme.primary }]} />
        </View>

        {/* Step counter */}
        <View style={styles.stepHeader}>
          {step > 1 ? (
            <TouchableOpacity onPress={() => setStep(s => s - 1)}>
              <Text style={styles.backBtn}>← Retour</Text>
            </TouchableOpacity>
          ) : <View />}
          <Text style={styles.stepCounter}>Étape {step}/{TOTAL_STEPS}</Text>
        </View>

        <ScrollView style={styles.flex} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled">

          {/* ── STEP 1 : Accueil ── */}
          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepEmoji}>🦉</Text>
              <Text style={styles.stepTitle}>Bienvenue sur Edubudy !</Text>
              <Text style={styles.stepSub}>Configurons ensemble l'assistant de votre enfant.</Text>
              {[
                { icon: '📚', text: 'Programme scolaire français officiel' },
                { icon: '🎤', text: 'Questions et réponses vocales' },
                { icon: '🔒', text: 'Espace parent sécurisé par PIN' },
                { icon: '🚨', text: 'Alertes immédiates en cas de problème' },
              ].map(f => (
                <View key={f.text} style={[styles.featureRow, { backgroundColor: theme.light }]}>
                  <Text style={styles.featureIcon}>{f.icon}</Text>
                  <Text style={styles.featureText}>{f.text}</Text>
                </View>
              ))}
            </View>
          )}

          {/* ── STEP 2 : Connexion serveur ── */}
          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepEmoji}>🌐</Text>
              <Text style={styles.stepTitle}>Connexion au serveur</Text>
              <Text style={styles.stepSub}>Renseignez l'URL de votre déploiement Vercel et votre secret API.</Text>
              <View style={styles.field}>
                <Text style={styles.label}>URL du serveur Edubudy</Text>
                <TextInput style={styles.input} value={form.serverUrl} onChangeText={t => upd({ serverUrl: t.trim() })}
                  placeholder="https://edubudy.vercel.app" placeholderTextColor="#9ca3af"
                  autoCapitalize="none" autoCorrect={false} keyboardType="url" />
                <Text style={styles.hint}>L'URL Vercel de votre backend (sans / final)</Text>
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Secret API</Text>
                <TextInput style={styles.input} value={form.apiSecret} onChangeText={t => upd({ apiSecret: t.trim() })}
                  placeholder="mon-secret-tres-long" placeholderTextColor="#9ca3af"
                  autoCapitalize="none" autoCorrect={false} secureTextEntry />
                <Text style={styles.hint}>La valeur de API_SECRET dans vos variables Vercel</Text>
              </View>
            </View>
          )}

          {/* ── STEP 3 : Profil enfant ── */}
          {step === 3 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepEmoji}>👧</Text>
              <Text style={styles.stepTitle}>Votre enfant</Text>
              <View style={styles.field}>
                <Text style={styles.label}>Prénom</Text>
                <TextInput style={styles.input} value={form.childName} onChangeText={t => upd({ childName: t })}
                  placeholder="Prénom de votre enfant" placeholderTextColor="#9ca3af" autoFocus />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Âge</Text>
                <View style={styles.stepper}>
                  <TouchableOpacity style={styles.stepperBtn} onPress={() => upd({ childAge: Math.max(5, form.childAge - 1) })}>
                    <Text style={styles.stepperBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepperValue}>{form.childAge} ans</Text>
                  <TouchableOpacity style={styles.stepperBtn} onPress={() => upd({ childAge: Math.min(18, form.childAge + 1) })}>
                    <Text style={styles.stepperBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Niveau scolaire</Text>
                <View style={styles.levelGrid}>
                  {ALL_LEVELS.map(level => (
                    <TouchableOpacity
                      key={level}
                      style={[styles.levelBtn, form.schoolLevel === level && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                      onPress={() => upd({ schoolLevel: level as SchoolLevel })}
                    >
                      <Text style={[styles.levelBtnText, form.schoolLevel === level && styles.levelBtnTextActive]}>
                        {getSchoolLevelLabel(level as SchoolLevel)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Matières à renforcer <Text style={styles.optional}>(optionnel)</Text></Text>
                <View style={styles.tagRow}>
                  {SUBJECTS.map(s => {
                    const active = form.subjectsOfFocus.includes(s);
                    return (
                      <TouchableOpacity key={s}
                        style={[styles.tag, active && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                        onPress={() => upd({ subjectsOfFocus: active ? form.subjectsOfFocus.filter(x => x !== s) : [...form.subjectsOfFocus, s] })}
                      >
                        <Text style={[styles.tagText, active && styles.tagTextActive]}>{s}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          )}

          {/* ── STEP 4 : Sécurité ── */}
          {step === 4 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepEmoji}>🔐</Text>
              <Text style={styles.stepTitle}>Code parent secret</Text>
              <Text style={styles.stepSub}>Ce PIN protège l'espace parent et les paramètres.</Text>
              <View style={styles.field}>
                <Text style={styles.label}>PIN (4 chiffres minimum)</Text>
                <TextInput style={styles.pinInputField} value={form.parentPin} onChangeText={t => upd({ parentPin: t })}
                  placeholder="••••" placeholderTextColor="#9ca3af" keyboardType="numeric" secureTextEntry maxLength={8} textAlign="center" />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Confirmer le PIN</Text>
                <TextInput
                  style={[styles.pinInputField, form.confirmPin && form.confirmPin !== form.parentPin && styles.pinInputError]}
                  value={(form as typeof form & { confirmPin: string }).confirmPin}
                  onChangeText={t => upd({ confirmPin: t } as Partial<typeof form>)}
                  placeholder="••••" placeholderTextColor="#9ca3af" keyboardType="numeric" secureTextEntry maxLength={8} textAlign="center"
                />
              </View>
            </View>
          )}

          {/* ── STEP 5 : Personnalisation ── */}
          {step === 5 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepEmoji}>🎨</Text>
              <Text style={styles.stepTitle}>Personnalisation</Text>
              <Text style={styles.stepSub}>{form.childName ? `Laissez ${form.childName} choisir !` : ''}</Text>

              <View style={styles.field}>
                <Text style={styles.label}>Mascotte</Text>
                <View style={styles.mascotGrid}>
                  {(Object.entries(MASCOTS) as [keyof typeof MASCOTS, typeof MASCOTS[keyof typeof MASCOTS]][]).map(([key, m]) => (
                    <TouchableOpacity key={key}
                      style={[styles.mascotBtn, form.mascot === key && { backgroundColor: theme.primary }]}
                      onPress={() => upd({ mascot: key })}
                    >
                      <Text style={styles.mascotBtnEmoji}>{m.emoji}</Text>
                      <Text style={[styles.mascotBtnName, form.mascot === key && styles.mascotBtnNameActive]}>{m.name}</Text>
                      <Text style={[styles.mascotBtnDesc, form.mascot === key && styles.mascotBtnDescActive]}>{m.desc}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Couleur</Text>
                <View style={styles.themeRow}>
                  {(Object.entries(THEMES) as [keyof typeof THEMES, typeof THEMES[keyof typeof THEMES]][]).map(([key, t]) => (
                    <TouchableOpacity key={key}
                      style={[styles.themeBtn, { backgroundColor: form.theme === key ? t.primary : t.light }]}
                      onPress={() => upd({ theme: key })}
                    >
                      <Text style={[styles.themeBtnLabel, { color: form.theme === key ? '#fff' : t.primary }]}>{t.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Vitesse de voix</Text>
                <View style={styles.speedRow}>
                  {VOICE_SPEEDS.map(o => (
                    <TouchableOpacity key={o.value}
                      style={[styles.speedBtn, form.voiceSpeed === o.value && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                      onPress={() => upd({ voiceSpeed: o.value })}
                    >
                      <Text style={[styles.speedBtnLabel, form.voiceSpeed === o.value && styles.speedBtnLabelActive]}>{o.label}</Text>
                      <Text style={[styles.speedBtnDesc, form.voiceSpeed === o.value && styles.speedBtnDescActive]}>{o.desc}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={[styles.field, styles.switchRow]}>
                <View style={styles.switchLabel}>
                  <Text style={styles.label}>Réponses vocales</Text>
                  <Text style={styles.hint}>Edubudy lit ses réponses à voix haute</Text>
                </View>
                <Switch value={form.enableVoiceResponse} onValueChange={v => upd({ enableVoiceResponse: v })}
                  trackColor={{ true: theme.primary }} />
              </View>
            </View>
          )}

          {/* Error */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Navigation */}
          {step < TOTAL_STEPS ? (
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: canNext ? theme.primary : '#d1d5db', marginHorizontal: 24 }]}
              onPress={() => canNext && setStep(s => s + 1)}
              disabled={!canNext}
            >
              <Text style={styles.primaryBtnText}>Suivant →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.primary, marginHorizontal: 24 }]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.primaryBtnText}>{saving ? 'Enregistrement…' : `🚀 Lancer Edubudy !`}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#fff' },
  progressBar: { height: 4, backgroundColor: '#f3f4f6' },
  progressFill: { height: 4, borderRadius: 2, transition: 'width 0.3s' as never },
  stepHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { fontSize: 14, color: '#6b7280' },
  stepCounter: { fontSize: 12, color: '#9ca3af', fontWeight: '600' },
  content: { paddingHorizontal: 24, paddingTop: 8, gap: 16 },
  stepContent: { gap: 16 },
  stepEmoji: { fontSize: 48, textAlign: 'center' },
  stepTitle: { fontSize: 24, fontWeight: '800', color: '#1f2937', textAlign: 'center' },
  stepSub: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14 },
  featureIcon: { fontSize: 22 },
  featureText: { fontSize: 14, color: '#374151', flex: 1 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '700', color: '#374151' },
  optional: { fontWeight: '400', color: '#9ca3af' },
  hint: { fontSize: 11, color: '#9ca3af' },
  input: { height: 50, borderRadius: 14, borderWidth: 2, borderColor: '#e5e7eb', paddingHorizontal: 14, fontSize: 15, color: '#1f2937' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepperBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  stepperBtnText: { fontSize: 22, color: '#374151' },
  stepperValue: { fontSize: 22, fontWeight: '700', color: '#1f2937', minWidth: 80, textAlign: 'center' },
  levelGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  levelBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 2, borderColor: '#e5e7eb', backgroundColor: '#f9fafb' },
  levelBtnText: { fontSize: 13, fontWeight: '600', color: '#4b5563' },
  levelBtnTextActive: { color: '#fff' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 2, borderColor: '#e5e7eb', backgroundColor: '#f9fafb' },
  tagText: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  tagTextActive: { color: '#fff' },
  pinInputField: { height: 56, borderRadius: 14, borderWidth: 2, borderColor: '#e5e7eb', fontSize: 24, letterSpacing: 8, color: '#1f2937' },
  pinInputError: { borderColor: '#f87171', backgroundColor: '#fef2f2' },
  mascotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  mascotBtn: { flex: 1, minWidth: 140, borderRadius: 16, padding: 12, alignItems: 'center', gap: 4, backgroundColor: '#f9fafb', borderWidth: 2, borderColor: '#e5e7eb' },
  mascotBtnEmoji: { fontSize: 32 },
  mascotBtnName: { fontSize: 14, fontWeight: '700', color: '#1f2937' },
  mascotBtnNameActive: { color: '#fff' },
  mascotBtnDesc: { fontSize: 11, color: '#9ca3af', textAlign: 'center' },
  mascotBtnDescActive: { color: 'rgba(255,255,255,0.8)' },
  themeRow: { flexDirection: 'row', gap: 10 },
  themeBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  themeBtnLabel: { fontSize: 13, fontWeight: '700' },
  speedRow: { flexDirection: 'row', gap: 10 },
  speedBtn: { flex: 1, padding: 12, borderRadius: 14, borderWidth: 2, borderColor: '#e5e7eb', backgroundColor: '#f9fafb', alignItems: 'center', gap: 3 },
  speedBtnLabel: { fontSize: 14, fontWeight: '700', color: '#1f2937' },
  speedBtnLabelActive: { color: '#fff' },
  speedBtnDesc: { fontSize: 11, color: '#9ca3af' },
  speedBtnDescActive: { color: 'rgba(255,255,255,0.8)' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchLabel: { flex: 1, gap: 2 },
  primaryBtn: { height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  errorText: { fontSize: 13, color: '#ef4444', textAlign: 'center' },
  pinScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: '#fff', gap: 16 },
  pinEmoji: { fontSize: 56 },
  pinTitle: { fontSize: 24, fontWeight: '800', color: '#1f2937' },
  pinSub: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  pinInput: { height: 64, width: '100%', borderRadius: 16, borderWidth: 2, borderColor: '#e5e7eb', fontSize: 28, letterSpacing: 12, color: '#1f2937', textAlign: 'center' },
  backLink: { fontSize: 14, color: '#6b7280', textDecorationLine: 'underline', marginTop: 8 },
});
