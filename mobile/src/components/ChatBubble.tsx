import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Message } from '@/types';

interface Props {
  message: Message;
  themeColor: string;
  mascotEmoji: string;
}

export default function ChatBubble({ message, themeColor, mascotEmoji }: Props) {
  const isUser = message.role === 'user';
  const time = new Date(message.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: themeColor + '22' }]}>
          <Text style={styles.avatarEmoji}>{mascotEmoji}</Text>
        </View>
      )}
      <View style={[styles.content, isUser ? styles.contentUser : styles.contentAssistant]}>
        <View style={[styles.bubble, isUser
          ? { backgroundColor: themeColor, borderBottomRightRadius: 4 }
          : { backgroundColor: '#fff', borderBottomLeftRadius: 4 }
        ]}>
          <Text style={[styles.text, isUser ? styles.textUser : styles.textAssistant]}>
            {message.content}
          </Text>
        </View>
        <Text style={[styles.time, isUser ? styles.timeUser : styles.timeAssistant]}>{time}</Text>
      </View>
      {isUser && (
        <View style={[styles.avatar, { backgroundColor: themeColor + '22' }]}>
          <Text style={styles.avatarEmoji}>😊</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, gap: 8 },
  rowUser: { flexDirection: 'row-reverse' },
  rowAssistant: {},
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarEmoji: { fontSize: 16 },
  content: { maxWidth: '78%', gap: 3 },
  contentUser: { alignItems: 'flex-end' },
  contentAssistant: { alignItems: 'flex-start' },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, shadowRadius: 3 },
  text: { fontSize: 15, lineHeight: 22 },
  textUser: { color: '#fff' },
  textAssistant: { color: '#1f2937' },
  time: { fontSize: 11, color: '#9ca3af' },
  timeUser: { marginRight: 4 },
  timeAssistant: { marginLeft: 4 },
});
