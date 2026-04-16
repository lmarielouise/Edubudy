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

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function HomePage() {
  const router = useRouter();
  const [config, setConfig] = useState<ClientConfig | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [appState, setAppState] = useState<AppState>('idle');
  const [transcript, setTranscript] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [textInput, setTextInput] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((d: ClientConfig) => {
        if (!d.configured) { router.replace('/setup'); return; }
        setConfig(d);
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: `Bonjour ${d.childName} ! Je suis ${MASCOTS[d.mascot ?? 'owl'].name}, ton assistant. Appuie sur le bouton et pose-moi ta question ! 🌟`,
          timestamp: new Date().toISOString(),
        }]);
      })
      .catch(() => router.replace('/setup'));
  }, [router]);

  useEffect(() => {
    if (!config) return;
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
        if (t.trim()) { sendMessage(t.trim()); }
        else { setAppState('idle'); }
        return '';
      });
    };
    r.onerror = () => { setAppState('idle'); setTranscript(''); };
    recognitionRef.current = r;
  }, [config]);

  useEffect(() => {
    if (showChat) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showChat]);

  const speak = useCallback((text: string, speed: number) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'fr-FR';
    u.rate = speed;
    u.pitch = 1.05;
    const setVoice = () => {
      const v = window.speechSynthesis.getVoices();
      const fr = v.find(x => x.lang === 'fr-FR' && x.localService) ?? v.find(x => x.lang === 'fr-FR');
      if (fr) u.voice = fr;
    };
    window.speechSynthesis.getVoices().length ? setVoice() : (window.speechSynthesis.onvoiceschanged = setVoice);
    u.onstart = () => setAppState('speaking');
    u.onend = u.onerror = () => setAppState('idle');
    window.speechSynthesis.speak(u);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!config) return;
    setAppState('processing');
    setTranscript('');
    setShowChat(true);

    const userMsg: Message = { id: uuidv4(), role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);

    const history = messages.filter(m => m.id !== 'welcome').map(m => ({ role: m.role, content: m.content }));

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
      const err = 'Oups, un problème est survenu. Réessaie dans quelques secondes !';
      setMessages(prev => [...prev, { id: uuidv4(), role: 'assistant', content: err, timestamp: new Date().toISOString() }]);
      setAppState('idle');
    }
  }, [config, messages, speak]);

  const handleBigButton = () => {
    if (appState === 'speaking') { window.speechSynthesis.cancel(); setAppState('idle'); return; }
    if (appState !== 'idle') return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR || !recognitionRef.current) return;
    setTranscript('');
    setAppState('listening');
    recognitionRef.current.start();
  };

  const handleTextSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim() && appState === 'idle') {
      sendMessage(textInput.trim());
      setTextInput('');
    }
  };

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-6xl animate-bounce">🦉</div>
      </div>
    );
  }

  const mascot = MASCOTS[config.mascot ?? 'owl'];
  const theme = THEMES[config.theme ?? 'blue'];

  const buttonLabel = { idle: 'Appuie pour parler', listening: '🔴 Je t\'écoute...', processing: 'Edubudy réfléchit...', speaking: 'Appuie pour arrêter' }[appState];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: `linear-gradient(160deg, ${theme.bg} 0%, white 60%)` }}>
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{mascot.emoji}</span>
          <span className="font-bold text-gray-700">{mascot.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {showChat && (
            <button onClick={() => setShowChat(false)} className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-full bg-white/70 border border-gray-200">
              Accueil
            </button>
          )}
          <a href="/setup" className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-full bg-white/70 border border-gray-200">
            ⚙️ Parents
          </a>
        </div>
      </header>

      {/* ── CHAT VIEW ── */}
      {showChat ? (
        <div className="flex-1 flex flex-col overflow-hidden max-w-2xl w-full mx-auto">
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
            {messages.map(m => <ChatBubble key={m.id} message={m} themeColor={theme.primary} />)}
            {appState === 'processing' && (
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xl" style={{ background: theme.light }}>{mascot.emoji}</div>
                <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: theme.primary, animationDelay: `${i*0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {transcript && (
            <div className="mx-4 mb-2 px-3 py-2 bg-white/80 rounded-xl text-sm text-gray-500 italic">{transcript}</div>
          )}

          {/* Bottom controls in chat view */}
          <div className="px-4 pb-4 pt-2 flex flex-col items-center gap-3">
            <button
              onClick={handleBigButton}
              disabled={appState === 'processing'}
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl text-white shadow-lg active:scale-95 transition-all disabled:opacity-40"
              style={{ background: appState === 'listening' ? '#ef4444' : appState === 'speaking' ? '#10b981' : theme.primary }}
            >
              {appState === 'idle' && '🎤'}
              {appState === 'listening' && <span className="relative flex"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75" /><span className="relative">🎤</span></span>}
              {appState === 'processing' && '⏳'}
              {appState === 'speaking' && '🔊'}
            </button>
            <form onSubmit={handleTextSend} className="flex gap-2 w-full">
              <input
                type="text"
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                placeholder="Ou tape ta question..."
                disabled={appState !== 'idle'}
                className="flex-1 px-4 py-2 rounded-full border-2 border-gray-200 focus:outline-none text-sm bg-white disabled:bg-gray-100"
                style={{ '--tw-border-color': theme.primary } as React.CSSProperties}
              />
              <button type="submit" disabled={!textInput.trim() || appState !== 'idle'}
                className="px-4 py-2 rounded-full text-white text-sm font-medium disabled:bg-gray-300 transition-colors"
                style={{ background: textInput.trim() && appState === 'idle' ? theme.primary : '#9ca3af' }}>
                Envoyer
              </button>
            </form>
          </div>
        </div>

      ) : (
        /* ── HOME VIEW — Big Button ── */
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          {/* Mascot */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-32 h-32 rounded-full flex items-center justify-center text-7xl shadow-lg"
              style={{ background: theme.light }}
            >
              {mascot.emoji}
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">Bonjour {config.childName} !</h1>
              <p className="text-gray-500 text-sm mt-1">Je suis {mascot.name}, ton assistant</p>
            </div>
          </div>

          {/* Big button */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleBigButton}
              disabled={appState === 'processing'}
              className="relative w-40 h-40 rounded-full flex items-center justify-center text-6xl text-white shadow-2xl active:scale-95 transition-all duration-150 disabled:opacity-50"
              style={{
                background: appState === 'listening'
                  ? '#ef4444'
                  : appState === 'speaking'
                  ? '#10b981'
                  : `linear-gradient(135deg, ${theme.primary}, ${theme.primary}cc)`,
                boxShadow: appState === 'idle' ? `0 20px 40px ${theme.primary}55` : undefined,
              }}
            >
              {appState === 'listening' && (
                <span className="absolute inset-0 rounded-full animate-ping" style={{ background: '#ef444433' }} />
              )}
              {appState === 'idle' && '🎤'}
              {appState === 'listening' && '🎤'}
              {appState === 'processing' && '⏳'}
              {appState === 'speaking' && '🔊'}
            </button>

            <p className="text-sm font-medium text-gray-500 text-center">{buttonLabel}</p>
          </div>

          {/* Transcript preview */}
          {transcript && (
            <div className="px-5 py-3 bg-white rounded-2xl shadow-sm text-gray-600 text-sm italic max-w-xs text-center">
              {transcript}
            </div>
          )}

          {/* Text fallback */}
          <form onSubmit={handleTextSend} className="flex gap-2 w-full max-w-sm">
            <input
              type="text"
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder="Tape ta question ici..."
              disabled={appState !== 'idle'}
              className="flex-1 px-4 py-3 rounded-full border-2 border-gray-200 outline-none text-sm bg-white disabled:bg-gray-100 focus:border-blue-300"
            />
            <button
              type="submit"
              disabled={!textInput.trim() || appState !== 'idle'}
              className="px-5 py-3 rounded-full text-white text-sm font-bold disabled:bg-gray-300 transition-colors"
              style={{ background: textInput.trim() && appState === 'idle' ? theme.primary : '#9ca3af' }}
            >
              →
            </button>
          </form>

          {/* View history */}
          {messages.length > 1 && (
            <button onClick={() => setShowChat(true)} className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2">
              Voir la conversation
            </button>
          )}
        </div>
      )}
    </div>
  );
}
