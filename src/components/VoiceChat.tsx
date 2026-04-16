'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ChatBubble from './ChatBubble';
import type { Message, SafetyCategory } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface VoiceChatProps {
  childName: string;
}

type ListeningState = 'idle' | 'listening' | 'processing' | 'speaking';

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function VoiceChat({ childName }: VoiceChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Bonjour ${childName} ! Je suis Edubudy, ton assistant. Je suis là pour t'aider avec tes devoirs et répondre à tes questions. Appuie sur le micro pour me parler ! 🌟`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [state, setState] = useState<ListeningState>('idle');
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = Array.from(event.results);
      const transcript = results.map((r) => r[0].transcript).join('');
      setTranscript(transcript);
    };

    recognition.onend = () => {
      if (transcript.trim()) {
        handleSendMessage(transcript.trim());
      } else {
        setState('idle');
        setTranscript('');
      }
    };

    recognition.onerror = () => {
      setState('idle');
      setTranscript('');
    };

    recognitionRef.current = recognition;
  }, [transcript]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speak = useCallback((text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.92;
    utterance.pitch = 1.05;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const frenchVoice = voices.find((v) => v.lang === 'fr-FR' && v.localService)
        ?? voices.find((v) => v.lang === 'fr-FR')
        ?? voices.find((v) => v.lang.startsWith('fr'));
      if (frenchVoice) utterance.voice = frenchVoice;
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      loadVoices();
    } else {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    utterance.onstart = () => setState('speaking');
    utterance.onend = () => setState('idle');
    utterance.onerror = () => setState('idle');

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const handleSendMessage = useCallback(async (text: string) => {
    setState('processing');
    setTranscript('');

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    const history = messages
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      const data = (await res.json()) as { reply: string; safetyFlag?: SafetyCategory };

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
        safetyFlag: data.safetyFlag,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      speak(data.reply);
    } catch {
      const errorMsg = 'Oups, je n\'arrive pas à te répondre là. Réessaie dans quelques secondes !';
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: 'assistant',
          content: errorMsg,
          timestamp: new Date().toISOString(),
        },
      ]);
      speak(errorMsg);
    }
  }, [messages, speak]);

  const startListening = () => {
    if (state !== 'idle') {
      window.speechSynthesis.cancel();
      setState('idle');
      return;
    }
    setTranscript('');
    setState('listening');
    recognitionRef.current?.start();
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setState('idle');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        {state === 'processing' && (
          <div className="flex items-center gap-2 ml-2">
            <div className="w-10 h-10 rounded-full bg-edubudy-yellow flex items-center justify-center text-xl">🦉</div>
            <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-edubudy-blue rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Transcript preview */}
      {transcript && (
        <div className="mx-4 mb-2 px-4 py-2 bg-white/70 rounded-xl text-gray-600 text-sm italic">
          {transcript}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col items-center gap-4 py-6 px-4">
        {!isSupported ? (
          <TextInput onSend={handleSendMessage} disabled={state === 'processing'} />
        ) : (
          <>
            <button
              onClick={state === 'speaking' ? stopSpeaking : startListening}
              disabled={state === 'processing'}
              className={`
                relative w-24 h-24 rounded-full flex items-center justify-center text-4xl
                transition-all duration-200 shadow-lg active:scale-95
                ${state === 'idle' ? 'bg-edubudy-blue hover:bg-blue-500 text-white' : ''}
                ${state === 'listening' ? 'bg-red-500 text-white scale-110' : ''}
                ${state === 'processing' ? 'bg-gray-300 text-gray-400 cursor-not-allowed' : ''}
                ${state === 'speaking' ? 'bg-edubudy-green text-white' : ''}
              `}
              aria-label={
                state === 'idle' ? 'Appuyer pour parler' :
                state === 'listening' ? 'En écoute - appuyer pour arrêter' :
                state === 'processing' ? 'Edubudy réfléchit...' :
                'Edubudy parle - appuyer pour arrêter'
              }
            >
              {state === 'idle' && '🎤'}
              {state === 'listening' && (
                <span className="relative flex h-full w-full items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative text-4xl">🎤</span>
                </span>
              )}
              {state === 'processing' && '⏳'}
              {state === 'speaking' && '🔊'}
            </button>

            <p className="text-sm text-gray-500 text-center">
              {state === 'idle' && 'Appuie pour parler à Edubudy'}
              {state === 'listening' && '🔴 Je t\'écoute...'}
              {state === 'processing' && 'Edubudy réfléchit...'}
              {state === 'speaking' && 'Appuie pour arrêter'}
            </p>

            {/* Text fallback */}
            <TextInput onSend={handleSendMessage} disabled={state !== 'idle'} compact />
          </>
        )}
      </div>
    </div>
  );
}

function TextInput({
  onSend,
  disabled,
  compact = false,
}: {
  onSend: (text: string) => void;
  disabled: boolean;
  compact?: boolean;
}) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSend(value.trim());
      setValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 w-full ${compact ? 'opacity-60' : ''}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={compact ? 'Ou tape ta question...' : 'Tape ta question ici...'}
        disabled={disabled}
        className="flex-1 px-4 py-2 rounded-full border-2 border-edubudy-blue/30 focus:border-edubudy-blue outline-none text-sm bg-white disabled:bg-gray-100"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="px-4 py-2 bg-edubudy-blue text-white rounded-full text-sm font-medium disabled:bg-gray-300 hover:bg-blue-500 transition-colors"
      >
        Envoyer
      </button>
    </form>
  );
}
