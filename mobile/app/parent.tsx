import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { loadSettings, THEMES, type AppSettings } from '@/lib/settings';
import { loadAlerts, acknowledgeAlert } from '@/lib/storage';
import AlertCard from '@/components/AlertCard';
import type { Alert } from '@/types';

export default function ParentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [authenticated, setAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unread, setUnread] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'unread' | 'all'>('unread');
  const [themeKey, setThemeKey] = useState<keyof typeof THEMES>('blue');
  const [parentPin, setParentPin] = useState('1234');
  const [serverSettings, setServerSettings] = useState<Pick<AppSettings, 'serverUrl' | 'apiSecret'>>({ serverUrl: '', apiSecret: '' });

  useEffect(() => {
    loadSettings().then(s => {
      setThemeKey(s.theme ?? 'blue');
      setParentPin(s.parentPin ?? '1234');
      setServerSettings({ serverUrl: s.serverUrl, apiSecret: s.apiSecret });
    });
  }, []);

  const theme = THEMES[themeKey];

  const loadData = async () => {
    const { alerts: a, unread: u } = await loadAlerts(serverSettings.serverUrl, serverSettings.apiSecret);
    setAlerts(a);
    setUnread(u);
  };

  const handlePinSubmit = async () => {
    if (pinInput === parentPin) {
      setAuthenticated(true);
      await loadData();
    } else {
      setPinError('Code PIN incorrect');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAcknowledge = async (id: string) => {
    await acknowledgeAlert(id, serverSettings.serverUrl, serverSettings.apiSecret);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
    setUnread(prev => Math.max(0, prev - 1));
  };

  if (!authenticated) {
    return (
      <View style={[styles.pinScreen, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.lockEmoji}>🔒</Text>
        <Text style={styles.pinTitle}>Espace Parents</Text>
        <Text style={styles.pinSub}>Tableau de bord Edubudy</Text>
        <TextInput
          style={[styles.pinInput, pinError ? styles.pinInputError : null]}
          value={pinInput}
          onChangeText={t => { setPinInput(t); setPinError(''); }}
          placeholder="Code PIN"
          placeholderTextColor="#9ca3af"
          keyboardType="numeric"
          secureTextEntry
          maxLength={8}
          textAlign="center"
          autoFocus
        />
        {pinError ? <Text style={styles.errorText}>{pinError}</Text> : null}
        <TouchableOpacity style={[styles.loginBtn, { backgroundColor: theme.primary }]} onPress={handlePinSubmit}>
          <Text style={styles.loginBtnText}>Accéder</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>← Retour à Edubudy</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const filtered = filter === 'unread' ? alerts.filter(a => !a.acknowledged) : alerts;
  const critical = alerts.filter(a => a.severity === 'CRITICAL').length;
  const high = alerts.filter(a => a.severity === 'HIGH').length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerEmoji}>🦉</Text>
          <View>
            <Text style={styles.headerTitle}>Tableau de bord</Text>
            <Text style={styles.headerSub}>Espace Parent</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unread}</Text>
            </View>
          )}
          <TouchableOpacity onPress={() => router.push('/setup')} style={styles.settingsBtn}>
            <Text>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Total', value: alerts.length, bg: '#eff6ff', color: '#3b82f6' },
          { label: 'Non lus', value: unread, bg: unread > 0 ? '#fef2f2' : '#f9fafb', color: unread > 0 ? '#dc2626' : '#9ca3af' },
          { label: 'Critiques', value: critical, bg: critical > 0 ? '#fef2f2' : '#f9fafb', color: critical > 0 ? '#dc2626' : '#9ca3af' },
          { label: 'Élevés', value: high, bg: high > 0 ? '#fff7ed' : '#f9fafb', color: high > 0 ? '#ea580c' : '#9ca3af' },
        ].map(s => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: s.bg }]}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: s.color }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {(['unread', 'all'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && { backgroundColor: theme.primary }]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterBtnText, filter === f && styles.filterBtnTextActive]}>
              {f === 'unread' ? `Non lus${unread > 0 ? ` (${unread})` : ''}` : `Toutes (${alerts.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Alerts list */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.primary} />}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>{filter === 'unread' ? '✅' : '📭'}</Text>
            <Text style={styles.emptyText}>
              {filter === 'unread' ? 'Aucune alerte non lue. Tout va bien !' : 'Aucune alerte enregistrée.'}
            </Text>
          </View>
        ) : (
          filtered.map(alert => (
            <AlertCard key={alert.id} alert={alert} onAcknowledge={handleAcknowledge} />
          ))
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ℹ️ Ces alertes sont générées automatiquement. Elles ne remplacent pas une évaluation professionnelle. En cas de doute, consultez un médecin ou pédopsychiatre.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerEmoji: { fontSize: 28 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#1f2937' },
  headerSub: { fontSize: 12, color: '#9ca3af' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: { backgroundColor: '#dc2626', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  settingsBtn: { padding: 6 },
  statsRow: { flexDirection: 'row', gap: 10, padding: 16 },
  statCard: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' },
  filterBtnText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  filterBtnTextActive: { color: '#fff' },
  list: { flex: 1 },
  listContent: { padding: 16, gap: 0 },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 16, color: '#6b7280', textAlign: 'center' },
  infoBox: { marginTop: 16, backgroundColor: '#eff6ff', borderRadius: 14, padding: 14 },
  infoText: { fontSize: 12, color: '#3b82f6', lineHeight: 18 },
  pinScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: '#fff', gap: 16 },
  lockEmoji: { fontSize: 56 },
  pinTitle: { fontSize: 24, fontWeight: '800', color: '#1f2937' },
  pinSub: { fontSize: 14, color: '#6b7280' },
  pinInput: { height: 64, width: '100%', borderRadius: 16, borderWidth: 2, borderColor: '#e5e7eb', fontSize: 28, letterSpacing: 12, color: '#1f2937' },
  pinInputError: { borderColor: '#f87171', backgroundColor: '#fef2f2' },
  errorText: { fontSize: 13, color: '#ef4444' },
  loginBtn: { width: '100%', height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  loginBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  backLink: { fontSize: 14, color: '#6b7280', textDecorationLine: 'underline' },
});
