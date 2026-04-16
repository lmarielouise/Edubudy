import * as Notifications from 'expo-notifications';
import type { Alert } from '@/types';
import { SAFETY_CONFIG } from './safety';
import type { SafetyCategory } from '@/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function sendParentAlert(alert: Alert): Promise<void> {
  const config = SAFETY_CONFIG[alert.category as Exclude<SafetyCategory, 'NONE'>];
  if (!config) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${config.icon} Edubudy — ${config.label}`,
      body: `${alert.childName} a mentionné quelque chose d'important. Ouvrez l'espace parent.`,
      data: { alertId: alert.id, screen: 'parent' },
      sound: true,
      badge: 1,
    },
    trigger: null,
  });
}
