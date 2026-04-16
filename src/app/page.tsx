'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ChatBubble from '@/components/ChatBubble';
import { MASCOTS, THEMES } from '@/lib/settings';
import { v4 as uuidv4 } from 'uuid';
import type { Message, SafetyCategory } from '@/types';

interface ClientConfig {
  configured: boolean;
  childName: string;
  mascot: keyof typeof MASCOTS;
  theme: keyof typeof THEMES;
  voiceSpeed: number;
  enableVoiceResponse: boolean;
}

type AppState = 'idle' | 'listening' | 'processing' | 'speaking';

// Méthode d'entrée vocale disponible sur l'appareil
type VoiceInputMode = 'speechrecognition' | 'mediarecorder' | 'textonly';

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

function detectVoiceInputMode(): VoiceInputMode {
  if (typeof window === 'undefined') return 'textonly';
  if (window.SpeechRecognition || window.webkitSpeechRecognition) return 'speechrecognition';
  if (typeof MediaRecorder !== 'undefined' && navigator.mediaDevices?.getUserMedia) return 'mediarecorder';
  return 'textonly';
}

export default function HomePage() {
  const router = useRouter();
  const [config, setConfig] = useState<ClientConfig | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [appState, setAppState] = useState<AppState>('idle');
  const [transcript, setTranscript] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [inputMode, setInputMode] = useState<VoiceInputMode>('textonly');
  const [whisperAvailable, setWhisperAvailable] = useState(true);

  // Web Speech API
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // MediaRecorder (iOS)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Init config ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((d: ClientConfig) => {
        if (!d.configured) { router.replace('/setup'); return; }
        setConfig(d);
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: `Bonjour ${d.childName} ! Je suis ${MASCOTS[d.mascot ?? 'owl'].name}. Appuie sur le bouton et pose-moi ta question ! 🌟`,
          timestamp: new Date().toISOString(),
        }]);
      })
      .catch(() => router.replace('/setup'));

    const mode = detectVoiceInputMode();
    setInputMode(mode);

    // Vérifier si Whisper est configuré (mode mediarecorder uniquement)
    if (mode === 'mediarecorder') {
      fetch('/api/transcribe', { method: 'POST', body: new FormData() })
        .then((r) => { if (r.status === 503) setWhisperAvailable(false); })
        .catch(() => {});
    }
  }, [router]);

  // ── Speech Recognition setup (non-iOS) ──────────────────────────────────
  useEffect(() => {
    if (inputMode !== 'speechrecognition') return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = 'fr-FR';
    r.continuous = false;
    r.interimResults = true;
    r.onresult = (e: SpeechRecognitionEvent) => {
      setTranscript(Array.from(e.results).map(x => x[0].transcript).join(''));
    };
    r.onend = () => {
      setTranscript((t) => {
        if (t.trim()) { handleSendMessage(t.trim()); }
        else { setAppState('idle'); }
        return '';
      });
    };
    r.onerror = () => { setAppState('idle'); setTranscript(''); };
    recognitionRef.current = r;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputMode]);

  useEffect(() => {
    if (showChat) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showChat]);

  // ── TTS — avec unlock iOS (doit être appelé dans un geste utilisateur) ──
  const ttsUnlocked = useRef(false);
  const unlockTTS = () => {
    if (ttsUnlocked.current) return;
    // Utterance silencieuse pour débloquer iOS
    const u = new SpeechSynthesisUtterance('');
    u.volume = 0;
    window.speechSynthesis.speak(u);
    ttsUnlocked.current = true;
  };

  const speak = useCallback((text: string, speed: number) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'fr-FR';
    u.rate = speed;
    u.pitch = 1.05;
    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const fr = voices.find(v => v.lang === 'fr-FR' && v.localService)
              ?? voices.find(v => v.lang === 'fr-FR')
              ?? voices.find(v => v.lang.startsWith('fr'));
      if (fr) u.voice = fr;
    };
    window.speechSynthesis.getVoices().length ? setVoice() : (window.speechSynthesis.onvoiceschanged = setVoice);
    u.onstart = () => setAppState('speaking');
    u.onend = u.onerror = () => setAppState('idle');
    // iOS requiert un délai minimal après unlock
    setTimeout(() => window.speechSynthesis.speak(u), 50);
  }, []);

  // ── Envoi message → API chat ─────────────────────────────────────────────
  const handleSendMessage = useCallback(async (text: string) => {
    if (!config) return;
    setAppState('processing');
    setTranscript('');
    setShowChat(true);

    const userMsg: Message = { id: uuidv4(), role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);

    const history = messages
      .filter(m => m.id !== 'welcome')
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await res.json() as { reply: string; safetyFlag?: SafetyCategory };

      const assistantMsg: Message = {
        id: uuidv4(), role: 'assistant', content: data.reply,
        timestamp: new Date().toISOString(), safetyFlag: data.safetyFlag,
      };
      setMessages(prev => [...prev, assistantMsg]);

      if (config.enableVoiceResponse) speak(data.reply, config.voiceSpeed ?? 0.9);
      else setAppState('idle');
    } catch {
      const errMsg = 'Oups, un problème est survenu. Réessaie dans quelques secondes !';
      setMessages(prev => [...prev, { id: uuidv4(), role: 'assistant', content: errMsg, timestamp: new Date().toISOString() }]);
      setAppState('idle');
    }
  }, [config, messages, speak]);

  // ── Transcription audio (iOS / MediaRecorder) ────────────────────────────
  const transcribeAudio = useCallback(async (blob: Blob) => {
    setAppState('processing');
    const formData = new FormData();
    const ext = blob.type.includes('mp4') ? 'm4a' : 'webm';
    formData.append('audio', blob, `recording.${ext}`);
    try {
      const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
      const { text } = await res.json() as { text?: string };
      if (text?.trim()) {
        handleSendMessage(text.trim());
      } else {
        setAppState('idle');
      }
    } catch {
      setAppState('idle');
    }
  }, [handleSendMessage]);

  const startMediaRecorder = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });

      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        transcribeAudio(blob);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setAppState('listening');
    } catch {
      setAppState('idle');
      alert("Edubudy a besoin d'accéder au micro. Autorise l'accès dans les réglages de ton iPhone.");
    }
  }, [transcribeAudio]);

  const stopMediaRecorder = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // ── Handler bouton principal ─────────────────────────────────────────────
  const handleBigButton = () => {
    unlockTTS(); // iOS: débloque TTS dans le geste utilisateur

    if (appState === 'speaking') {
      window.speechSynthesis?.cancel();
      setAppState('idle');
      return;
    }
    if (appState !== 'idle') return;

    if (inputMode === 'speechrecognition') {
      setTranscript('');
      setAppState('listening');
      recognitionRef.current?.start();
    } else if (inputMode === 'mediarecorder' && whisperAvailable) {
      startMediaRecorder();
    }
  };

  const handleStopListening = () => {
    if (inputMode === 'mediarecorder') stopMediaRecorder();
    else if (inputMode === 'speechrecognition') recognitionRef.current?.stop();
  };

  const handleTextSend = (e: React.FormEvent) => {
    e.preventDefault();
    unlockTTS();
    if (textInput.trim() && appState === 'idle') {
      handleSendMessage(textInput.trim());
      setTextInput('');
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-6xl animate-bounce">🦉</div>
      </div>
    );
  }

  const mascot = MASCOTS[config.mascot ?? 'owl'];
  const theme = THEMES[config.theme ?? 'blue'];

  const isVoiceAvailable = (inputMode === 'speechrecognition') ||
    (inputMode === 'mediarecorder' && whisperAvailable);

  const buttonLabel = {
    idle: isVoiceAvailable ? 'Appuie pour parler' : 'Tape ta question ci-dessous',
    listening: inputMode === 'mediarecorder' ? '🔴 Enregistrement... (appuie pour arrêter)' : '🔴 Je t\'écoute...',
    processing: 'Edubudy réfléchit...',
    speaking: 'Appuie pour arrêter',
  }[appState];

  const buttonAction = appState === 'listening' && inputMode === 'mediarecorder'
    ? handleStopListening
    : handleBigButton;

  return (
    <div className="min-h-screen flex flex-col select-none"
      style={{ background: `linear-gradient(160deg, ${theme.bg} 0%, white 60%)` }}>

      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 safe-top">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{mascot.emoji}</span>
          <span className="font-bold text-gray-700">{mascot.name}</span>
        </div>
        <div className="flex gap-2">
          {showChat && (
            <button onClick={() => setShowChat(false)}
              className="text-xs text-gray-400 px-3 py-1.5 rounded-full bg-white/70 border border-gray-200">
              Accueil
            </button>
          )}
          <a href="/setup" className="text-xs text-gray-400 px-3 py-1.5 rounded-full bg-white/70 border border-gray-200">
            ⚙️ Parents
          </a>
        </div>
      </header>

      {/* ── VUE CONVERSATION ── */}
      {showChat ? (
        <div className="flex-1 flex flex-col overflow-hidden max-w-2xl w-full mx-auto">
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
            {messages.map(m => <ChatBubble key={m.id} message={m} themeColor={theme.primary} />)}
            {appState === 'processing' && (
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xl"
                  style={{ background: theme.light }}>{mascot.emoji}</div>
                <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                      style={{ background: theme.primary, animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {transcript && (
            <div className="mx-4 mb-2 px-3 py-2 bg-white/80 rounded-xl text-sm text-gray-500 italic">
              {transcript}
            </div>
          )}

          <div className="px-4 pb-6 pt-2 flex flex-col items-center gap-3 safe-bottom">
            {isVoiceAvailable && (
              <button onClick={buttonAction} disabled={appState === 'processing'}
                className="w-14 h-14 rounded-full flex items-center justify-center text-xl text-white shadow-lg active:scale-95 transition-all disabled:opacity-40"
                style={{ background: appState === 'listening' ? '#ef4444' : appState === 'speaking' ? '#10b981' : theme.primary }}>
                {appState === 'idle' && '🎤'}
                {appState === 'listening' && (
                  <span className="relative flex">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75" />
                    <span className="relative">🎤</span>
                  </span>
                )}
                {appState === 'processing' && '⏳'}
                {appState === 'speaking' && '🔊'}
              </button>
            )}
            <form onSubmit={handleTextSend} className="flex gap-2 w-full">
              <input type="text" value={textInput} onChange={e => setTextInput(e.target.value)}
                placeholder="Ou tape ta question..."
                disabled={appState !== 'idle'}
                className="flex-1 px-4 py-3 rounded-full border-2 border-gray-200 outline-none text-sm bg-white disabled:bg-gray-100"
              />
              <button type="submit" disabled={!textInput.trim() || appState !== 'idle'}
                className="px-5 py-3 rounded-full text-white text-sm font-bold disabled:bg-gray-300 transition-colors"
                style={{ background: textInput.trim() && appState === 'idle' ? theme.primary : '#9ca3af' }}>
                →
              </button>
            </form>
          </div>
        </div>

      ) : (
        /* ── VUE ACCUEIL — Grand bouton ── */
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8 safe-bottom">
          {/* Mascotte */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-28 h-28 rounded-full flex items-center justify-center text-6xl shadow-lg"
              style={{ background: theme.light }}>
              {mascot.emoji}
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">Bonjour {config.childName} !</h1>
              <p className="text-gray-500 text-sm mt-1">Je suis {mascot.name}, ton assistant</p>
            </div>
          </div>

          {/* Avertissement si Whisper non configuré sur iOS */}
          {inputMode === 'mediarecorder' && !whisperAvailable && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-700 max-w-xs text-center">
              💡 Ajoute <strong>OPENAI_API_KEY</strong> dans <code>.env.local</code> pour activer la voix sur iPhone.
            </div>
          )}

          {/* Grand bouton */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={buttonAction}
              disabled={appState === 'processing' || !isVoiceAvailable}
              className="relative w-44 h-44 rounded-full flex items-center justify-center text-7xl text-white active:scale-95 transition-all duration-150 disabled:opacity-50"
              style={{
                background: appState === 'listening'
                  ? '#ef4444'
                  : appState === 'speaking'
                  ? '#10b981'
                  : isVoiceAvailable
                  ? `radial-gradient(circle at 40% 40%, ${theme.primary}dd, ${theme.primary})`
                  : '#9ca3af',
                boxShadow: appState === 'idle' && isVoiceAvailable
                  ? `0 24px 48px ${theme.primary}44, 0 8px 16px ${theme.primary}33`
                  : '0 8px 24px rgba(0,0,0,0.1)',
              }}
            >
              {appState === 'listening' && (
                <>
                  <span className="absolute inset-0 rounded-full animate-ping opacity-20"
                    style={{ background: '#ef4444' }} />
                  <span className="absolute inset-2 rounded-full animate-ping opacity-10"
                    style={{ background: '#ef4444', animationDelay: '0.3s' }} />
                </>
              )}
              {appState === 'idle' && (isVoiceAvailable ? '🎤' : '⌨️')}
              {appState === 'listening' && '🎤'}
              {appState === 'processing' && '⏳'}
              {appState === 'speaking' && '🔊'}
            </button>

            <p className="text-sm font-medium text-center max-w-[200px]"
              style={{ color: appState === 'idle' ? theme.primary : appState === 'listening' ? '#ef4444' : '#6b7280' }}>
              {buttonLabel}
            </p>
          </div>

          {/* Preview transcription */}
          {transcript && (
            <div className="px-5 py-3 bg-white rounded-2xl shadow-sm text-gray-600 text-sm italic max-w-xs text-center">
              {transcript}
            </div>
          )}

          {/* Saisie texte */}
          <form onSubmit={handleTextSend} className="flex gap-2 w-full max-w-sm">
            <input type="text" value={textInput} onChange={e => setTextInput(e.target.value)}
              placeholder="Tape ta question ici..."
              disabled={appState !== 'idle'}
              className="flex-1 px-4 py-3 rounded-full border-2 border-gray-200 outline-none text-sm bg-white disabled:bg-gray-100"
            />
            <button type="submit" disabled={!textInput.trim() || appState !== 'idle'}
              className="px-5 py-3 rounded-full text-white text-sm font-bold disabled:bg-gray-300 transition-colors"
              style={{ background: textInput.trim() && appState === 'idle' ? theme.primary : '#9ca3af' }}>
              →
            </button>
          </form>

          {messages.length > 1 && (
            <button onClick={() => setShowChat(true)} className="text-sm underline underline-offset-2"
              style={{ color: theme.primary }}>
              Voir la conversation
            </button>
          )}
        </div>
      )}
    </div>
  );
}
