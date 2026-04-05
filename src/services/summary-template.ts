/**
 * Professional HTML email template for weekly/daily/monthly summaries
 * Includes visual charts using CSS-only techniques (email-compatible)
 */

interface SummaryData {
  businessName: string
  logoUrl?: string | null
  primaryColor?: string
  period: string // 'יומי' | 'שבועי' | 'חודשי'
  dateRange: string // e.g. "29 מרץ — 5 אפריל 2026"
  kpis: {
    conversations: number
    messages: number
    escalations: number
    satisfaction: string
    autoRate: string // e.g. "92%"
    avgResponseTime: string // e.g. "1.2 שניות"
  }
  channels: {
    widget: number
    email: number
    whatsapp: number
  }
  topQuestions: Array<{ question: string; count: number }>
  sentiments: {
    positive: number
    neutral: number
    negative: number
    angry: number
  }
  insights: string[]
  recommendations: string[]
  isDemo?: boolean
}

function barWidth(value: number, max: number): number {
  if (max === 0) return 0
  return Math.round((value / max) * 100)
}

export function buildSummaryHtml(data: SummaryData): string {
  const color = data.primaryColor || '#3b82f6'
  const totalChannels = data.channels.widget + data.channels.email + data.channels.whatsapp
  const maxQuestion = data.topQuestions.length > 0 ? data.topQuestions[0].count : 1
  const totalSentiment = data.sentiments.positive + data.sentiments.neutral + data.sentiments.negative + data.sentiments.angry || 1

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>סיכום ${data.period} — ${data.businessName}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif;direction:rtl;">

<!-- Wrapper -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;">
<tr><td align="center" style="padding:32px 16px;">

<!-- Main Card -->
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08),0 8px 24px rgba(0,0,0,0.04);">

<!-- Header -->
<tr>
<td style="background:linear-gradient(135deg,${color},#6366f1);padding:32px 40px;text-align:center;">
  ${data.logoUrl ? `<img src="${data.logoUrl}" width="48" height="48" style="border-radius:12px;margin-bottom:12px;border:2px solid rgba(255,255,255,0.25);" alt="">` : ''}
  <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">${data.businessName}</h1>
  <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">סיכום ${data.period} · ${data.dateRange}</p>
</td>
</tr>

<!-- KPI Grid -->
<tr>
<td style="padding:32px 32px 24px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <!-- Conversations -->
    <td width="25%" style="text-align:center;padding:0 8px;">
      <div style="background:#eff6ff;border-radius:12px;padding:20px 12px;">
        <p style="margin:0;font-size:28px;font-weight:800;color:#1e293b;line-height:1;">${data.kpis.conversations}</p>
        <p style="margin:6px 0 0;font-size:12px;color:#64748b;font-weight:500;">שיחות</p>
      </div>
    </td>
    <!-- Messages -->
    <td width="25%" style="text-align:center;padding:0 8px;">
      <div style="background:#f0fdf4;border-radius:12px;padding:20px 12px;">
        <p style="margin:0;font-size:28px;font-weight:800;color:#1e293b;line-height:1;">${data.kpis.messages}</p>
        <p style="margin:6px 0 0;font-size:12px;color:#64748b;font-weight:500;">הודעות</p>
      </div>
    </td>
    <!-- Escalations -->
    <td width="25%" style="text-align:center;padding:0 8px;">
      <div style="background:#fef3c7;border-radius:12px;padding:20px 12px;">
        <p style="margin:0;font-size:28px;font-weight:800;color:#1e293b;line-height:1;">${data.kpis.escalations}</p>
        <p style="margin:6px 0 0;font-size:12px;color:#64748b;font-weight:500;">העברות לנציג</p>
      </div>
    </td>
    <!-- Satisfaction -->
    <td width="25%" style="text-align:center;padding:0 8px;">
      <div style="background:#faf5ff;border-radius:12px;padding:20px 12px;">
        <p style="margin:0;font-size:28px;font-weight:800;color:#1e293b;line-height:1;">${data.kpis.satisfaction}</p>
        <p style="margin:6px 0 0;font-size:12px;color:#64748b;font-weight:500;">שביעות רצון</p>
      </div>
    </td>
  </tr>
  </table>
</td>
</tr>

<!-- Performance Highlights -->
<tr>
<td style="padding:0 32px 28px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
  <tr>
    <td width="50%" style="padding:20px 24px;border-left:1px solid #e2e8f0;">
      <p style="margin:0;font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">אחוז מענה אוטומטי</p>
      <p style="margin:6px 0 0;font-size:24px;font-weight:800;color:#10b981;">${data.kpis.autoRate}</p>
    </td>
    <td width="50%" style="padding:20px 24px;">
      <p style="margin:0;font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">זמן תגובה ממוצע</p>
      <p style="margin:6px 0 0;font-size:24px;font-weight:800;color:${color};">${data.kpis.avgResponseTime}</p>
    </td>
  </tr>
  </table>
</td>
</tr>

<!-- Divider -->
<tr><td style="padding:0 32px;"><div style="height:1px;background:#e2e8f0;"></div></td></tr>

<!-- Channel Distribution Chart -->
<tr>
<td style="padding:28px 32px;">
  <h2 style="margin:0 0 20px;font-size:16px;font-weight:700;color:#1e293b;">חלוקה לפי ערוצים</h2>

  <!-- Widget -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
  <tr>
    <td width="80" style="font-size:13px;color:#64748b;padding-left:12px;">וידג׳ט</td>
    <td style="padding:0 12px;">
      <div style="background:#e2e8f0;border-radius:6px;height:24px;overflow:hidden;">
        <div style="background:${color};height:24px;border-radius:6px;width:${barWidth(data.channels.widget, totalChannels)}%;min-width:2px;"></div>
      </div>
    </td>
    <td width="40" style="font-size:13px;font-weight:700;color:#1e293b;text-align:left;">${data.channels.widget}</td>
  </tr>
  </table>

  <!-- Email -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
  <tr>
    <td width="80" style="font-size:13px;color:#64748b;padding-left:12px;">אימייל</td>
    <td style="padding:0 12px;">
      <div style="background:#e2e8f0;border-radius:6px;height:24px;overflow:hidden;">
        <div style="background:#8b5cf6;height:24px;border-radius:6px;width:${barWidth(data.channels.email, totalChannels)}%;min-width:2px;"></div>
      </div>
    </td>
    <td width="40" style="font-size:13px;font-weight:700;color:#1e293b;text-align:left;">${data.channels.email}</td>
  </tr>
  </table>

  <!-- WhatsApp -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td width="80" style="font-size:13px;color:#64748b;padding-left:12px;">וואטסאפ</td>
    <td style="padding:0 12px;">
      <div style="background:#e2e8f0;border-radius:6px;height:24px;overflow:hidden;">
        <div style="background:#10b981;height:24px;border-radius:6px;width:${barWidth(data.channels.whatsapp, totalChannels)}%;min-width:2px;"></div>
      </div>
    </td>
    <td width="40" style="font-size:13px;font-weight:700;color:#1e293b;text-align:left;">${data.channels.whatsapp}</td>
  </tr>
  </table>
</td>
</tr>

<!-- Divider -->
<tr><td style="padding:0 32px;"><div style="height:1px;background:#e2e8f0;"></div></td></tr>

<!-- Sentiment Chart -->
<tr>
<td style="padding:28px 32px;">
  <h2 style="margin:0 0 20px;font-size:16px;font-weight:700;color:#1e293b;">ניתוח רגש</h2>

  <!-- Stacked bar -->
  <div style="background:#e2e8f0;border-radius:8px;height:32px;overflow:hidden;display:flex;">
    <div style="background:#10b981;height:32px;width:${Math.round((data.sentiments.positive/totalSentiment)*100)}%;display:inline-block;"></div>
    <div style="background:#94a3b8;height:32px;width:${Math.round((data.sentiments.neutral/totalSentiment)*100)}%;display:inline-block;"></div>
    <div style="background:#f59e0b;height:32px;width:${Math.round((data.sentiments.negative/totalSentiment)*100)}%;display:inline-block;"></div>
    <div style="background:#ef4444;height:32px;width:${Math.round((data.sentiments.angry/totalSentiment)*100)}%;display:inline-block;"></div>
  </div>

  <!-- Legend -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
  <tr>
    <td style="font-size:12px;color:#64748b;padding:4px 0;">
      <span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#10b981;margin-left:6px;vertical-align:middle;"></span>
      חיובי ${data.sentiments.positive}%
    </td>
    <td style="font-size:12px;color:#64748b;padding:4px 0;">
      <span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#94a3b8;margin-left:6px;vertical-align:middle;"></span>
      ניטרלי ${data.sentiments.neutral}%
    </td>
    <td style="font-size:12px;color:#64748b;padding:4px 0;">
      <span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#f59e0b;margin-left:6px;vertical-align:middle;"></span>
      שלילי ${data.sentiments.negative}%
    </td>
    <td style="font-size:12px;color:#64748b;padding:4px 0;">
      <span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#ef4444;margin-left:6px;vertical-align:middle;"></span>
      כועס ${data.sentiments.angry}%
    </td>
  </tr>
  </table>
</td>
</tr>

<!-- Divider -->
<tr><td style="padding:0 32px;"><div style="height:1px;background:#e2e8f0;"></div></td></tr>

<!-- Top Questions -->
<tr>
<td style="padding:28px 32px;">
  <h2 style="margin:0 0 20px;font-size:16px;font-weight:700;color:#1e293b;">שאלות נפוצות</h2>

  ${data.topQuestions.map((q, i) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
  <tr>
    <td width="28" style="vertical-align:top;">
      <div style="width:24px;height:24px;border-radius:6px;background:${i === 0 ? color : '#f1f5f9'};color:${i === 0 ? '#fff' : '#64748b'};font-size:12px;font-weight:700;text-align:center;line-height:24px;">
        ${i + 1}
      </div>
    </td>
    <td style="padding:0 12px;vertical-align:middle;">
      <p style="margin:0;font-size:14px;color:#1e293b;">${q.question}</p>
      <div style="background:#e2e8f0;border-radius:4px;height:6px;margin-top:6px;overflow:hidden;">
        <div style="background:${color};opacity:${1 - i * 0.15};height:6px;border-radius:4px;width:${barWidth(q.count, maxQuestion)}%;"></div>
      </div>
    </td>
    <td width="50" style="font-size:13px;font-weight:600;color:#64748b;text-align:left;vertical-align:middle;">
      ${q.count}x
    </td>
  </tr>
  </table>
  `).join('')}
</td>
</tr>

<!-- Divider -->
<tr><td style="padding:0 32px;"><div style="height:1px;background:#e2e8f0;"></div></td></tr>

<!-- Insights -->
<tr>
<td style="padding:28px 32px;">
  <h2 style="margin:0 0 16px;font-size:16px;font-weight:700;color:#1e293b;">
    <span style="display:inline-block;width:20px;height:20px;background:#eff6ff;border-radius:6px;text-align:center;line-height:20px;font-size:11px;margin-left:8px;vertical-align:middle;">💡</span>
    תובנות
  </h2>
  ${data.insights.map(insight => `
  <p style="margin:0 0 10px;font-size:14px;color:#334155;line-height:1.6;padding-right:28px;position:relative;">
    <span style="position:absolute;right:0;top:2px;color:${color};font-weight:bold;">•</span>
    ${insight}
  </p>
  `).join('')}
</td>
</tr>

<!-- Recommendations -->
<tr>
<td style="padding:0 32px 32px;">
  <div style="background:linear-gradient(135deg,#eff6ff,#f5f3ff);border-radius:12px;padding:24px;border:1px solid #dbeafe;">
    <h3 style="margin:0 0 14px;font-size:15px;font-weight:700;color:#1e293b;">
      <span style="margin-left:6px;">🎯</span> המלצות לשבוע הבא
    </h3>
    ${data.recommendations.map((rec, i) => `
    <p style="margin:0 0 8px;font-size:13px;color:#475569;line-height:1.6;padding-right:24px;position:relative;">
      <span style="position:absolute;right:0;top:0;font-size:13px;font-weight:700;color:${color};">${i + 1}.</span>
      ${rec}
    </p>
    `).join('')}
  </div>
</td>
</tr>

<!-- Footer -->
<tr>
<td style="background:#f8fafc;padding:24px 32px;border-top:1px solid #e2e8f0;text-align:center;">
  ${data.isDemo ? '<p style="margin:0 0 8px;font-size:12px;color:#f59e0b;font-weight:600;">זה סיכום לדוגמה — הסיכום האמיתי ייווצר מהנתונים שלך</p>' : ''}
  <p style="margin:0;font-size:12px;color:#94a3b8;">סיכום אוטומטי מ-BotPress AI · ${data.businessName}</p>
</td>
</tr>

</table>
<!-- End Main Card -->

</td></tr>
</table>
<!-- End Wrapper -->

</body>
</html>`
}
