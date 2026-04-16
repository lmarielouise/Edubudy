import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import type { Alert } from '@/types';
import { SAFETY_CONFIG } from '@/lib/safety';
import type { SafetyCategory } from '@/types';

interface Props {
  alert: Alert;
  onAcknowledge: (id: string) => void;
}

export default function AlertCard({ alert, onAcknowledge }: Props) {
  const [expanded, setExpanded] = useState(!alert.acknowledged);
  const config = SAFETY_CONFIG[alert.category as Exclude<SafetyCategory, 'NONE'>];
  if (!config) return null;

  const date = new Date(alert.timestamp).toLocaleString('fr-FR');

  return (
    <View style={[styles.card, { borderLeftColor: config.color, opacity: alert.acknowledged ? 0.65 : 1 }]}>
      <TouchableOpacity style={styles.header} onPress={() => setExpanded(e => !e)} activeOpacity={0.7}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>{config.icon}</Text>
          <View>
            <Text style={[styles.headerTitle, { color: config.color }]}>{config.label}</Text>
            <Text style={styles.headerDate}>
              {date}{alert.acknowledged ? '  ✓ Vu' : ''}
            </Text>
          </View>
        </View>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          <Text style={styles.sectionLabel}>Message de {alert.childName}</Text>
          <View style={styles.quoteBox}>
            <Text style={styles.quoteText}>"{alert.triggerMessage}"</Text>
          </View>

          <Text style={styles.sectionLabel}>Conseils pour vous</Text>
          <View style={styles.adviceBox}>
            <Text style={styles.adviceText}>{alert.parentAdvice}</Text>
          </View>

          {alert.resources.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Ressources utiles</Text>
              <View style={styles.resourcesBox}>
                {alert.resources.map((r, i) => (
                  <Text key={i} style={styles.resource}>• {r}</Text>
                ))}
              </View>
            </>
          )}

          {!alert.acknowledged && (
            <TouchableOpacity style={styles.ackButton} onPress={() => onAcknowledge(alert.id)} activeOpacity={0.8}>
              <Text style={styles.ackText}>✓ Marquer comme lu</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, borderLeftWidth: 4, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  headerIcon: { fontSize: 22 },
  headerTitle: { fontSize: 15, fontWeight: '700' },
  headerDate: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  chevron: { fontSize: 12, color: '#9ca3af' },
  body: { paddingHorizontal: 16, paddingBottom: 16, gap: 10 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.8 },
  quoteBox: { backgroundColor: '#f9fafb', borderRadius: 10, padding: 12 },
  quoteText: { color: '#374151', fontSize: 14, fontStyle: 'italic', lineHeight: 20 },
  adviceBox: { backgroundColor: '#eff6ff', borderRadius: 10, padding: 12 },
  adviceText: { color: '#1e3a5f', fontSize: 13, lineHeight: 20 },
  resourcesBox: { backgroundColor: '#f0fdf4', borderRadius: 10, padding: 12, gap: 4 },
  resource: { fontSize: 13, color: '#166534', lineHeight: 20 },
  ackButton: { backgroundColor: '#16a34a', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  ackText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
