'use client';

import type { Message } from '@/types';

interface ChatBubbleProps {
  message: Message;
  themeColor?: string;
}

const SAFETY_FLAG_LABELS: Record<string, string> = {
  HARCELEMENT: '🟠 Tes parents ont été informés pour t\'aider',
  AGRESSION_SEXUELLE: '🔴 Tes parents ont été informés pour t\'aider',
  IDEATION_SUICIDAIRE: '🔴 Tes parents ont été informés pour t\'aider',
  VIOLENCE: '🟠 Tes parents ont été informés pour t\'aider',
  DETRESSE_EMOTIONNELLE_SEVERE: '🟡 Tes parents ont été informés pour t\'aider',
};

export default function ChatBubble({ message, themeColor = '#3b82f6' }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg flex-shrink-0" style={{ background: `${themeColor}22` }}>
          💬
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className="px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm"
          style={isUser
            ? { background: themeColor, color: 'white', borderBottomRightRadius: '6px' }
            : { background: 'white', color: '#1f2937', borderBottomLeftRadius: '6px' }
          }
        >
          {message.content}
        </div>

        {message.safetyFlag && SAFETY_FLAG_LABELS[message.safetyFlag] && (
          <div className="text-xs text-gray-400 px-1">{SAFETY_FLAG_LABELS[message.safetyFlag]}</div>
        )}

        <div className="text-xs text-gray-400 px-1">
          {new Date(message.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {isUser && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{ background: `${themeColor}22` }}>
          😊
        </div>
      )}
    </div>
  );
}
