import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getChatResponse, runSafetyCheck } from '@/lib/claude';
import { getParentAdviceForCategory, buildChildSafetyResponse } from '@/lib/safety';
import { saveAlert } from '@/lib/storage';
import { sendAlertEmail, sendWebhookAlert } from '@/lib/notifications';
import type { ChatRequest, ChatResponse, SafetyCategory, Alert } from '@/types';

function getAppConfig() {
  return {
    childName: process.env.CHILD_NAME ?? 'Mon enfant',
    childAge: parseInt(process.env.CHILD_AGE ?? '10'),
    schoolLevel: (process.env.CHILD_SCHOOL_LEVEL ?? 'CM2') as Parameters<typeof getChatResponse>[4],
  };
}

export async function POST(req: NextRequest): Promise<NextResponse<ChatResponse>> {
  const body = (await req.json()) as ChatRequest;
  const { message, history } = body;

  if (!message?.trim()) {
    return NextResponse.json({ reply: 'Je n\'ai pas compris ta question. Peux-tu réessayer ?' });
  }

  const config = getAppConfig();

  const [safetyResult, chatReply] = await Promise.all([
    runSafetyCheck(message),
    getChatResponse(message, history, config.childName, config.childAge, config.schoolLevel),
  ]);

  if (safetyResult.flagged && safetyResult.category !== 'NONE') {
    const category = safetyResult.category as Exclude<SafetyCategory, 'NONE'>;
    const adviceData = getParentAdviceForCategory(category);
    const safeReply = buildChildSafetyResponse(category, config.childName);

    const alert: Alert = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      category,
      severity: adviceData.severity,
      triggerMessage: message,
      childName: config.childName,
      parentAdvice: adviceData.parentAdvice,
      resources: adviceData.resources,
      acknowledged: false,
    };

    saveAlert(alert);

    Promise.all([
      sendAlertEmail(alert),
      sendWebhookAlert(alert),
    ]).catch((err) => console.error('[Edubudy] Notification error:', err));

    return NextResponse.json({
      reply: safeReply,
      safetyFlag: category,
    });
  }

  return NextResponse.json({ reply: chatReply });
}
