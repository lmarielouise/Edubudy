// Thin wrapper — redirige vers Neon DB
export { dbGetAlerts as readAlerts, dbSaveAlert as saveAlert, dbAcknowledgeAlert as acknowledgeAlert, dbGetUnreadCount as getUnacknowledgedCount } from './db';
