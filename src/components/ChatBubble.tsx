'use client';

import type { Message } from '@/types';

interface ChatBubbleProps {
  message: Message;
}

const SAFETY_FLAG_LABELS: Record<string, string> = {
  HARCELEMENT: '🟠 Sujet important partagé avec tes parents',
  AGRESSION_SEXUELLE: '🔴 Sujet important partagé avec tes parents',
  IDEATION_SUICIDAIRE: '🔴 Sujet important partagé avec tes parents',
  VIOLENCE: '🟠 Sujet important partagé avec tes parents',
  DETRESSE_EMOTIONNELLE_SEVERE: '🟡 Tes parents ont été informés pour t\'aider',
};

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="w-10 h-10 rounded-full bg-edubudy-yellow flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
          🦉
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`
            px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
            ${isUser
              ? 'bg-edubudy-blue text-white rounded-tr-none'
              : 'bg-white text-gray-800 rounded-tl-none'
            }
          `}
        >
          {message.content}
        </div>

        {message.safetyFlag && SAFETY_FLAG_LABELS[message.safetyFlag] && (
          <div className="text-xs text-gray-400 px-1">
            {SAFETY_FLAG_LABELS[message.safetyFlag]}
          </div>
        )}

        <div className={`text-xs text-gray-400 px-1`}>
          {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-edubudy-blue/20 flex items-center justify-center text-sm flex-shrink-0">
          😊
        </div>
      )}
    </div>
  );
}
