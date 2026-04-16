import nodemailer from 'nodemailer';
import type { Alert, SafetyCategory } from '@/types';

const CATEGORY_LABELS: Record<Exclude<SafetyCategory, 'NONE'>, string> = {
  HARCELEMENT: '🟠 Harcèlement scolaire',
  AGRESSION_SEXUELLE: '🔴 Agression sexuelle / Attouchement',
  IDEATION_SUICIDAIRE: '🔴 Idéation suicidaire',
  VIOLENCE: '🟠 Violence',
  DETRESSE_EMOTIONNELLE_SEVERE: '🟡 Détresse émotionnelle sévère',
};

const SEVERITY_LABELS = {
  LOW: 'Faible',
  MEDIUM: 'Moyen',
  HIGH: 'Élevé',
  CRITICAL: '⚠️ CRITIQUE',
};

function buildEmailHtml(alert: Alert): string {
  const categoryLabel = CATEGORY_LABELS[alert.category as Exclude<SafetyCategory, 'NONE'>];
  const severityLabel = SEVERITY_LABELS[alert.severity];
  const date = new Date(alert.timestamp).toLocaleString('fr-FR');

  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><style>
  body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; }
  .header { background: ${alert.severity === 'CRITICAL' ? '#dc2626' : alert.severity === 'HIGH' ? '#ea580c' : '#d97706'}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
  .body { padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
  .label { font-weight: bold; color: #6b7280; font-size: 12px; text-transform: uppercase; margin-top: 16px; }
  .value { margin-top: 4px; padding: 10px; background: #f9fafb; border-radius: 4px; }
  .advice { margin-top: 16px; padding: 16px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px; white-space: pre-line; line-height: 1.6; }
  .resources { margin-top: 16px; padding: 16px; background: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 4px; }
  .resources ul { margin: 8px 0 0 0; padding-left: 20px; }
  .footer { margin-top: 20px; font-size: 12px; color: #9ca3af; text-align: center; }
</style></head>
<body>
  <div class="header">
    <h1 style="margin:0;font-size:20px;">⚠️ Edubudy — Alerte pour ${alert.childName}</h1>
    <p style="margin:8px 0 0 0;opacity:0.9;">${categoryLabel} — Niveau : ${severityLabel}</p>
  </div>
  <div class="body">
    <div class="label">Date et heure</div>
    <div class="value">${date}</div>

    <div class="label">Message qui a déclenché l'alerte</div>
    <div class="value" style="font-style:italic;">"${alert.triggerMessage}"</div>

    <div class="label">Conseils pour vous en tant que parent</div>
    <div class="advice">${alert.parentAdvice}</div>

    <div class="label">Ressources disponibles</div>
    <div class="resources">
      <strong>Contacts et ressources utiles :</strong>
      <ul>
        ${alert.resources.map((r) => `<li>${r}</li>`).join('')}
      </ul>
    </div>

    <div class="footer">
      <p>Cette alerte a été générée automatiquement par Edubudy.<br>
      Elle ne remplace pas une évaluation par un professionnel de santé ou de l'éducation.</p>
      <p>Consultez le tableau de bord parent pour plus de détails.</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendAlertEmail(alert: Alert): Promise<void> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, PARENT_EMAIL } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !PARENT_EMAIL) {
    console.warn('[Edubudy] Email not configured — alert saved locally only');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT ?? '587'),
    secure: parseInt(SMTP_PORT ?? '587') === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const categoryLabel = CATEGORY_LABELS[alert.category as Exclude<SafetyCategory, 'NONE'>];

  await transporter.sendMail({
    from: SMTP_FROM ?? SMTP_USER,
    to: PARENT_EMAIL,
    subject: `⚠️ Edubudy — Alerte ${categoryLabel} pour ${alert.childName}`,
    html: buildEmailHtml(alert),
    text: `ALERTE EDUBUDY\n\nCatégorie : ${categoryLabel}\nEnfant : ${alert.childName}\nDate : ${new Date(alert.timestamp).toLocaleString('fr-FR')}\n\nMessage : "${alert.triggerMessage}"\n\nConseils :\n${alert.parentAdvice}\n\nRessources :\n${alert.resources.join('\n')}`,
  });
}

export async function sendWebhookAlert(alert: Alert): Promise<void> {
  const webhookUrl = process.env.ALERT_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `⚠️ Alerte Edubudy pour ${alert.childName} : ${CATEGORY_LABELS[alert.category as Exclude<SafetyCategory, 'NONE'>]}`,
        alert,
      }),
    });
  } catch (err) {
    console.error('[Edubudy] Webhook failed:', err);
  }
}
