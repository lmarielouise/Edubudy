import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getChatResponse, runSafetyCheck } from '@/lib/claude';
import { getParentAdviceForCategory, buildChildSafetyResponse } from '@/lib/safety';
import { saveAlert } from '@/lib/storage';
import { sendAlertEmail, sendWebhookAlert } from '@/lib/notifications';
import { readSettings } from '@/lib/settings';
import { validateApiSecret, unauthorized } from '@/lib/auth';
import { initDb } from '@/lib/db';
import type { ChatRequest, ChatResponse, SafetyCategory, Alert } from '@/types';

export async function POST(req: NextRequest): Promise<NextResponse<ChatResponse>> {
  if (!validateApiSecret(req)) return unauthorized() as NextResponse<ChatResponse>;

  const body = (await req.json()) as ChatRequest;
  const { message, history } = body;
  if (!message?.trim()) return NextResponse.json({ reply: "Je n'ai pas compris. Peux-tu réessayer ?" });

  await initDb();
  const s = readSettings();

  const [safetyResult, chatReply] = await Promise.all([
    runSafetyCheck(message),
    getChatResponse(message, history, s.childName, s.childAge, s.schoolLevel),
  ]);

  if (safetyResult.flagged && safetyResult.category !== 'NONE') {
    const category = safetyResult.category as Exclude<SafetyCategory, 'NONE'>;
    const adviceData = getParentAdviceForCategory(category);
    const safeReply = buildChildSafetyResponse(category, s.childName);

    const alert: Alert = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      category,
      severity: adviceData.severity,
      triggerMessage: message,
      childName: s.childName,
      parentAdvice: adviceData.parentAdvice,
      resources: adviceData.resources,
      acknowledged: false,
    };

    await saveAlert(alert);
    Promise.all([sendAlertEmail(alert), sendWebhookAlert(alert)]).catch(console.error);
    return NextResponse.json({ reply: safeReply, safetyFlag: category });
  }

  return NextResponse.json({ reply: chatReply });
}
