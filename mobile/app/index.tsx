import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, ScrollView,
  StyleSheet, Animated, KeyboardAvoidingView, Platform, Alert as RNAlert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import * as ExpoHaptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { v4 as uuidv4 } from 'uuid';
import { loadSettings, MASCOTS, THEMES, type AppSettings } from '@/lib/settings';
import { getChatResponse, runSafetyCheck, transcribeAudio } from '@/lib/claude';
import { SAFETY_CONFIG } from '@/lib/safety';
import { saveAlert } from '@/lib/storage';
import { sendParentAlert } from '@/lib/notifications';
import ChatBubble from '@/components/ChatBubble';
import type { Message, SafetyCategory } from '@/types';

type AppState = 'idle' | 'recording' | 'processing' | 'speaking';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [appState, setAppState] = useState<AppState>('idle');
  const [showChat, setShowChat] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const durationTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadSettings().then((s) => {
      if (!s.configured || !s.anthropicApiKey) {
        router.replace('/setup');
        return;
      }
      setSettings(s);
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Bonjour ${s.childName} ! Je suis ${MASCOTS[s.mascot].name}. Appuie sur le bouton pour me poser ta question ! 🌟`,
        timestamp: new Date().toISOString(),
      }]);
    });
  }, []);

  // Pulse animation quand recording
  useEffect(() => {
    if (appState === 'recording') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
      durationTimer.current = setInterval(() => setRecordingDuration(d => d + 1), 1000);
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      if (durationTimer.current) clearInterval(durationTimer.current);
      setRecordingDuration(0);
    }
  }, [appState]);

  useEffect(() => {
    if (showChat) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, showChat]);

  const speak = useCallback((text: string, speed: number) => {
    Speech.stop();
    Speech.speak(text, {
      language: 'fr-FR',
      rate: speed,
      pitch: 1.05,
      onDone: () => setAppState('idle'),
      onError: () => setAppState('idle'),
    });
    setAppState('speaking');
  }, []);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!settings) return;
    setAppState('processing');
    setShowChat(true);
    const userMsg: Message = { id: uuidv4(), role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);

    const history = messages.filter(m => m.id !== 'welcome').map(m => ({ role: m.role, content: m.content }));

    try {
      const [chatReply, safetyResult] = await Promise.all([
        getChatResponse(text, history, settings.childName, settings.childAge, settings.schoolLevel, settings.anthropicApiKey),
        runSafetyCheck(text, settings.anthropicApiKey),
      ]);

      let reply = chatReply;
      let safetyFlag: SafetyCategory | undefined;

      if (safetyResult.flagged && safetyResult.category !== 'NONE') {
        const category = safetyResult.category as Exclude<SafetyCategory, 'NONE'>;
        const cfg = SAFETY_CONFIG[category];
        reply = cfg.childResponse(settings.childName);
        safetyFlag = category;

        const alert = {
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          category,
          severity: cfg.severity,
          triggerMessage: text,
          childName: settings.childName,
          parentAdvice: cfg.parentAdvice,
          resources: cfg.resources,
          acknowledged: false,
        };
        await saveAlert(alert);
        await sendParentAlert(alert);
      }

      const assistantMsg: Message = { id: uuidv4(), role: 'assistant', content: reply, timestamp: new Date().toISOString(), safetyFlag };
      setMessages(prev => [...prev, assistantMsg]);

      if (settings.enableVoiceResponse) {
        speak(reply, settings.voiceSpeed);
      } else {
        setAppState('idle');
      }
    } catch (err) {
      const errText = err instanceof Error ? `Erreur : ${err.message}` : 'Oups, problème de connexion. Réessaie !';
      setMessages(prev => [...prev, { id: uuidv4(), role: 'assistant', content: errText, timestamp: new Date().toISOString() }]);
      setAppState('idle');
    }
  }, [settings, messages, speak]);

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        RNAlert.alert('Micro requis', 'Autorise l\'accès au micro dans les Réglages pour parler à Edubudy.');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setAppState('recording');
      ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Medium);
    } catch {
      setAppState('idle');
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current || !settings) return;
    ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light);
    setAppState('processing');
    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      if (!uri) { setAppState('idle'); return; }

      if (!settings.openaiApiKey) {
        RNAlert.alert('Clé OpenAI manquante', 'Configure ta clé OpenAI dans les paramètres parents pour utiliser la voix.', [
          { text: 'Paramètres', onPress: () => router.push('/setup') },
          { text: 'Annuler', onPress: () => setAppState('idle') },
        ]);
        return;
      }

      const text = await transcribeAudio(uri, settings.openaiApiKey);
      if (text.trim()) {
        await handleSendMessage(text.trim());
      } else {
        setAppState('idle');
      }
    } catch {
      setAppState('idle');
    }
  };

  const handleBigButton = () => {
    if (appState === 'speaking') { Speech.stop(); setAppState('idle'); return; }
    if (appState === 'recording') { stopRecording(); return; }
    if (appState === 'idle') { startRecording(); }
  };

  const handleTextSend = () => {
    if (textInput.trim() && appState === 'idle') {
      handleSendMessage(textInput.trim());
      setTextInput('');
    }
  };

  if (!settings) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingEmoji}>🦉</Text>
      </View>
    );
  }

  const mascot = MASCOTS[settings.mascot];
  const theme = THEMES[settings.theme];

  const buttonLabel = {
    idle: 'Appuie pour parler',
    recording: `🔴 ${recordingDuration}s — Appuie pour envoyer`,
    processing: 'Edubudy réfléchit…',
    speaking: 'Appuie pour arrêter',
  }[appState];

  const buttonBg = {
    idle: theme.primary,
    recording: '#ef4444',
    processing: '#9ca3af',
    speaking: '#10b981',
  }[appState];

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerEmoji}>{mascot.emoji}</Text>
          <Text style={styles.headerName}>{mascot.name}</Text>
        </View>
        <View style={styles.headerRight}>
          {showChat && (
            <TouchableOpacity style={styles.headerBtn} onPress={() => setShowChat(false)}>
              <Text style={styles.headerBtnText}>Accueil</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/setup')}>
            <Text style={styles.headerBtnText}>⚙️ Parents</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showChat ? (
        /* ── VUE CONVERSATION ── */
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView ref={scrollRef} style={styles.chatScroll} contentContainerStyle={styles.chatContent}>
            {messages.map(m => (
              <ChatBubble key={m.id} message={m} themeColor={theme.primary} mascotEmoji={mascot.emoji} />
            ))}
            {appState === 'processing' && (
              <View style={styles.typingRow}>
                <View style={[styles.typingAvatar, { backgroundColor: theme.light }]}>
                  <Text>{mascot.emoji}</Text>
                </View>
                <View style={styles.typingBubble}>
                  {[0, 1, 2].map(i => (
                    <View key={i} style={[styles.typingDot, { backgroundColor: theme.primary }]} />
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={[styles.chatControls, { paddingBottom: insets.bottom + 8 }]}>
            <TouchableOpacity
              style={[styles.smallMic, { backgroundColor: buttonBg }]}
              onPress={handleBigButton}
              disabled={appState === 'processing'}
              activeOpacity={0.8}
            >
              <Text style={styles.smallMicIcon}>
                {appState === 'idle' ? '🎤' : appState === 'recording' ? '⏹' : appState === 'processing' ? '⏳' : '🔊'}
              </Text>
            </TouchableOpacity>
            <TextInput
              style={styles.textInputChat}
              value={textInput}
              onChangeText={setTextInput}
              placeholder="Ou tape ta question…"
              placeholderTextColor="#9ca3af"
              returnKeyType="send"
              onSubmitEditing={handleTextSend}
              editable={appState === 'idle'}
            />
            <TouchableOpacity
              style={[styles.sendBtn, { backgroundColor: textInput.trim() && appState === 'idle' ? theme.primary : '#d1d5db' }]}
              onPress={handleTextSend}
              disabled={!textInput.trim() || appState !== 'idle'}
            >
              <Text style={styles.sendBtnText}>→</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

      ) : (
        /* ── VUE ACCUEIL — Grand bouton ── */
        <View style={styles.homeContainer}>
          {/* Mascotte */}
          <View style={[styles.mascotCircle, { backgroundColor: theme.light }]}>
            <Text style={styles.mascotEmoji}>{mascot.emoji}</Text>
          </View>
          <Text style={styles.greeting}>Bonjour {settings.childName} !</Text>
          <Text style={styles.subGreeting}>Je suis {mascot.name}, ton assistant</Text>

          {/* Grand bouton */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[styles.bigButton, { backgroundColor: buttonBg,
                shadowColor: appState === 'idle' ? theme.primary : buttonBg,
              }]}
              onPress={handleBigButton}
              disabled={appState === 'processing'}
              activeOpacity={0.85}
            >
              <Text style={styles.bigButtonIcon}>
                {appState === 'idle' ? '🎤' : appState === 'recording' ? '⏹' : appState === 'processing' ? '⏳' : '🔊'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <Text style={[styles.buttonLabel, { color: appState === 'recording' ? '#ef4444' : theme.primary }]}>
            {buttonLabel}
          </Text>

          {/* Saisie texte */}
          <KeyboardAvoidingView style={styles.textRow} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <TextInput
              style={styles.textInput}
              value={textInput}
              onChangeText={setTextInput}
              placeholder="Ou tape ta question ici…"
              placeholderTextColor="#9ca3af"
              returnKeyType="send"
              onSubmitEditing={handleTextSend}
              editable={appState === 'idle'}
            />
            <TouchableOpacity
              style={[styles.sendBtn, { backgroundColor: textInput.trim() && appState === 'idle' ? theme.primary : '#d1d5db' }]}
              onPress={handleTextSend}
              disabled={!textInput.trim() || appState !== 'idle'}
            >
              <Text style={styles.sendBtnText}>→</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>

          {messages.length > 1 && (
            <TouchableOpacity onPress={() => setShowChat(true)}>
              <Text style={[styles.viewHistory, { color: theme.primary }]}>Voir la conversation</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingEmoji: { fontSize: 64 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12, backgroundColor: 'rgba(255,255,255,0.8)' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerEmoji: { fontSize: 24 },
  headerName: { fontSize: 17, fontWeight: '700', color: '#1f2937' },
  headerRight: { flexDirection: 'row', gap: 8 },
  headerBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.06)' },
  headerBtnText: { fontSize: 13, color: '#4b5563' },
  homeContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 16 },
  mascotCircle: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center' },
  mascotEmoji: { fontSize: 60 },
  greeting: { fontSize: 26, fontWeight: '800', color: '#1f2937', textAlign: 'center' },
  subGreeting: { fontSize: 15, color: '#6b7280', textAlign: 'center', marginTop: -8 },
  bigButton: {
    width: 180, height: 180, borderRadius: 90,
    alignItems: 'center', justifyContent: 'center',
    shadowOpacity: 0.35, shadowOffset: { width: 0, height: 8 }, shadowRadius: 20, elevation: 8,
  },
  bigButtonIcon: { fontSize: 72 },
  buttonLabel: { fontSize: 14, fontWeight: '600', textAlign: 'center', maxWidth: 220 },
  textRow: { flexDirection: 'row', gap: 8, width: '100%', maxWidth: 360 },
  textInput: { flex: 1, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#e5e7eb', backgroundColor: '#fff', paddingHorizontal: 16, fontSize: 15, color: '#1f2937' },
  sendBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  sendBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  viewHistory: { fontSize: 14, textDecorationLine: 'underline', marginTop: 4 },
  chatScroll: { flex: 1 },
  chatContent: { padding: 16, paddingBottom: 8 },
  typingRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 12 },
  typingAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  typingBubble: { flexDirection: 'row', gap: 5, backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 18, borderBottomLeftRadius: 4 },
  typingDot: { width: 8, height: 8, borderRadius: 4 },
  chatControls: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingTop: 8, backgroundColor: 'rgba(255,255,255,0.95)', borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  smallMic: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  smallMicIcon: { fontSize: 20 },
  textInputChat: { flex: 1, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#e5e7eb', backgroundColor: '#fff', paddingHorizontal: 14, fontSize: 15, color: '#1f2937' },
});
